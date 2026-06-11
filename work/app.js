// ===== 言灵生成逻辑 =====
const SKILL_MAP = {
  '白羊座': { skill: '君焰', desc: '以灼热的龙炎焚烧一切阻碍，勇往直前，无所畏惧。血统评级：S级', element: '火' },
  '金牛座': { skill: '王权', desc: '以不可撼动的龙威镇压四方，万物臣服于绝对的力量之下。血统评级：S级', element: '地' },
  '双子座': { skill: '镜瞳', desc: '洞察万物本质，解析一切法则。千面窥镜，无所遁形。血统评级：SS级', element: '风' },
  '巨蟹座': { skill: '深血', desc: '血脉之力化为坚不可摧的守护之盾，以血为誓，至死不渝。血统评级：A级', element: '水' },
  '狮子座': { skill: '炽日', desc: '化身烈阳，万丈光芒所及之处尽为领域，普照亦能灼烧。血统评级：S级', element: '火' },
  '处女座': { skill: '天演', desc: '超凡的计算与推演能力，世间万物皆可量化、预测、掌控。血统评级：SS级', element: '风' },
  '天秤座': { skill: '涡', desc: '操控气流与漩涡之力，在平衡中蕴藏毁灭，优雅而致命。血统评级：A级', element: '风' },
  '天蝎座': { skill: '镰鼬', desc: '超感听觉与极速反应，无形之风即是你的耳目与利刃。血统评级：S级', element: '风' },
  '射手座': { skill: '时间零', desc: '在静止的时光中自由穿行，于刹那之间决定胜负。血统评级：SS级', element: '时' },
  '摩羯座': { skill: '阴雷', desc: '沉默中酝酿雷霆一击，声波与震荡的完美操控者。血统评级：A级', element: '地' },
  '水瓶座': { skill: '先知', desc: '窥见时间长河的碎片，预知命运的走向。知识即力量。血统评级：SS级', element: '时' },
  '双鱼座': { skill: '不要死', desc: '以龙血之力逆转生死，治愈一切的温柔与决绝。血统评级：SSS级', element: '水' },
};

const HOBBY_MODIFIERS = [
  { keywords: ['火','锅','辣','烧烤','热','烤','炸','炒'], element: '火', alter: '烬', desc: '火焰共鸣' },
  { keywords: ['水','泳','冰','雪','冷','凉','海','游'], element: '水', alter: '渊', desc: '深海共鸣' },
  { keywords: ['剑','刀','武','拳','斗','击','战'], element: '金', alter: '锋', desc: '兵刃共鸣' },
  { keywords: ['书','读','学','研','究','知','文'], element: '风', alter: '智', desc: '知识共鸣' },
  { keywords: ['音','乐','歌','琴','鼓','声','舞'], element: '风', alter: '律', desc: '音律共鸣' },
  { keywords: ['球','跑','跳','动','体'], element: '地', alter: '撼', desc: '力量共鸣' },
  { keywords: ['画','绘','艺','影','摄','美','设'], element: '水', alter: '幻', desc: '幻象共鸣' },
  { keywords: ['机','械','车','驾','模','码','编'], element: '金', alter: '械', desc: '机械共鸣' },
  { keywords: ['食','吃','味','甜','烹','厨'], element: '火', alter: '炊', desc: '生命共鸣' },
  { keywords: ['龙','族','魔','幻','奇','怪','异'], element: '时', alter: '玄', desc: '神秘共鸣' },
  { keywords: ['星','空','天','宇','宙','航'], element: '时', alter: '星', desc: '星穹共鸣' },
  { keywords: ['草','花','树','自','然','园','林'], element: '地', alter: '森', desc: '自然共鸣' },
];

function generateSkill(zodiac, hobby) {
  const base = SKILL_MAP[zodiac] || SKILL_MAP['天蝎座'];
  const hobbyText = (hobby || '').toLowerCase();
  let matchedMod = null, maxScore = 0;
  for (const mod of HOBBY_MODIFIERS) {
    const score = mod.keywords.filter(kw => hobbyText.includes(kw)).length;
    if (score > maxScore) { maxScore = score; matchedMod = mod; }
  }
  if (matchedMod && maxScore > 0 && matchedMod.element !== base.element) {
    return { skill: `言灵·${base.skill}·${matchedMod.alter}`, desc: `${base.desc} | ${matchedMod.desc} · 双属性觉醒`, element: `${base.element}+${matchedMod.element}` };
  }
  return { skill: `言灵·${base.skill}`, desc: base.desc, element: base.element };
}

// ===== 表单交互 =====
function updateSkill() {
  const zodiac = document.getElementById('zodiac').value;
  const hobby = document.getElementById('hobby').value;
  const result = generateSkill(zodiac, hobby);
  document.getElementById('skillName').textContent = result.skill;
  document.getElementById('skillDesc').textContent = result.desc;
  document.getElementById('skill').value = result.skill;
  document.getElementById('skillDisplay').style.display = 'block';
}

// Event listeners
document.getElementById('zodiac').addEventListener('change', updateSkill);
document.getElementById('hobby').addEventListener('input', updateSkill);
document.getElementById('nickname').addEventListener('input', updateSkill);
document.getElementById('dept').addEventListener('change', updateSkill);

// Download .tex
const form = document.getElementById('admissionForm');
const generateBtn = document.getElementById('generateBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nickname = document.getElementById('nickname').value.trim();
  if (!nickname) { showError('请填写学员代号'); return; }

  updateSkill();
  const skill = document.getElementById('skill').value.trim();
  if (!skill) { showError('请填写爱好以觉醒言灵'); return; }

  generateBtn.classList.add('btn-loading');
  generateBtn.disabled = true;
  clearError();

  const data = {
    nickname,
    skill,
    zodiac: document.getElementById('zodiac').value,
    dept: document.getElementById('dept').value,
    hobby: document.getElementById('hobby').value.trim() || '龙族研究',
    num: Math.floor(Math.random() * 9000 + 1000)
  };

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      window.location.href = `/view.html?token=${json.token}`;
    } else {
      const err = await res.json().catch(() => ({ error: '服务器错误' }));
      showError(err.error || '生成失败，请重试');
    }
  } catch (e) {
    showError('网络错误，无法连接服务器');
  }

  generateBtn.classList.remove('btn-loading');
  generateBtn.disabled = false;
});

function showError(msg) {
  const existing = document.querySelector('.error-msg');
  if (existing) existing.remove();
  const el = document.createElement('p');
  el.className = 'error-msg';
  el.textContent = msg;
  generateBtn.parentNode.insertBefore(el, generateBtn.nextSibling);
}

function clearError() {
  const existing = document.querySelector('.error-msg');
  if (existing) existing.remove();
}

// ===== LaTeX Generator =====
function generateLatex(data) {
  return `% 卡塞尔学院录取通知书 - 由生成器创建
% 编译方式: tectonic -X compile --outfmt pdf this_file.tex
% 或: xelatex this_file.tex (需安装 TeX Live/MacTeX)
\\documentclass[12pt,a4paper]{article}
\\usepackage{xeCJK}
\\usepackage{fontspec}
\\usepackage{geometry}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{setspace}
\\setCJKmainfont{STSong}
\\setmainfont{Times New Roman}
\\geometry{a4paper, left=2.5cm, right=2.5cm, top=2.5cm, bottom=2.5cm}
\\definecolor{cassellGold}{RGB}{180,145,70}
\\definecolor{cassellDark}{RGB}{25,25,45}
\\definecolor{cassellRed}{RGB}{139,0,0}
\\definecolor{cassellPaper}{RGB}{248,242,230}
\\begin{document}
\\pagestyle{empty}
\\pagecolor{cassellPaper}
\\color{cassellDark}
% Header
\\begin{center}
\\begin{tikzpicture}
  \\draw[cassellGold!50,line width=0.5pt] (0,0) -- (15.5,0);
  \\draw[cassellGold,line width=1.2pt] (0,0.13) -- (15.5,0.13);
\\end{tikzpicture}
\\vspace{0.4cm}
\\begin{tikzpicture}
  \\draw[cassellGold,fill=cassellGold!8] (0,0) circle (1.1cm);
  \\draw[cassellGold,line width=0.8pt] (0,0) circle (0.95cm);
  \\node at (0,0.2) {\\Huge\\bfseries\\color{cassellGold} 龍};
  \\node at (0,-0.3) {\\small\\itshape\\color{cassellGold} Draconis};
  \\node at (0,-0.65) {\\footnotesize\\itshape\\color{cassellGold} Aeternum};
\\end{tikzpicture}
\\vspace{0.4cm}
{\\Huge\\bfseries\\color{cassellDark} 卡塞尔学院}\\\\[0.05cm]
{\\large\\itshape\\color{cassellGold} Cassell College}\\\\[0.05cm]
{\\small\\color{cassellDark!60} \\itshape "Per Aspera Ad Astra" --- 穿越逆境，抵达星辰}
\\vspace{0.2cm}
\\begin{tikzpicture}
  \\draw[cassellGold,line width=1.2pt] (0,0) -- (15.5,0);
  \\draw[cassellGold!50,line width=0.5pt] (0,-0.13) -- (15.5,-0.13);
\\end{tikzpicture}
\\end{center}
\\vspace{0.3cm}
\\begin{flushright}
  {\\small\\textbf{编号：} CSL-2026-${data.num}}\\\\[0.1cm]
  {\\small\\textbf{日期：} \\today}
\\end{flushright}
\\vspace{0.4cm}
{\\large\\textbf{致 ${sanitize(data.nickname)} 同学：}}
\\vspace{0.5cm}
\\begin{onehalfspace}\\setlength{\\parindent}{2em}
恭贺你！经卡塞尔学院执行部与秘党长老会联合审核，我们非常高兴地通知你，你已通过最终遴选，\\textbf{正式被卡塞尔学院录取}，进入 \\textbf{${sanitize(data.dept)}} 学习。
\\vspace{0.2cm}
卡塞尔学院坐落于美国伊利诺伊州芝加哥远郊，是一所拥有超过百年历史的私立研究型大学。我们致力于探索与传承人类文明中最为深邃的奥秘。
\\vspace{0.2cm}
你的体内流淌着非凡的血统，这是与生俱来的天赋，也是无法推卸的责任。
\\end{onehalfspace}
\\vspace{0.3cm}
\\begin{center}
\\begin{tikzpicture}
  \\draw[cassellRed!15,fill=cassellRed!5,rounded corners=4pt] (0,0) rectangle (13,-1.6);
  \\draw[cassellRed!35,line width=0.7pt,rounded corners=4pt] (0,0) rectangle (13,-1.6);
  \\node[cassellRed!80,anchor=north west] at (0.5,-0.35) {\\large\\bfseries 言灵觉醒};
  \\draw[cassellRed!15,line width=0.4pt] (0.5,-0.7) -- (12.5,-0.7);
  \\node[cassellRed!90,anchor=north west] at (0.5,-1.15) {\\Large\\bfseries ${sanitize(data.skill)}};
\\end{tikzpicture}
\\end{center}
\\vspace{0.3cm}
\\begin{center}
\\begin{tikzpicture}
  \\draw[cassellGold!30,fill=cassellGold!5,rounded corners=3pt] (0,0) rectangle (15.5,-5.2);
  \\draw[cassellGold!70,line width=1.0pt,rounded corners=3pt] (0,0) rectangle (15.5,-5.2);
  \\node[cassellDark,anchor=north west] at (0.5,-0.45) {\\large\\bfseries 学员档案};
  \\draw[cassellGold!25,line width=0.4pt] (0.5,-0.75) -- (15,-0.75);
  \\node[cassellDark,anchor=north west] at (0.8,-1.35) {\\textbf{学员代号：}};
  \\node[cassellDark!80,anchor=north west] at (6.5,-1.35) {\\textbf{${sanitize(data.nickname)}}};
  \\node[cassellDark,anchor=north west] at (0.8,-2.15) {\\textbf{言灵：}};
  \\node[cassellDark!80,anchor=north west] at (6.5,-2.15) {\\textbf{${sanitize(data.skill)}}};
  \\node[cassellDark,anchor=north west] at (0.8,-2.95) {\\textbf{星座：}};
  \\node[cassellDark!80,anchor=north west] at (6.5,-2.95) {\\textbf{${sanitize(data.zodiac)}}};
  \\node[cassellDark,anchor=north west] at (0.8,-3.75) {\\textbf{爱好：}};
  \\node[cassellDark!80,anchor=north west] at (6.5,-3.75) {\\textbf{${sanitize(data.hobby)}}};
  \\node[cassellDark,anchor=north west] at (0.8,-4.55) {\\textbf{所属院系：}};
  \\node[cassellDark!80,anchor=north west] at (6.5,-4.55) {\\textbf{${sanitize(data.dept)}}};
\\end{tikzpicture}
\\end{center}
\\vspace{0.3cm}
\\begin{onehalfspace}\\setlength{\\parindent}{2em}
希望你在未来的学习与历练中，以龙血为引，以勇气为剑，守护我们所珍视的一切。校长希尔伯特·让·昂热，以及全体执行部导师，期待在芝加哥校区与你相见。
\\end{onehalfspace}
\\vspace{0.6cm}
\\begin{minipage}{0.55\\textwidth}
  \\textbf{卡塞尔学院 执行部}\\\\[0.1cm]
  \\textbf{秘党长老会 联合签发}
\\end{minipage}
\\begin{minipage}{0.4\\textwidth}
  \\begin{flushright}
    \\begin{tikzpicture}
      \\draw[cassellRed!70,line width=1.5pt,rotate=15] (0,0) circle (1cm);
      \\draw[cassellRed!70,line width=0.6pt,rotate=15] (0,0) circle (0.85cm);
      \\node[rotate=15,cassellRed!70] at (0,0.3) {\\small 录取};
      \\node[rotate=15,cassellRed!70] at (0,-0.15) {\\footnotesize 专用章};
    \\end{tikzpicture}
    \\vspace{0.2cm}
    \\textbf{校长：希尔伯特·让·昂热}\\\\[0.05cm]
    \\itshape\\small Hilbert Jean Angers
  \\end{flushright}
\\end{minipage}
\\vspace{0.8cm}
\\begin{center}
\\begin{tikzpicture}
  \\draw[cassellGold!25,line width=0.4pt] (0,0) -- (15.5,0);
  \\node[cassellGold!45,above,font=\\tiny] at (7.75,0.08) {\\textbf{CASSELL COLLEGE} | 秘而不宣 · 龙血永燃};
\\end{tikzpicture}
\\end{center}
\\end{document}`;
}

function sanitize(s) {
  return String(s).replace(/[\\\\{}%$#&^_~]/g, '').trim();
}

// Init
setTimeout(updateSkill, 100);
