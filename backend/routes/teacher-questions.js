// 老师私有题库 CRUD
const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// 中间件：仅老师可访问
function requireTeacher(req, res, next) {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: '仅老师和管理员可管理私有题库' });
  }
  next();
}

// 获取当前老师的 teacher_id
function getTeacherId(userId) {
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(userId);
  return teacher ? teacher.id : null;
}

// ======================== CRUD ========================

// 获取老师的私有题库列表
router.get('/', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    if (!teacherId) return res.status(400).json({ error: '请先完善老师信息' });

    const { subject, grade, topic, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM question_bank WHERE teacher_id = ?';
    const params = [teacherId];

    if (subject) { sql += ' AND subject = ?'; params.push(subject); }
    if (grade) { sql += ' AND grade = ?'; params.push(grade); }
    if (topic) { sql += ' AND topic LIKE ?'; params.push(`%${topic}%`); }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countSql).get(...params);

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const questions = db.prepare(sql).all(...params);

    return res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('获取私有题库失败:', err);
    return res.status(500).json({ error: '获取题库失败' });
  }
});

// 获取单个题目
router.get('/:id', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    const question = db.prepare('SELECT * FROM question_bank WHERE id = ? AND teacher_id = ?')
      .get(req.params.id, teacherId);
    if (!question) return res.status(404).json({ error: '题目不存在或无权访问' });
    return res.json({ question });
  } catch (err) {
    return res.status(500).json({ error: '获取题目失败' });
  }
});

// 添加题目到私有题库
router.post('/', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    if (!teacherId) return res.status(400).json({ error: '请先完善老师信息' });

    const { subject, grade, topic, question_type, difficulty, question, answer, knowledge_point, tags } = req.body;

    if (!subject || !grade || !question || !answer) {
      return res.status(400).json({ error: '科目、年级、题目和答案不能为空' });
    }

    const result = db.prepare(`
      INSERT INTO question_bank (subject, grade, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'teacher', ?)
    `).run(
      subject,
      grade,
      topic || '',
      question_type || 'other',
      difficulty || 3,
      question,
      answer,
      knowledge_point || '',
      tags || '',
      teacherId
    );

    const created = db.prepare('SELECT * FROM question_bank WHERE id = ?').get(result.lastInsertRowid);
    return res.status(201).json({ question: created });
  } catch (err) {
    console.error('添加题目失败:', err);
    return res.status(500).json({ error: '添加题目失败' });
  }
});

// 更新题目
router.put('/:id', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    const existing = db.prepare('SELECT * FROM question_bank WHERE id = ? AND teacher_id = ?')
      .get(req.params.id, teacherId);
    if (!existing) return res.status(404).json({ error: '题目不存在或无权编辑' });

    const { subject, grade, topic, question_type, difficulty, question, answer, knowledge_point, tags } = req.body;

    db.prepare(`
      UPDATE question_bank
      SET subject = ?, grade = ?, topic = ?, question_type = ?, difficulty = ?,
          question = ?, answer = ?, knowledge_point = ?, tags = ?
      WHERE id = ?
    `).run(
      subject || existing.subject,
      grade || existing.grade,
      topic !== undefined ? topic : existing.topic,
      question_type || existing.question_type,
      difficulty || existing.difficulty,
      question || existing.question,
      answer || existing.answer,
      knowledge_point !== undefined ? knowledge_point : existing.knowledge_point,
      tags !== undefined ? tags : existing.tags,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM question_bank WHERE id = ?').get(req.params.id);
    return res.json({ question: updated });
  } catch (err) {
    console.error('更新题目失败:', err);
    return res.status(500).json({ error: '更新题目失败' });
  }
});

// 删除题目
router.delete('/:id', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    const existing = db.prepare('SELECT * FROM question_bank WHERE id = ? AND teacher_id = ?')
      .get(req.params.id, teacherId);
    if (!existing) return res.status(404).json({ error: '题目不存在或无权删除' });

    db.prepare('DELETE FROM question_bank WHERE id = ?').run(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error('删除题目失败:', err);
    return res.status(500).json({ error: '删除题目失败' });
  }
});

// 批量导入题目
router.post('/batch', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    if (!teacherId) return res.status(400).json({ error: '请先完善老师信息' });

    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: '请提供题目列表' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO question_bank (subject, grade, topic, question_type, difficulty, question, answer, knowledge_point, tags, source, teacher_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'teacher', ?)
    `);

    let count = 0;
    const batchInsert = db.transaction(() => {
      for (const q of questions) {
        if (!q.subject || !q.grade || !q.question || !q.answer) continue;
        insertStmt.run(
          q.subject, q.grade, q.topic || '', q.question_type || 'other',
          q.difficulty || 3, q.question, q.answer,
          q.knowledge_point || '', q.tags || '', teacherId
        );
        count++;
      }
    });
    batchInsert();

    return res.status(201).json({ message: `成功导入 ${count} 道题目`, count });
  } catch (err) {
    console.error('批量导入失败:', err);
    return res.status(500).json({ error: '批量导入失败' });
  }
});

// 获取私有题库统计（按科目/年级）
router.get('/stats/summary', requireTeacher, (req, res) => {
  try {
    const teacherId = getTeacherId(req.user.id);
    const stats = db.prepare(`
      SELECT subject, grade, COUNT(*) as count
      FROM question_bank
      WHERE teacher_id = ?
      GROUP BY subject, grade
      ORDER BY subject, grade
    `).all(teacherId);
    return res.json({ stats });
  } catch (err) {
    return res.status(500).json({ error: '获取统计失败' });
  }
});

module.exports = router;
