#!/usr/bin/env python3
"""卡塞尔学院录取通知书生成器 - 云部署版本"""

import os, sys, json, uuid, subprocess, secrets, time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

WORK_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(WORK_DIR, 'outputs')
TEMPLATE_PATH = os.path.join(WORK_DIR, 'template.tex')

# In Docker, 'tectonic' is on PATH; locally use the bundled one
TECTONIC = 'tectonic'
if not os.system('which tectonic > /dev/null 2>&1') == 0:
    bundled = os.path.join(WORK_DIR, '..', 'bin', 'tectonic')
    if os.path.exists(bundled):
        TECTONIC = bundled

os.makedirs(OUTPUT_DIR, exist_ok=True)

# 临时存储生成的 PDF（token → {path, filename, time}）
_generated = {}
_TOKEN_EXPIRE = 3600  # 1 小时后清理

def _cleanup_tokens():
    now = time.time()
    expired = [k for k, v in _generated.items() if now - v['time'] > _TOKEN_EXPIRE]
    for k in expired:
        try:
            os.remove(_generated[k]['path'])
        except: pass
        del _generated[k]


def sanitize(s):
    return ''.join(c for c in s if c not in '\\{}%$#&^_~')


def generate_pdf(data):
    nickname = sanitize(data.get('nickname', ''))
    skill = sanitize(data.get('skill', ''))
    zodiac = sanitize(data.get('zodiac', '未知星域'))
    dept = sanitize(data.get('dept', '龙族系谱学系'))
    hobby = sanitize(data.get('hobby', '龙族研究'))
    num = data.get('num', str(uuid.uuid4().int % 9000 + 1000))

    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        tex = f.read()

    tex = tex.replace('CPLACENICKNAME', nickname)
    tex = tex.replace('CPLACESKILL', skill)
    tex = tex.replace('CPLACEZODIAC', zodiac)
    tex = tex.replace('CPLACEDEPT', dept)
    tex = tex.replace('CPLACEHOBBY', hobby)
    tex = tex.replace('CPLACENUM', str(num))

    out_id = uuid.uuid4().hex[:12]
    tmp_dir = os.path.join(OUTPUT_DIR, out_id)
    os.makedirs(tmp_dir, exist_ok=True)

    tex_path = os.path.join(tmp_dir, 'admission.tex')
    with open(tex_path, 'w', encoding='utf-8') as f:
        f.write(tex)

    pdf_path = os.path.join(tmp_dir, 'admission.pdf')
    result = subprocess.run(
        [TECTONIC, '-X', 'compile', '--outdir', tmp_dir, '--outfmt', 'pdf', tex_path],
        capture_output=True, timeout=120, cwd=tmp_dir
    )

    if result.returncode != 0 or not os.path.exists(pdf_path):
        log = result.stderr.decode()[-500:] if result.stderr else ''
        raise RuntimeError(f'Tectonic failed: {log}')

    final_name = f'cassell_admission_{nickname}.pdf'
    final_path = os.path.join(tmp_dir, final_name)
    os.rename(pdf_path, final_path)
    return final_path, final_name


class CassellHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORK_DIR, **kwargs)

    def do_GET(self):
        if self.path == '/test':
            return self.send_json({'ok': True, 'ready': True, 'server': 'cassell-college'})
        # 提供已生成的 PDF 文件
        parsed = urlparse(self.path)
        if parsed.path.startswith('/pdf/'):
            token = parsed.path.split('/pdf/')[1]
            entry = _generated.get(token)
            if entry:
                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf')
                self.send_header('Content-Disposition', f'inline; filename="{entry["name"]}"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(entry['path'], 'rb') as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain;charset=utf-8')
                self.end_headers()
                self.wfile.write(b'PDF not found or expired')
                return
        return super().do_GET()

    def do_POST(self):
        if self.path == '/generate':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body)

                if not data.get('nickname') or not data.get('skill'):
                    return self._json_error(400, '学员代号和言灵为必填项')

                pdf_path, pdf_name = generate_pdf(data)

                # 生成 token 并存储
                _cleanup_tokens()
                token = secrets.token_hex(16)
                _generated[token] = {'path': pdf_path, 'name': pdf_name, 'time': time.time()}
                self.send_json({'token': token, 'filename': pdf_name})

            except subprocess.TimeoutExpired:
                self._json_error(500, '编译超时，请重试')
            except Exception as e:
                print(f'Error: {e}', flush=True)
                self._json_error(500, f'生成失败: {str(e)[:100]}')
        else:
            self._json_error(404, 'Not found')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def send_json(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _json_error(self, code, msg):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'error': msg}).encode('utf-8'))


if __name__ == '__main__':
    port = int(os.environ.get('PORT', os.environ.get('RAILWAY_PORT', 8080)))
    host = os.environ.get('HOST', '0.0.0.0')
    server = HTTPServer((host, port), CassellHandler)
    print(f'[Cassell] Server on http://{host}:{port}', flush=True)
    server.serve_forever()
