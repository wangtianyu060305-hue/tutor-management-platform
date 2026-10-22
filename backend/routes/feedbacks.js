const express = require('express');
const { db } = require('../db');
const { authenticate, institutionFilter } = require('../middleware/auth');
const { requiredFields, isValidRating, isValidFeedbackType } = require('../utils/validate');

const router = express.Router();
router.use(authenticate);

// 反馈涉及老师端(users t_user)和家长端(users u)，使用默认双端隔离
function instWhere(req) {
  return institutionFilter(req); // 默认模式：同时检查老师和家长的 institution_id
}

router.get('/', (req, res) => {
  try {
    const { student_id, teacher_id, parent_id, type } = req.query;
    const filter = instWhere(req);
    let sql = `
      SELECT f.*,
        s.name as student_name, s.grade as student_grade,
        t_user.name as teacher_name,
        u.name as parent_name,
        c.subject as course_subject, c.start_time as course_time
      FROM feedbacks f
      JOIN students s ON f.student_id = s.id
      JOIN teachers t ON f.teacher_id = t.id
      JOIN users t_user ON t.user_id = t_user.id
      JOIN users u ON f.parent_id = u.id
      LEFT JOIN courses c ON f.course_id = c.id
      WHERE 1=1 ${filter.sql}
    `;
    const params = [...filter.params];

    if (student_id) { params.push(student_id); sql += ' AND f.student_id = ?'; }
    if (teacher_id) { params.push(teacher_id); sql += ' AND f.teacher_id = ?'; }
    if (parent_id) { params.push(parent_id); sql += ' AND f.parent_id = ?'; }
    if (type) { params.push(type); sql += ' AND f.type = ?'; }

    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (teacher) { params.push(teacher.id); sql += ' AND f.teacher_id = ?'; }
    }
    if (req.user.role === 'parent') {
      params.push(req.user.id);
      sql += ' AND f.parent_id = ?';
    }

    sql += ' ORDER BY f.created_at DESC';
    const feedbacks = db.prepare(sql).all(...params);
    return res.json({ feedbacks });
  } catch (err) {
    console.error('获取反馈列表失败:', err);
    return res.status(500).json({ error: '获取反馈列表失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const filter = instWhere(req);
    const feedback = db.prepare(`
      SELECT f.*,
        s.name as student_name, s.grade as student_grade,
        t_user.name as teacher_name,
        u.name as parent_name,
        c.subject as course_subject, c.start_time as course_time, c.notes as course_notes
      FROM feedbacks f
      JOIN students s ON f.student_id = s.id
      JOIN teachers t ON f.teacher_id = t.id
      JOIN users t_user ON t.user_id = t_user.id
      JOIN users u ON f.parent_id = u.id
      LEFT JOIN courses c ON f.course_id = c.id
      WHERE f.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);

    if (!feedback) return res.status(404).json({ error: '反馈不存在' });
    return res.json({ feedback });
  } catch (err) {
    return res.status(500).json({ error: '获取反馈详情失败' });
  }
});

router.post('/', (req, res) => {
  try {
    const { course_id, student_id, title, content, highlights, areas_to_improve, homework, rating, type } = req.body;

    const missing = requiredFields(req.body, ['student_id', 'title']);
    if (missing) return res.status(400).json({ error: missing });
    if (!isValidRating(rating)) return res.status(400).json({ error: '评分必须在 1~5 之间' });
    if (type && !isValidFeedbackType(type)) return res.status(400).json({ error: '无效的反馈类型' });

    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
    if (!student) return res.status(404).json({ error: '学生不存在' });
    if (!student.parent_id) return res.status(400).json({ error: '该学生没有关联家长，无法发送反馈' });

    let teacherId;
    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (!teacher) return res.status(404).json({ error: '老师信息不存在' });
      teacherId = teacher.id;
    } else {
      teacherId = student.teacher_id;
    }
    if (!teacherId) return res.status(400).json({ error: '无法确定老师' });

    const result = db.prepare(`
      INSERT INTO feedbacks (course_id, student_id, teacher_id, parent_id, title, content, highlights, areas_to_improve, homework, rating, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(course_id || null, student_id, teacherId, student.parent_id,
      title, content || '', highlights || '', areas_to_improve || '',
      homework || null, rating || 5, type || 'after_class');

    const feedback = db.prepare(`
      SELECT f.*, s.name as student_name, s.grade as student_grade,
        t_user.name as teacher_name, u.name as parent_name
      FROM feedbacks f
      JOIN students s ON f.student_id = s.id
      JOIN teachers t ON f.teacher_id = t.id
      JOIN users t_user ON t.user_id = t_user.id
      JOIN users u ON f.parent_id = u.id
      WHERE f.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ feedback });
  } catch (err) {
    console.error('创建反馈失败:', err);
    return res.status(500).json({ error: '创建反馈失败' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM feedbacks WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: '反馈不存在' });

    const { title, content, highlights, areas_to_improve, homework, rating, type } = req.body;
    if (rating && !isValidRating(rating)) return res.status(400).json({ error: '评分必须在 1~5 之间' });

    db.prepare(`
      UPDATE feedbacks SET title = ?, content = ?, highlights = ?, areas_to_improve = ?, homework = ?, rating = ?, type = ?
      WHERE id = ?
    `).run(
      title !== undefined ? title : existing.title,
      content !== undefined ? content : existing.content,
      highlights !== undefined ? highlights : existing.highlights,
      areas_to_improve !== undefined ? areas_to_improve : existing.areas_to_improve,
      homework !== undefined ? homework : existing.homework,
      rating !== undefined ? rating : existing.rating,
      type !== undefined ? type : existing.type,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT f.*, s.name as student_name, t_user.name as teacher_name, u.name as parent_name
      FROM feedbacks f JOIN students s ON f.student_id = s.id JOIN teachers t ON f.teacher_id = t.id JOIN users t_user ON t.user_id = t_user.id JOIN users u ON f.parent_id = u.id
      WHERE f.id = ?
    `).get(req.params.id);
    return res.json({ feedback: updated });
  } catch (err) {
    return res.status(500).json({ error: '更新反馈失败' });
  }
});

module.exports = router;
