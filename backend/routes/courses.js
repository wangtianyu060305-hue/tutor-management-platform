const express = require('express');
const { db } = require('../db');
const { authenticate, institutionFilter } = require('../middleware/auth');
const { requiredFields, isValidCourseStatus } = require('../utils/validate');

const router = express.Router();
router.use(authenticate);

// 构建机构隔离条件（通过 teacher -> user 链）
function instWhere(req) {
  return institutionFilter(req, { userTableAlias: 'u' });
}

router.get('/', (req, res) => {
  try {
    const { date, teacher_id, student_id, status, month } = req.query;
    const filter = instWhere(req);
    let sql = `
      SELECT c.*,
        s.name as student_name, s.grade as student_grade,
        t_user.name as teacher_name,
        u.name as parent_name
      FROM courses c
      JOIN students s ON c.student_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users t_user ON t.user_id = t_user.id
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE 1=1 ${filter.sql}
    `;
    const params = [...filter.params];

    if (date) { sql += ' AND date(c.start_time) = date(?)'; params.push(date); }
    if (month) { sql += " AND strftime('%Y-%m', c.start_time) = ?"; params.push(month); }
    if (teacher_id) { sql += ' AND c.teacher_id = ?'; params.push(teacher_id); }
    if (student_id) { sql += ' AND c.student_id = ?'; params.push(student_id); }
    if (status) { sql += ' AND c.status = ?'; params.push(status); }

    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (teacher) { sql += ' AND c.teacher_id = ?'; params.push(teacher.id); }
    }
    if (req.user.role === 'parent') {
      sql += ' AND s.parent_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY c.start_time ASC';
    const courses = db.prepare(sql).all(...params);
    return res.json({ courses });
  } catch (err) {
    console.error('获取课程列表失败:', err);
    return res.status(500).json({ error: '获取课程列表失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const filter = instWhere(req);
    const course = db.prepare(`
      SELECT c.*,
        s.name as student_name, s.grade as student_grade,
        t_user.name as teacher_name,
        u.name as parent_name, u.id as parent_user_id
      FROM courses c
      JOIN students s ON c.student_id = s.id
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users t_user ON t.user_id = t_user.id
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE c.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);

    if (!course) return res.status(404).json({ error: '课程不存在' });
    return res.json({ course });
  } catch (err) {
    return res.status(500).json({ error: '获取课程详情失败' });
  }
});

router.post('/', (req, res) => {
  try {
    const { teacher_id, student_id, subject, start_time, end_time, location, notes } = req.body;

    const missing = requiredFields(req.body, ['teacher_id', 'student_id', 'subject', 'start_time', 'end_time']);
    if (missing) return res.status(400).json({ error: missing });

    const teacher = db.prepare('SELECT * FROM teachers WHERE id = ?').get(teacher_id);
    if (!teacher) return res.status(404).json({ error: '老师不存在' });
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(student_id);
    if (!student) return res.status(404).json({ error: '学生不存在' });

    // 冲突检测
    const conflict = db.prepare(`
      SELECT c.*, s.name as student_name FROM courses c
      JOIN students s ON c.student_id = s.id
      WHERE c.teacher_id = ? AND c.status != 'cancelled' AND c.start_time < ? AND c.end_time > ?
      LIMIT 1
    `).get(teacher_id, end_time, start_time);

    if (conflict) {
      return res.status(409).json({
        error: `该时段老师已有课程：${conflict.subject}（学生：${conflict.student_name}）`,
        conflict
      });
    }

    const result = db.prepare(
      'INSERT INTO courses (teacher_id, student_id, subject, start_time, end_time, location, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(teacher_id, student_id, subject, start_time, end_time, location || '', notes || '', 'scheduled');

    const course = db.prepare(`
      SELECT c.*, s.name as student_name, s.grade as student_grade, t_user.name as teacher_name
      FROM courses c JOIN students s ON c.student_id = s.id JOIN teachers t ON c.teacher_id = t.id JOIN users t_user ON t.user_id = t_user.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ course });
  } catch (err) {
    console.error('新建排课失败:', err);
    return res.status(500).json({ error: '新建排课失败' });
  }
});

router.put('/:id', (req, res) => {
  try {
    const filter = instWhere(req);
    const existing = db.prepare(`
      SELECT c.* FROM courses c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE c.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);
    if (!existing) return res.status(404).json({ error: '课程不存在' });

    const { teacher_id, student_id, subject, start_time, end_time, location, notes } = req.body;
    const ntid = teacher_id || existing.teacher_id;
    const nst = start_time || existing.start_time;
    const net = end_time || existing.end_time;

    if (start_time || end_time || teacher_id) {
      const conflict = db.prepare(`
        SELECT c.*, s.name as student_name FROM courses c
        JOIN students s ON c.student_id = s.id
        WHERE c.teacher_id = ? AND c.id != ? AND c.status != 'cancelled' AND c.start_time < ? AND c.end_time > ?
        LIMIT 1
      `).get(ntid, req.params.id, net, nst);
      if (conflict) return res.status(409).json({ error: `该时段老师已有课程：${conflict.subject}（学生：${conflict.student_name}）`, conflict });
    }

    db.prepare(
      'UPDATE courses SET teacher_id = ?, student_id = ?, subject = ?, start_time = ?, end_time = ?, location = ?, notes = ? WHERE id = ?'
    ).run(ntid, student_id || existing.student_id, subject || existing.subject, nst, net, location !== undefined ? location : existing.location, notes !== undefined ? notes : existing.notes, req.params.id);

    const updated = db.prepare(`
      SELECT c.*, s.name as student_name, s.grade as student_grade, t_user.name as teacher_name
      FROM courses c JOIN students s ON c.student_id = s.id JOIN teachers t ON c.teacher_id = t.id JOIN users t_user ON t.user_id = t_user.id
      WHERE c.id = ?
    `).get(req.params.id);
    return res.json({ course: updated });
  } catch (err) {
    console.error('更新课程失败:', err);
    return res.status(500).json({ error: '更新课程失败' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: '课程不存在' });
    db.prepare('UPDATE courses SET status = ? WHERE id = ?').run('cancelled', req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: '取消课程失败' });
  }
});

router.patch('/:id/complete', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: '课程不存在' });
    if (existing.status === 'cancelled') return res.status(400).json({ error: '已取消的课程不能标记为完成' });

    db.prepare('UPDATE courses SET status = ? WHERE id = ?').run('completed', req.params.id);
    const course = db.prepare(`
      SELECT c.*, s.name as student_name, s.grade as student_grade, s.parent_id, t_user.name as teacher_name
      FROM courses c JOIN students s ON c.student_id = s.id JOIN teachers t ON c.teacher_id = t.id JOIN users t_user ON t.user_id = t_user.id
      WHERE c.id = ?
    `).get(req.params.id);
    return res.json({ course, message: '课程已标记完成，记得给家长写反馈哦~' });
  } catch (err) {
    return res.status(500).json({ error: '标记完成失败' });
  }
});

module.exports = router;
