// AI 工具模块
// 当前使用智能模板引擎，配置 API Key 后可切换为真实 AI

const { db } = require('../db');

const AI_API_KEY = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || '';
const AI_PROVIDER = process.env.AI_PROVIDER || 'template'; // 'openai' | 'anthropic' | 'template'

// ======================== 真实 AI 调用 ========================

async function callOpenAI(prompt, formatJson = true) {
  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  };
  if (formatJson) body.response_format = { type: 'json_object' };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${AI_API_KEY}` },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return formatJson ? JSON.parse(data.choices[0].message.content) : data.choices[0].message.content;
}

async function callClaude(prompt, formatJson = true) {
  const fullPrompt = formatJson ? prompt + '\n\n请严格按照 JSON 格式输出，不要包含其他内容。' : prompt;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: fullPrompt }]
    })
  });
  const data = await res.json();
  const text = data.content[0].text;
  return formatJson ? JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()) : text;
}

async function aiGenerate(prompt, formatJson = true) {
  if (AI_PROVIDER === 'openai' && AI_API_KEY) return callOpenAI(prompt, formatJson);
  if (AI_PROVIDER === 'anthropic' && AI_API_KEY) return callClaude(prompt, formatJson);
  return null; // 回退到模板
}

// ======================== 课后反馈生成 ========================

async function generateFeedback(params) {
  const { studentName, subject, courseNotes, previousFeedbacks } = params;

  // 尝试真实 AI
  if (AI_API_KEY) {
    const prompt = `你是一个经验丰富的家教老师。请为以下学生生成一份课后反馈。

学生姓名：${studentName}
科目：${subject}
本次课程内容：${courseNotes || '常规教学'}
${previousFeedbacks?.length ? `历史反馈摘要：${previousFeedbacks.slice(0, 3).map(f => `${f.title}: ${f.content}`).join('\n')}` : ''}

请生成 JSON：
{
  "title": "反馈标题",
  "content": "详细反馈正文（100-200字，语气亲切、具体、有温度）",
  "highlights": "学生表现亮点（一句概括）",
  "areas_to_improve": "需要加强的地方（一句概括）",
  "homework": "布置的课后作业",
  "rating": 4
}`;
    try {
      const result = await aiGenerate(prompt);
      if (result && result.title) return result;
    } catch (e) { console.log('AI 调用失败，使用模板:', e.message); }
  }

  // 智能模板
  return {
    title: `${studentName}的${subject}课后反馈`,
    content: `${studentName}本节课在${subject}方面表现不错，能够认真听讲并积极参与课堂互动。${courseNotes ? `本节课重点学习了${courseNotes}，` : ''}建议课后加强练习巩固。`,
    highlights: '上课专注度高，互动积极',
    areas_to_improve: '课后需要加强相关练习',
    homework: getDefaultHomework(subject),
    rating: 4
  };
}

// ======================== AI 自动备课 ========================

/**
 * 根据学生问题智能生成教案
 * @param {Object} params
 * @param {string} params.studentName - 学生姓名
 * @param {string} params.grade - 年级
 * @param {string} params.subject - 科目
 * @param {string} params.problems - 学生的问题/薄弱点
 * @param {string} params.goals - 教学目标（可选）
 * @param {number} params.duration - 课时长（分钟），默认 120
 * @param {Array} params.previousCourses - 历史课程记录
 * @returns {Object} 完整教案
 */
async function generateLessonPlan(params) {
  const {
    studentName = '学生',
    grade = '',
    subject = '数学',
    problems = '',
    goals = '',
    duration = 120, // 分钟
    previousCourses = [],
    teacherId = null  // 老师ID，用于匹配私有题库
  } = params;

  // 尝试真实 AI
  if (AI_API_KEY) {
    const prompt = `你是一位资深家教老师，年段：${grade}，科目：${subject}。请为一个学生设计一份个性化教案。

学生：${studentName}（${grade}）
当前问题/薄弱点：${problems || '需要系统学习'}
教学目标：${goals || '针对薄弱点进行突破'}
课时长：${duration} 分钟
${previousCourses?.length ? `最近教学内容：${previousCourses.map(c => `${c.subject}: ${c.notes || '已完成'}`).join('；')}` : ''}

请生成一份完整的 JSON 教案：
{
  "title": "教案标题（简洁有针对性）",
  "teachingObjectives": ["目标1", "目标2", "目标3"],
  "keyPoints": ["重点1", "重点2"],
  "difficultPoints": ["难点1"],
  "steps": [
    { "phase": "环节名称", "duration": 分钟数, "content": "具体教学内容和操作说明", "tips": "教学提示" }
  ],
  "exercises": [
    { "question": "练习题题目", "answer": "参考答案", "purpose": "考察什么知识点" }
  ],
  "summary": "课堂总结要点",
  "homework": "课后作业",
  "nextPreview": "下节课预告"
}`;
    try {
      const result = await aiGenerate(prompt);
      if (result && result.title) return result;
    } catch (e) { console.log('AI 调用失败，使用模板:', e.message); }
  }

  // ===== 智能模板引擎 =====
  return buildSmartLessonPlan(studentName, grade, subject, problems, goals, duration, previousCourses, teacherId);
}

function buildSmartLessonPlan(studentName, grade, subject, problems, goals, duration, previousCourses, teacherId) {
  // 根据科目和问题生成针对性教案
  const subjectConfig = getSubjectConfig(subject, grade);
  const problemsLower = (problems || '').toLowerCase();
  const halfDuration = Math.floor(duration / 2);
  const quarterDuration = Math.floor(duration / 4);

  // 分析问题中的关键词，匹配对应的教学重点
  const problemAnalysis = analyzeProblems(problems, subject, subjectConfig);

  const title = generateTitle(studentName, subject, problemAnalysis, grade);
  const teachingObjectives = generateObjectives(subject, problemAnalysis, grade);
  const { keyPoints, difficultPoints } = generateKeyAndDifficult(problemAnalysis, subjectConfig);
  const steps = generateSteps(studentName, subject, problemAnalysis, duration, halfDuration, quarterDuration);
  const exercises = generateExercises(subject, problemAnalysis, grade, subjectConfig, teacherId);
  const summary = generateSummary(subject, problemAnalysis, studentName);
  const homework = generateHomework(subject, problemAnalysis, subjectConfig);
  const nextPreview = generateNextPreview(subject, problemAnalysis, subjectConfig, grade);

  return {
    title,
    teachingObjectives,
    keyPoints,
    difficultPoints,
    steps,
    exercises,
    summary,
    homework,
    nextPreview
  };
}

function analyzeProblems(problems, subject, config) {
  if (!problems) return { type: '基础巩固', keywords: [], focusArea: config.defaultFocus };

  const lower = problems.toLowerCase();
  const keywords = [];
  let type = '基础巩固';

  // 问题类型关键词匹配
  const categoryMap = {
    '计算': ['计算', '算数', '算错', '粗心', '口算', '速算'],
    '理解': ['不懂', '不理解', '看不懂', '理解不了', '听不懂', '搞不清楚'],
    '记忆': ['记不住', '忘记', '背', '忘了', '记混', '混淆', '不记得'],
    '应用': ['不会做题', '不会做', '不会用', '用不来', '应用题', '大题'],
    '基础弱': ['基础', '差', '跟不上', '不会', '零基础', '薄弱'],
    '审题': ['审题', '看错', '漏看', '马虎', '粗心'],
    '速度': ['慢', '做不完', '来不及', '时间不够'],
    '考试': ['考试', '考不好', '分数', '成绩', '不及格', '及格'],
  };

  for (const [cat, words] of Object.entries(categoryMap)) {
    if (words.some(w => lower.includes(w))) {
      keywords.push(cat);
      if (!type || type === '基础巩固') type = cat;
    }
  }

  // 学科知识点关键词匹配（从题库中匹配相关话题）
  const topicKeywords = extractTopicKeywords(problems, subject);
  keywords.push(...topicKeywords);

  // 没有匹配到关键词 → 根据科目给默认
  if (keywords.length === 0) {
    type = '系统学习';
    keywords.push('系统学习');
  }

  const focusArea = type === '计算' ? `${config.calcTopic || '计算能力'}训练` :
    type === '理解' ? `${config.conceptTopic || '概念理解'}深化` :
    type === '记忆' ? `${config.memoryTopic || '知识点记忆'}方法` :
    type === '应用' ? `${config.applyTopic || '解题技巧'}应用` :
    type === '基础弱' ? `${config.basicTopic || '基础知识'}夯实` :
    type === '审题' ? '审题习惯与方法' :
    type === '速度' ? '解题速度与效率' :
    type === '考试' ? '应试技巧与心态' :
    config.defaultFocus;

  return { type, keywords, focusArea };
}

function extractTopicKeywords(problems, subject) {
  const kws = [];
  const lower = problems.toLowerCase();

  const subjectTopicMap = {
    '数学': ['二次函数', '一次函数', '勾股定理', '全等三角形', '相似三角形', '圆', '方程', '不等式',
      '因式分解', '分式', '函数', '概率', '统计', '向量', '数列', '导数', '集合', '对数',
      '指数', '三角函数', '立体几何', '解析几何', '复数', '排列组合', '有理数', '整式',
      '分数', '小数', '百分数', '比', '比例', '周长', '面积', '体积', '乘法', '除法'],
    '物理': ['速度', '密度', '压强', '浮力', '欧姆', '电功率', '焦耳', '牛顿', '摩擦力',
      '万有引力', '电场', '磁场', '安培力', '电磁感应', '动量', '能量', '功', '功率'],
    '英语': ['词汇', '语法', '完形', '阅读', '写作', '翻译', '听力', '口语', '单词',
      '时态', '从句', '被动语态', '虚拟语气', '倒装'],
    '语文': ['拼音', '汉字', '古诗', '文言文', '阅读理解', '作文', '成语', '病句',
      '修辞', '标点', '默写', '赏析'],
    '化学': ['方程式', '配平', '反应', '元素', '质量守恒', '物质的量', '浓度',
      '氧化还原', '酸碱', '有机', '官能团'],
  };

  const topics = subjectTopicMap[subject] || [];
  for (const t of topics) {
    if (lower.includes(t.toLowerCase())) {
      kws.push(t);
    }
  }

  return kws;
}

function getSubjectConfig(subject, grade) {
  const configs = {
    '数学': {
      defaultFocus: '数学思维与解题方法',
      calcTopic: '运算能力',
      conceptTopic: '数学概念',
      memoryTopic: '公式定理',
      applyTopic: '综合应用',
      basicTopic: '数学基础',
      warmupExample: '一道趣味数学题或生活中的数学问题',
      commonExercises: [
        { q: '计算下列各式的值（基础运算题×5）', a: '分步展示计算过程，强调易错点', purpose: '检验基础运算能力' },
        { q: '完成以下应用题（结合生活实际）', a: '先分析题意→找关键信息→列式→计算→检验', purpose: '考察知识应用能力' },
        { q: '找出下面题目中的错误并改正', a: '先找出错误步骤→分析错误原因→给出正确解法', purpose: '培养检查习惯和错题分析能力' },
      ]
    },
    '物理': {
      defaultFocus: '物理思维与实验分析',
      calcTopic: '物理计算',
      conceptTopic: '物理概念',
      memoryTopic: '公式定律',
      applyTopic: '综合应用',
      basicTopic: '物理基础',
      warmupExample: '一个有趣的物理现象或小实验',
      commonExercises: [
        { q: '完成以下基础计算题', a: '画受力分析图→列方程→求解→检验', purpose: '考察公式运用能力' },
        { q: '分析以下物理现象并解释原因', a: '观察现象→联系知识点→解释原理', purpose: '考察物理思维能力' },
        { q: '设计一个实验验证以下结论', a: '明确目的→选择器材→设计步骤→记录数据→得出结论', purpose: '考察实验设计能力' },
      ]
    },
    '英语': {
      defaultFocus: '英语综合能力',
      calcTopic: null,
      conceptTopic: '语法理解',
      memoryTopic: '词汇记忆',
      applyTopic: '听说读写',
      basicTopic: '英语基础',
      warmupExample: '一段简短的英语对话或小故事',
      commonExercises: [
        { q: '完成以下单词拼写与词义匹配', a: '先复习单词→独立完成→对照答案→错词标记', purpose: '检验词汇掌握情况' },
        { q: '阅读短文并回答问题', a: '快速浏览→细读→定位关键句→作答', purpose: '考察阅读理解能力' },
        { q: '根据提示写一段短文（5-8句）', a: '先列提纲→确定要点→逐句写作→检查语法', purpose: '考察写作表达能力' },
      ]
    },
    '语文': {
      defaultFocus: '语文综合素养',
      calcTopic: null,
      conceptTopic: '文本理解',
      memoryTopic: '古诗文背诵',
      applyTopic: '阅读写作',
      basicTopic: '语文基础',
      warmupExample: '一则名言警句或一个小故事',
      commonExercises: [
        { q: '阅读以下文章并完成阅读理解题', a: '通读全文→把握主旨→逐题定位→规范作答', purpose: '考察阅读理解能力' },
        { q: '根据以下主题写一段短文', a: '审题→构思→列提纲→写作→修改', purpose: '考察写作表达能力' },
        { q: '完成以下文言文翻译/古诗鉴赏', a: '逐句翻译→把握关键词→理解意境', purpose: '考察古诗文理解能力' },
      ]
    },
    '化学': {
      defaultFocus: '化学思维与方程式',
      calcTopic: '化学计算',
      conceptTopic: '化学概念',
      memoryTopic: '方程式与性质',
      applyTopic: '综合应用',
      basicTopic: '化学基础',
      warmupExample: '一个有趣的化学现象或生活中的化学知识',
      commonExercises: [
        { q: '写出以下反应的化学方程式并配平', a: '确定反应物与生成物→写化学式→配平→标注条件', purpose: '检验化学方程式掌握情况' },
        { q: '完成以下物质的鉴别/推断题', a: '回忆物质特性→设计实验→推理判断', purpose: '考察物质性质综合应用' },
        { q: '完成以下化学计算题', a: '分析题意→列出已知和未知→选择公式→计算→检验', purpose: '考察化学计算能力' },
      ]
    },
    '生物': {
      defaultFocus: '生物概念与实验',
      calcTopic: null,
      conceptTopic: '生物概念',
      memoryTopic: '知识点背诵',
      applyTopic: '综合应用',
      basicTopic: '生物基础',
      warmupExample: '一个有趣的生物现象或冷知识',
      commonExercises: [
        { q: '完成以下概念填空/选择题', a: '回忆知识点→逐一判断→确认答案', purpose: '检验基础知识掌握情况' },
        { q: '分析以下实验并回答问题', a: '明确实验目的→分析步骤→得出结论', purpose: '考察实验分析能力' },
      ]
    },
    '历史': {
      defaultFocus: '历史脉络与理解',
      warmupExample: '一个历史趣闻或人物故事',
      commonExercises: [
        { q: '梳理以下历史事件的时间线', a: '按时间排序→标注关键事件→分析因果关系', purpose: '考察历史时序把握能力' },
        { q: '分析以下历史材料并回答问题', a: '阅读材料→提取信息→联系所学→作答', purpose: '考察史料分析能力' },
      ]
    },
    '地理': {
      defaultFocus: '地理知识与读图',
      warmupExample: '一个地理奇观或气候现象',
      commonExercises: [
        { q: '读图回答问题（地形图/气候图等）', a: '看图例→定位→提取信息→作答', purpose: '考察读图分析能力' },
        { q: '分析以下地理现象的成因', a: '描述现象→分析因素→总结规律', purpose: '考察地理综合分析能力' },
      ]
    },
    '政治': {
      defaultFocus: '政治概念与时政',
      warmupExample: '一则时政新闻或社会热点',
      commonExercises: [
        { q: '结合材料分析以下社会现象', a: '阅读材料→联系知识点→多角度分析→组织答案', purpose: '考察综合分析能力' },
        { q: '完成以下知识点填空/选择', a: '回忆知识点→逐一作答', purpose: '检验基础知识掌握情况' },
      ]
    }
  };

  return configs[subject] || configs['数学'];
}

function generateTitle(studentName, subject, analysis, grade) {
  const gradePrefix = grade ? `【${grade}】` : '';
  const typeMap = {
    '计算': '计算能力专项训练',
    '理解': '重难点概念突破',
    '记忆': '知识点系统梳理与记忆方法',
    '应用': '解题能力综合提升',
    '基础弱': '基础知识巩固夯实',
    '审题': '审题习惯培养与专项训练',
    '速度': '解题效率提升训练',
    '考试': '考前冲刺与应试技巧',
    '系统学习': '系统学习与综合提升',
    '基础巩固': '基础知识巩固与提升',
  };
  const typeLabel = typeMap[analysis.type] || '专项辅导';
  return `${gradePrefix}${studentName}的${subject}${typeLabel}教案`;
}

function generateObjectives(subject, analysis, grade) {
  const base = [
    `通过本次课程，帮助学生掌握${analysis.focusArea}的核心方法`,
    `解决学生在${analysis.type === '基础弱' ? '基础知识点' : analysis.type === '计算' ? '计算方面' : analysis.type === '理解' ? '概念理解方面' : analysis.type === '记忆' ? '知识记忆方面' : analysis.type === '应用' ? '解题应用方面' : analysis.type === '审题' ? '审题方面' : analysis.type === '速度' ? '做题速度方面' : analysis.type === '考试' ? '考试方面' : '学习方面'}的具体问题`,
    `培养学生独立思考和自主学习的能力，建立学习信心`
  ];
  return base;
}

function generateKeyAndDifficult(analysis, config) {
  return {
    keyPoints: [
      `${analysis.focusArea}的核心方法与技巧`,
      '相关知识点之间的关联与体系构建',
      '典型题型的解题思路归纳',
    ],
    difficultPoints: [
      analysis.type === '理解' ? '抽象概念的具体化理解与实际应用' :
      analysis.type === '计算' ? '复杂运算中的易错点规避与验算习惯培养' :
      analysis.type === '应用' ? '从题目条件到解题步骤的思维转化过程' :
      '知识点的灵活运用与迁移能力',
    ]
  };
}

function generateSteps(studentName, subject, analysis, duration, half, quarter) {
  const steps = [
    {
      phase: '📌 导入热身',
      duration: Math.floor(quarter * 0.6),
      content: `${getSubjectConfig(subject).warmupExample || '通过一个有趣的问题引入今天的话题'}，激发${studentName}的学习兴趣，同时了解学生当前的知识储备和思维状态。`,
      tips: '氛围轻松，鼓励学生自由表达，注意观察学生的第一反应'
    },
    {
      phase: '🔍 诊断摸底',
      duration: Math.floor(quarter * 0.8),
      content: `通过2-3道针对性题目，精准定位${studentName}在${analysis.focusArea}上的具体薄弱环节。题目难度由浅入深，观察学生的解题过程和思维习惯。`,
      tips: '不要直接给出答案，让学生独立完成；记录具体错误类型和思维卡点'
    },
    {
      phase: '📖 知识讲解',
      duration: Math.floor(half * 0.7),
      content: `针对诊断出的问题，系统讲解${analysis.focusArea}的相关知识点。${
        analysis.type === '基础弱' ? '从最基本的概念讲起，确保学生彻底理解。使用类比、图示等直观方式帮助理解。' :
        analysis.type === '理解' ? '用多种方式（举例、画图、类比）讲解抽象概念，直到学生能用自己的话复述。' :
        analysis.type === '计算' ? '分步演示计算过程，强调每一步的原理和易错点。' :
        analysis.type === '记忆' ? '教授记忆技巧和方法（联想记忆、思维导图、口诀等），帮助学生高效记忆。' :
        analysis.type === '应用' ? '通过典型例题演示，讲解从审题→分析→解答→检验的完整流程。' :
        '结合例题讲解重点知识点，注重理解和应用。'
      }`,
      tips: '讲解过程中随时提问，确保学生跟上节奏；鼓励学生提问和质疑'
    },
    {
      phase: '✏️ 练习巩固',
      duration: Math.floor(half * 0.5),
      content: `学生独立完成3-5道针对性练习题，题目设计遵循"由浅入深、层层递进"的原则。每题完成后进行即时反馈和讲解。`,
      tips: '观察学生独立完成的情况；每题后给予及时的正向反馈；记录仍需加强的部分'
    },
    {
      phase: '🎯 难点突破',
      duration: Math.floor(half * 0.3),
      content: `针对练习中暴露的顽固问题，进行二次讲解和专项突破。如果学生已经掌握，则提升难度，拓展到更综合的题型。`,
      tips: '灵活调整：如果前面顺利可以加快进度或提高难度；如果困难就放慢节奏'
    },
    {
      phase: '📝 总结归纳',
      duration: Math.floor(quarter * 0.6),
      content: `引导${studentName}自己总结本节课学到的知识和解题方法。老师补充归纳，帮助学生建立完整的知识框架和解题思路体系。`,
      tips: '让学生先说，老师补充；将零散知识串成体系；强调"举一反三"'
    },
    {
      phase: '📋 作业布置',
      duration: Math.floor(quarter * 0.3),
      content: '布置针对性课后作业，明确作业要求和完成标准。预告下节课内容和目标。',
      tips: '作业量适中，有梯度；确保学生清楚每项作业的目的'
    },
  ];

  return steps;
}

// ======================== 题库匹配核心 ========================

/**
 * 从题库中匹配最合适的练习题
 * @param {string} subject - 科目
 * @param {string} grade - 年级
 * @param {Object} analysis - 问题分析结果
 * @param {number} count - 需要的题目数量
 */
function matchQuestionsFromBank(subject, grade, analysis, count = 8, teacherId = null) {
  try {
    // 提取搜索关键词
    const keywords = [...(analysis.keywords || []), analysis.type, analysis.focusArea]
      .filter(Boolean)
      .map(k => k.trim());

    // 1. 查询系统题库（teacher_id IS NULL）
    let systemSql = `
      SELECT id, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id
      FROM question_bank
      WHERE subject = ? AND grade = ? AND teacher_id IS NULL
      ORDER BY difficulty ASC
      LIMIT 200
    `;
    let systemQuestions = db.prepare(systemSql).all(subject, grade);

    // 降级到同科目任意年级
    if (systemQuestions.length === 0) {
      systemQuestions = db.prepare(`
        SELECT id, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id
        FROM question_bank
        WHERE subject = ? AND teacher_id IS NULL
        ORDER BY difficulty ASC
        LIMIT 200
      `).all(subject);
    }

    // 2. 查询老师私有题库（teacher_id = ?）
    let teacherQuestions = [];
    if (teacherId) {
      teacherQuestions = db.prepare(`
        SELECT id, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id
        FROM question_bank
        WHERE subject = ? AND grade = ? AND teacher_id = ?
        ORDER BY difficulty ASC
        LIMIT 100
      `).all(subject, grade, teacherId);

      // 降级到同科目任意年级
      if (teacherQuestions.length === 0) {
        teacherQuestions = db.prepare(`
          SELECT id, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id
          FROM question_bank
          WHERE subject = ? AND teacher_id = ?
          ORDER BY difficulty ASC
          LIMIT 100
        `).all(subject, teacherId);
      }
    }

    // 3. 合并并评分：老师私有题加分30
    const allQuestions = [
      ...systemQuestions.map(q => ({ ...q, _source: 'system', _baseScore: 0 })),
      ...teacherQuestions.map(q => ({ ...q, _source: 'teacher', _baseScore: 30 })), // 私有题库加30分
    ];

    if (allQuestions.length === 0) return null;

    return selectBestMatches(allQuestions, keywords, count);
  } catch (e) {
    console.error('题库匹配失败:', e.message);
    return null;
  }
}

function selectBestMatches(questions, keywords, count) {
  // 计算每道题的匹配得分
  const scored = questions.map(q => {
    let score = (q._baseScore || 0); // 私有题库基础加分
    const text = (q.topic + ' ' + q.tags + ' ' + q.knowledge_point + ' ' + q.question).toLowerCase();

    for (const kw of keywords) {
      const kwLower = kw.toLowerCase();
      if (text.includes(kwLower)) {
        score += 10; // 直接关键词匹配
      }
      // 相关词扩展
      const expansions = getKeywordExpansions(kwLower);
      for (const exp of expansions) {
        if (text.includes(exp)) score += 5;
      }
    }

    // 难度加权：基础薄弱→倾向简单题，考试→倾向中高难度
    if (keywords.some(k => k.includes('基础弱') || k.includes('基础巩固')) && q.difficulty <= 2) score += 8;
    if (keywords.some(k => k.includes('考试') || k.includes('拔高')) && q.difficulty >= 4) score += 8;
    if (keywords.some(k => k.includes('计算')) && q.question_type === 'calculation') score += 6;
    if (keywords.some(k => k.includes('应用')) && q.question_type === 'application') score += 6;

    return { ...q, _score: score };
  });

  // 按分数排序
  scored.sort((a, b) => b._score - a._score);

  // 分层选取：基础(30%) + 中等(40%) + 拔高(30%)
  const result = [];
  const easy = scored.filter(q => q.difficulty <= 2);
  const medium = scored.filter(q => q.difficulty === 3);
  const hard = scored.filter(q => q.difficulty >= 4);

  const easyCount = Math.floor(count * 0.3);
  const mediumCount = Math.floor(count * 0.4);
  const hardCount = count - easyCount - mediumCount;

  result.push(...easy.slice(0, easyCount));
  result.push(...medium.slice(0, mediumCount));
  result.push(...hard.slice(0, hardCount));

  // 如果某层不够，用其他层补
  if (result.length < count) {
    const remaining = scored.filter(q => !result.includes(q));
    result.push(...remaining.slice(0, count - result.length));
  }

  // 恢复原始顺序（按匹配分排序）并清理内部字段
  return result.slice(0, count).map(q => ({
    id: q.id,
    topic: q.topic,
    question_type: q.question_type,
    difficulty: q.difficulty,
    question: q.question,
    answer: q.answer,
    knowledge_point: q.knowledge_point,
    purpose: `${q.difficulty <= 2 ? '基础巩固' : q.difficulty <= 3 ? '能力提升' : '拔高拓展'}：${q.knowledge_point || q.topic}`,
    tags: q.tags,
    source: q._source || 'system',
    fromBank: true,
    _score: q._score
  }));
}

function getKeywordExpansions(kw) {
  // 先检查精确匹配的关键词扩展
  const exactMap = {
    '二次函数': ['二次函数', '抛物线', '顶点', '对称轴', '开口', '配方法', '顶点式', '图像', '最值'],
    '一次函数': ['一次函数', '直线', '斜率', '截距', 'y=kx+b'],
    '勾股定理': ['勾股定理', '直角三角形', '斜边', '直角边'],
    '圆': ['圆', '圆心', '半径', '弧长', '扇形', '周长', '面积'],
    '三角形': ['三角形', '内角和', '全等', '相似', '边', '角'],
    '方程': ['一元一次', '二元一次', '一元二次', '解方程', '方程组', '解'],
    '计算': ['运算', '算术', '加减', '乘除', '计算', '算数', '口算'],
    '几何': ['三角形', '四边形', '圆', '面积', '周长', '体积', '图形'],
    '力学': ['牛顿', '重力', '摩擦力', '压强', '浮力', '力'],
    '电学': ['欧姆', '电压', '电流', '电阻', '功率', '电路', '串联', '并联'],
    '语法': ['时态', '语态', '从句', '虚拟语气', '倒装', '语法', '填空'],
    '词汇': ['单词', '词汇', '阅读', '完形', '写作', '翻译', '拼写'],
    '文言文': ['古文', '实词', '虚词', '翻译', '理解', '古诗', '背诵'],
  };

  // 检查是否匹配
  for (const [key, vals] of Object.entries(exactMap)) {
    if (kw.includes(key)) return vals;
  }

  // 模糊匹配
  if (kw.includes('函数')) return ['函数', '一次函数', '二次函数', '图像', '解析式', '定义域'];
  if (kw.includes('理解') || kw.includes('不懂')) return ['概念', '原理', '定理', '定义', '理解', '掌握'];
  if (kw.includes('记忆') || kw.includes('记不住') || kw.includes('忘记')) return ['背诵', '默写', '公式', '口诀', '记忆', '记住'];
  if (kw.includes('应用') || kw.includes('不会做')) return ['应用题', '综合', '运用', '解决', '实际'];
  if (kw.includes('基础') || kw.includes('弱') || kw.includes('差')) return ['基础', '入门', '简单', '初步', '基本'];
  if (kw.includes('审题') || kw.includes('粗心') || kw.includes('马虎')) return ['审题', '读题', '分析', '关键词', '仔细'];
  if (kw.includes('速度') || kw.includes('慢') || kw.includes('来不及')) return ['速度', '效率', '限时', '快速'];
  if (kw.includes('考试') || kw.includes('分数') || kw.includes('成绩')) return ['考试', '测试', '模拟', '真题', '冲刺'];
  if (kw.includes('物理')) return ['力学', '电学', '光学', '热学', '运动', '牛顿'];
  if (kw.includes('化学')) return ['方程式', '配平', '反应', '元素', '质量', '物质的量'];
  if (kw.includes('英语') || kw.includes('阅读') || kw.includes('写作')) return ['语法', '词汇', '阅读', '完形', '写作'];

  return [];
}

// ======================== 练习生成（使用题库） ========================

function generateExercises(subject, analysis, grade, config, teacherId) {
  // 尝试从题库匹配（含老师私有题库）
  const matched = matchQuestionsFromBank(subject, grade, analysis, 6, teacherId);

  if (matched && matched.length >= 3) {
    // 返回题库中的真实题目
    return matched.map(q => ({
      question: `【${q.topic}·${'⭐'.repeat(q.difficulty)}】${q.question}`,
      answer: q.answer,
      purpose: q.purpose,
      fromBank: true,
      source: q.source || 'system',
      questionId: q.id
    }));
  }

  // 回退到模板题
  const customExercises = config.commonExercises || [];
  const adapted = customExercises.map(e => ({
    ...e,
    question: `【针对：${analysis.focusArea}】${e.question}`,
  }));
  adapted.push({
    question: `（个性化练习）根据${analysis.focusArea}，完成以下针对性训练`,
    answer: `根据学生在练习中的实际表现进行针对性反馈和指导`,
    purpose: `巩固本节课${analysis.focusArea}的学习效果`
  });
  return adapted;
}

function generateSummary(subject, analysis, studentName) {
  const tips = {
    '计算': '计算能力的提升需要持续的刻意练习，每做一道题都要追求"快、准、稳"',
    '理解': '理解是学习的基础，只有真正理解了，才能灵活运用、举一反三',
    '记忆': '好的记忆方法可以让学习事半功倍，找到适合自己的记忆方式最重要',
    '应用': '知识最终要落实到应用上，多做题、多总结、多反思是提升解题能力的不二法门',
    '基础弱': '打好基础是学好一切的前提，不要急于求成，稳扎稳打才能走得更远',
    '审题': '审题是解题的第一步也是最重要的一步，养成良好的审题习惯受益终身',
    '速度': '速度来自熟练，熟练来自练习，但快的同时不能牺牲准确率',
    '考试': '考试不仅考察知识，更考察心态和策略，平时多做模拟训练',
  };
  const tip = tips[analysis.type] || '学习是一个持续积累的过程，保持好奇心和学习热情，每天进步一点点。';

  return `${studentName}本节课重点学习了${analysis.focusArea}，通过"诊断→讲解→练习→突破→总结"五个环节，针对性地解决了学习中的具体问题。${tip}`;
}

function generateHomework(subject, analysis, config) {
  if (analysis.type === '考试') {
    return `1. 完成一套模拟试卷（限时训练，模拟真实考试环境）\n2. 整理错题本：将试卷中的错题归类整理，分析错误原因\n3. 回顾本节课讲的应试技巧，下节课分享应用心得`;
  }
  if (analysis.type === '记忆') {
    return `1. 使用本节课教授的${subject === '英语' ? '单词记忆法' : '记忆方法'}，完成知识点的记忆\n2. 第二天自行默写/背诵检验，标记遗忘的部分\n3. 完成课后练习题2-3道，巩固应用`;
  }
  return getDefaultHomework(subject);
}

function getDefaultHomework(subject) {
  const map = {
    '数学': '1. 完成课后专项练习题3-5道\n2. 整理本节课的错题到错题本，标注错误原因\n3. 预习下节课内容，标记不理解的地方',
    '英语': '1. 背诵本节课核心单词和短语\n2. 完成阅读理解/完形填空1篇\n3. 朗读课文或对话，练习发音',
    '语文': '1. 完成课后阅读理解练习\n2. 整理本节课的好词好句\n3. 预习下一篇课文，标注生字词',
    '物理': '1. 完成课后计算题2-3道\n2. 整理公式卡片，默写重点公式\n3. 观察生活中的物理现象，尝试用所学知识解释',
    '化学': '1. 完成课后化学方程式配平练习\n2. 整理物质性质对比表\n3. 背诵重点化学方程式',
    '生物': '1. 完成课后概念填空/选择题\n2. 绘制本节课知识点的思维导图\n3. 预习下一章节，标注疑问',
  };
  return map[subject] || '1. 复习本节课内容，整理笔记\n2. 完成课后练习\n3. 预习下节课内容';
}

function generateNextPreview(subject, analysis, config, grade) {
  if (analysis.type === '基础弱') {
    return `在巩固基础后，下节课将进入${subject === '数学' ? '进阶题型' : subject === '英语' ? '阅读与写作' : subject === '物理' ? '综合应用' : '知识的综合应用'}，提升难度和深度。`;
  }
  if (analysis.type === '考试') {
    return '下节课将进行模拟考试分析，针对考试中暴露的问题进行专项突破。';
  }
  return `在掌握本节课内容的基础上，下节课将拓展到${analysis.focusArea}的进阶内容，进一步提升综合解题能力。`;
}

module.exports = { generateFeedback, generateLessonPlan };
