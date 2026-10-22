// 题库文件导入（CSV / JSON）
const express = require('express');
const multer = require('multer');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Multer memory storage — 文件存在内存中，不落盘
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const ext = (file.originalname || '').toLowerCase();
    if (ext.endsWith('.csv') || ext.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 .csv 和 .json 文件'));
    }
  }
});

// ======================== 列名映射 ========================
const COLUMN_MAP = {
  // 中文列名 → DB 字段
  '题目': 'question', '题目内容': 'question', '试题': 'question',
  '答案': 'answer', '参考答案': 'answer', '解析': 'answer', '解答': 'answer',
  '科目': 'subject', '学科': 'subject',
  '年级': 'grade',
  '知识点': 'topic', '章节': 'topic', '课题': 'topic',
  '难度': 'difficulty', '难度等级': 'difficulty',
  '题型': 'question_type', '题目类型': 'question_type',
  '标签': 'tags',
  '考点': 'knowledge_point', '知识要点': 'knowledge_point',
  // 英文列名 → DB 字段
  'question': 'question', 'answer': 'answer', 'subject': 'subject',
  'grade': 'grade', 'topic': 'topic', 'difficulty': 'difficulty',
  'question_type': 'question_type', 'tags': 'tags',
  'knowledge_point': 'knowledge_point',
};

function normalizeHeader(h) {
  return (h || '').trim()
    .replace(/^﻿/, '')  // 去 BOM
    .replace(/\s+/g, '');     // 去掉所有空格
}

// 解析 CSV 行（处理引号包裹的字段）
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { result.push(current.trim()); current = ''; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
}

// 解析 CSV 文本
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) throw new Error('CSV 文件至少需要表头 + 1行数据');

  const headers = parseCSVLine(lines[0]).map(normalizeHeader);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => v === '')) continue; // 跳过空行
    const row = {};
    headers.forEach((h, idx) => {
      if (values[idx] !== undefined) row[h] = values[idx];
    });
    rows.push(row);
  }
  return { headers, rows };
}

// 解析 JSON 文本
function parseJSON(text) {
  let data = JSON.parse(text);
  // 支持 { questions: [...] } 格式
  if (data && !Array.isArray(data) && Array.isArray(data.questions)) {
    data = data.questions;
  }
  if (!Array.isArray(data)) throw new Error('JSON 文件内容应为数组');
  return data;
}

// 列名 → DB 字段映射，并提取有效字段
function mapRow(row, columnMap) {
  const mapped = {};
  for (const [key, val] of Object.entries(row)) {
    if (val === '' || val === undefined || val === null) continue;
    const normalized = normalizeHeader(key);
    const dbField = columnMap[normalized] || columnMap[normalized.toLowerCase()] || null;
    if (dbField && val !== '') {
      mapped[dbField] = String(val).trim();
    }
  }
  return mapped;
}

// ======================== 导入路由 ========================

// 上传文件 → 解析 → 预览（不写入）
router.post('/preview', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传文件' });

    const filename = (req.file.originalname || '').toLowerCase();
    const buffer = req.file.buffer.toString('utf-8');
    let rows;

    if (filename.endsWith('.json')) {
      const data = parseJSON(buffer);
      rows = data.map(r => mapRow(r, COLUMN_MAP));
    } else {
      const parsed = parseCSV(buffer);
      rows = parsed.rows.map(r => mapRow(r, COLUMN_MAP));
    }

    // 过滤掉没有 question 和 answer 的行
    const valid = rows.filter(r => r.question && r.answer);
    const skipped = rows.length - valid.length;

    return res.json({
      total: rows.length,
      valid: valid.length,
      skipped,
      preview: valid.slice(0, 50), // 预览前50条
    });
  } catch (err) {
    console.error('文件解析失败:', err);
    return res.status(400).json({ error: `文件解析失败: ${err.message}` });
  }
});

// 确认导入：接收预览数据，写入数据库
router.post('/confirm', (req, res) => {
  try {
    // 获取老师ID
    let teacherId = null;
    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (teacher) teacherId = teacher.id;
    } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      // 管理员也可以导入，存为系统题库
      teacherId = null;
    }
    if (req.user.role === 'teacher' && !teacherId) {
      return res.status(400).json({ error: '请先完善老师信息' });
    }

    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: '请提供题目列表' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO question_bank (subject, grade, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let imported = 0;
    let skipped = 0;
    const source = teacherId ? 'teacher' : 'system';

    const batchInsert = db.transaction(() => {
      for (const q of questions) {
        if (!q.question || !q.answer) { skipped++; continue; }
        const diff = parseInt(q.difficulty) || 3;
        insertStmt.run(
          q.subject || '未分类',
          q.grade || '未知',
          q.topic || '',
          q.question_type || 'other',
          Math.max(1, Math.min(5, diff)),
          q.question,
          q.answer,
          q.knowledge_point || '',
          q.tags || '',
          source,
          teacherId
        );
        imported++;
      }
    });
    batchInsert();

    return res.json({ message: `成功导入 ${imported} 道题目`, imported, skipped });
  } catch (err) {
    console.error('导入失败:', err);
    return res.status(500).json({ error: '导入失败: ' + err.message });
  }
});

// 下载 CSV 模板
router.get('/template', (req, res) => {
  const headers = ['科目', '年级', '知识点', '题型', '难度', '题目', '答案', '标签', '考点'];
  const bom = '﻿';
  const csv = bom + headers.join(',') + '\n' +
    headers.map(h => {
      if (h === '难度') return '3';
      if (h === '题型') return 'calculation';
      return '';
    }).join(',') + '\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent('题库导入模板.csv')}`);
  return res.status(200).end(csv);
});

module.exports = router;
