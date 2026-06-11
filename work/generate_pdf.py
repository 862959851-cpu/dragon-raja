#!/usr/bin/env python3
"""卡塞尔学院录取通知书 - 命令行生成器
用法: python3 generate_pdf.py --nickname 路明非 --skill "言灵·不要死" --zodiac 双鱼座 --dept "执行部预备系" --hobby "吃火锅"
"""
import argparse
import os
import uuid
import subprocess

WORK_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_PATH = os.path.join(WORK_DIR, 'template.tex')
TECTONIC = '/Users/yqin/.codex/plugins/cache/openai-bundled/latex/0.2.2/bin/tectonic'

def sanitize(s):
    return ''.join(c for c in s if c not in '\\{}%$#&^_~')

def main():
    parser = argparse.ArgumentParser(description='卡塞尔学院录取通知书生成器')
    parser.add_argument('--nickname', required=True, help='学员代号')
    parser.add_argument('--skill', default='言灵·天演', help='言灵')
    parser.add_argument('--zodiac', default='天蝎座', help='星座')
    parser.add_argument('--dept', default='龙族系谱学系', help='院系')
    parser.add_argument('--hobby', default='龙族研究', help='爱好')
    parser.add_argument('--num', default=None, help='编号')
    parser.add_argument('--output', default=None, help='输出路径')
    args = parser.parse_args()

    with open(TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        tex = f.read()

    num = args.num or str(uuid.uuid4().int % 9000 + 1000)

    tex = tex.replace('CPLACENICKNAME', sanitize(args.nickname))
    tex = tex.replace('CPLACESKILL', sanitize(args.skill))
    tex = tex.replace('CPLACEZODIAC', sanitize(args.zodiac))
    tex = tex.replace('CPLACEDEPT', sanitize(args.dept))
    tex = tex.replace('CPLACEHOBBY', sanitize(args.hobby))
    tex = tex.replace('CPLACENUM', str(num))

    out_dir = os.path.join(WORK_DIR, 'outputs', uuid.uuid4().hex[:12])
    os.makedirs(out_dir, exist_ok=True)
    tex_path = os.path.join(out_dir, 'admission.tex')
    
    with open(tex_path, 'w', encoding='utf-8') as f:
        f.write(tex)

    print(f'[Cassell] 编译中...')
    subprocess.run(
        [TECTONIC, '-X', 'compile', '--outdir', out_dir, '--outfmt', 'pdf', tex_path],
        capture_output=True, timeout=60
    )

    pdf_path = os.path.join(out_dir, 'admission.pdf')
    if os.path.exists(pdf_path):
        final_name = args.output or f'卡塞尔学院录取通知书_{sanitize(args.nickname)}.pdf'
        final_path = os.path.join(out_dir, final_name)
        os.rename(pdf_path, final_path)
        print(f'[Cassell] 录取通知书已生成: {final_path}')
    else:
        print('[Cassell] PDF 生成失败')

if __name__ == '__main__':
    main()
