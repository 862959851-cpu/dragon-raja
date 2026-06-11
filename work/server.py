#!/usr/bin/env python3
"""卡塞尔学院录取通知书生成器 - HTTP server"""

import os
import json
import uuid
import subprocess
import string
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse

WORK_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(WORK_DIR, 'outputs')
TEMPLATE_PATH = os.path.join(WORK_DIR, 'template.tex')
TECTONIC = '/Users/yqin/.codex/plugins/cache/openai-bundled/latex/0.2.2/bin/tectonic'

os.makedirs(OUTPUT_DIR, exist_ok=True)


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

    subprocess.run(
        [TECTONIC, '-X', 'compile', '--outdir', tmp_dir, '--outfmt', 'pdf', tex_path],
        capture_output=True, timeout=60, cwd=tmp_dir
    )

    if not os.path.exists(pdf_path):
        raise RuntimeError('PDF generation failed')

    final_name = f'cassell_admission_{nickname}.pdf'
    final_path = os.path.join(tmp_dir, final_name)
    os.rename(pdf_path, final_path)

    return final_path, final_name


class CassellHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORK_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/generate':
            try:
                length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(length)
                data = json.loads(body)

                if not data.get('nickname') or not data.get('skill'):
                    self._json_error(400, '学员代号和言灵为必填项')
                    return

                pdf_path, pdf_name = generate_pdf(data)

                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf')
                self.send_header('Content-Disposition',
                                 f'attachment; filename="{pdf_name}"')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()

                with open(pdf_path, 'rb') as f:
                    self.wfile.write(f.read())

            except subprocess.TimeoutExpired:
                self._json_error(500, '编译超时，请重试')
            except Exception as e:
                print(f'Error: {e}')
                self._json_error(500, '生成失败，请重试')

        elif self.path == '/test':
            self.send_json({'ok': True, 'status': 'cassell-online'})

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
    port = 3456
    server = HTTPServer(('', port), CassellHandler)
    print(f'[Cassell] 卡塞尔学院录取通知书生成器 → http://localhost:{port}')
    server.serve_forever()
