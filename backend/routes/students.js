const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// 机构过滤条件
function instWhere(req, tableAlias = 's') {
  if (req.isSuperAdmin) return { sql: '', params: [] };
  if (!req.institutionId) return { sql: '', params: [] };
  return { sql: ` AND ${tableAlias}.institution_id = ?`, params: [req.institutionId] };
}

router.get('/', (req, res) => {
  try {
    const { teacher_id, parent_id } = req.query;
    let sql = `
      SELECT s.*,
        u.name as parent_name,
        t_user.name as teacher_name,
        (SELECT COUNT(*) FROM courses WHERE student_id = s.id AND status = 'completed') as completed_courses,
        (SELECT COUNT(*) FROM courses WHERE student_id = s.id AND status = 'scheduled') as upcoming_courses
      FROM students s
      LEFT JOIN users u ON s.parent_id = u.id
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users t_user ON t.user_id = t_user.id
      WHERE 1=1
    `;
    const params = [];
    const filter = instWhere(req);
    sql += filter.sql; params.push(...filter.params);

    if (teacher_id) { sql += ' AND s.teacher_id = ?'; params.push(teacher_id); }
    if (parent_id) { sql += ' AND s.parent_id = ?'; params.push(parent_id); }
    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (teacher) { sql += ' AND s.teacher_id = ?'; params.push(teacher.id); }
    }
    if (req.user.role === 'parent') { sql += ' AND s.parent_id = ?'; params.push(req.user.id); }

    sql += ' ORDER BY s.created_at DESC';
    const students = db.prepare(sql).all(...params);
    return res.json({ students });
  } catch (err) {
    console.error('获取学生列表失败:', err);
    return res.status(500).json({ error: '获取学生列表失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const filter = instWhere(req);
    const student = db.prepare(`
      SELECT s.*,
        u.name as parent_name, u.phone as parent_phone,
        t_user.name as teacher_name
      FROM students s
      LEFT JOIN users u ON s.parent_id = u.id
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users t_user ON t.user_id = t_user.id
      WHERE s.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);

    if (!student) return res.status(404).json({ error: '学生不存在' });
    student.subjects = JSON.parse(student.subjects || '[]');
    return res.json({ student });
  } catch (err) {
    console.error('获取学生详情失败:', err);
    return res.status(500).json({ error: '获取学生详情失败' });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, grade, subjects, parent_id, teacher_id, notes } = req.body;
    if (!name) return res.status(400).json({ error: '学生姓名不能为空' });

    const instId = req.isSuperAdmin ? (req.body.institution_id || req.institutionId) : req.institutionId;
    if (!instId) return res.status(400).json({ error: '无法确定所属机构' });

    const result = db.prepare(
      'INSERT INTO students (name, grade, subjects, parent_id, teacher_id, institution_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name, grade || '', JSON.stringify(subjects || []), parent_id || null, teacher_id || null, instId, notes || '');

    const student = db.prepare(`
      SELECT s.*, u.name as parent_name, t_user.name as teacher_name
      FROM students s
      LEFT JOIN users u ON s.parent_id = u.id
      LEFT JOIN teachers t ON s.teacher_id = t.id
      LEFT JOIN users t_user ON t.user_id = t_user.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ student });
  } catch (err) {
    console.error('添加学生失败:', err);
    return res.status(500).json({ error: '添加学生失败' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const filter = instWhere(req);
    const existing = db.prepare(`SELECT * FROM students WHERE id = ? ${filter.sql}`).get(req.params.id, ...filter.params);
    if (!existing) return res.status(404).json({ error: '学生不存在' });

    const { name, grade, subjects, parent_id, teacher_id, notes } = req.body;
    db.prepare(
      'UPDATE students SET name = ?, grade = ?, subjects = ?, parent_id = ?, teacher_id = ?, notes = ? WHERE id = ?'
    ).run(
      name !== undefined ? name : existing.name,
      grade !== undefined ? grade : existing.grade,
      subjects !== undefined ? JSON.stringify(subjects) : existing.subjects,
      parent_id !== undefined ? parent_id : existing.parent_id,
      teacher_id !== undefined ? teacher_id : existing.teacher_id,
      notes !== undefined ? notes : existing.notes,
      req.params.id
    );

    const updated = db.prepare(`
      SELECT s.*, u.name as parent_name, t_user.name as teacher_name
      FROM students s LEFT JOIN users u ON s.parent_id = u.id LEFT JOIN teachers t ON s.teacher_id = t.id LEFT JOIN users t_user ON t.user_id = t_user.id
      WHERE s.id = ?
    `).get(req.params.id);
    return res.json({ student: updated });
  } catch (err) {
    console.error('更新学生失败:', err);
    return res.status(500).json({ error: '更新学生失败' });
  }
});

router.get('/:id/feedbacks', (req, res) => {
  try {
    const filter = instWhere(req);
    const feedbacks = db.prepare(`
      SELECT f.*, c.subject as course_subject, c.start_time as course_time,
        t_user.name as teacher_name
      FROM feedbacks f
      LEFT JOIN courses c ON f.course_id = c.id
      LEFT JOIN teachers t ON f.teacher_id = t.id
      LEFT JOIN users t_user ON t.user_id = t_user.id
      JOIN students s ON f.student_id = s.id
      WHERE f.student_id = ? ${filter.sql}
      ORDER BY f.created_at DESC
    `).all(req.params.id, ...filter.params);
    return res.json({ feedbacks });
  } catch (err) {
    return res.status(500).json({ error: '获取学生反馈失败' });
  }
});

module.exports = router;
