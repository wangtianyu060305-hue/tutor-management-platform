const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { authenticate, requireRole, institutionFilter } = require('../middleware/auth');
const { requiredFields, isValidPhone } = require('../utils/validate');

const router = express.Router();
router.use(authenticate);

// 通过用户表别名 u 隔离机构
function instWhere(req) {
  return institutionFilter(req, { userTableAlias: 'u' });
}

router.get('/', (req, res) => {
  try {
    const { status } = req.query;
    const filter = instWhere(req);
    let sql = `
      SELECT t.*, u.name, u.phone as user_phone, u.avatar, u.institution_id,
        (SELECT COUNT(*) FROM students WHERE teacher_id = t.id) as student_count,
        (SELECT COUNT(*) FROM courses WHERE teacher_id = t.id AND status = 'scheduled') as upcoming_courses
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1 ${filter.sql}
    `;
    const params = [...filter.params];

    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    sql += ' ORDER BY t.created_at DESC';

    const teachers = db.prepare(sql).all(...params);
    return res.json({ teachers });
  } catch (err) {
    console.error('获取老师列表失败:', err);
    return res.status(500).json({ error: '获取老师列表失败' });
  }
});

router.get('/:id', (req, res) => {
  try {
    const filter = instWhere(req);
    const teacher = db.prepare(`
      SELECT t.*, u.name, u.phone as user_phone, u.avatar, u.institution_id
      FROM teachers t JOIN users u ON t.user_id = u.id
      WHERE t.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);

    if (!teacher) return res.status(404).json({ error: '老师不存在' });
    teacher.subjects = JSON.parse(teacher.subjects || '[]');
    return res.json({ teacher });
  } catch (err) {
    return res.status(500).json({ error: '获取老师详情失败' });
  }
});

// 添加老师（管理员操作，自动归属当前机构）
router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const { phone, name, password, subjects, bio, teacher_phone } = req.body;

    const missing = requiredFields(req.body, ['phone', 'name', 'password']);
    if (missing) return res.status(400).json({ error: missing });
    if (!isValidPhone(phone)) return res.status(400).json({ error: '手机号格式不正确' });
    if (!req.institutionId) return res.status(400).json({ error: '无法确定所属机构' });

    const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existingUser) return res.status(400).json({ error: '该手机号已注册' });

    // 使用异步 bcrypt，避免阻塞事件循环
    const password_hash = await bcrypt.hash(password, 10);

    const result = db.prepare(
      'INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)'
    ).run(phone, password_hash, name, 'teacher', req.institutionId);

    db.prepare('INSERT INTO teachers (user_id, subjects, bio, phone) VALUES (?, ?, ?, ?)')
      .run(result.lastInsertRowid, JSON.stringify(subjects || []), bio || '', teacher_phone || phone);

    const teacher = db.prepare(`
      SELECT t.*, u.name, u.phone as user_phone, u.institution_id
      FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.user_id = ?
    `).get(result.lastInsertRowid);

    return res.status(201).json({ teacher });
  } catch (err) {
    console.error('添加老师失败:', err);
    return res.status(500).json({ error: '添加老师失败' });
  }
});

router.put('/:id', requireRole('admin'), (req, res) => {
  try {
    const filter = instWhere(req);
    const teacher = db.prepare(`
      SELECT t.* FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);
    if (!teacher) return res.status(404).json({ error: '老师不存在' });

    const { subjects, bio, phone: teacherPhone, status } = req.body;
    db.prepare('UPDATE teachers SET subjects = ?, bio = ?, phone = ?, status = ? WHERE id = ?')
      .run(
        JSON.stringify(subjects !== undefined ? subjects : JSON.parse(teacher.subjects || '[]')),
        bio !== undefined ? bio : teacher.bio,
        teacherPhone !== undefined ? teacherPhone : teacher.phone,
        status !== undefined ? status : teacher.status,
        req.params.id
      );

    const updated = db.prepare(`
      SELECT t.*, u.name, u.phone as user_phone FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ?
    `).get(req.params.id);
    return res.json({ teacher: updated });
  } catch (err) {
    return res.status(500).json({ error: '更新老师失败' });
  }
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    const filter = instWhere(req);
    const teacher = db.prepare(`
      SELECT t.* FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.id = ? ${filter.sql}
    `).get(req.params.id, ...filter.params);
    if (!teacher) return res.status(404).json({ error: '老师不存在' });

    const studentCount = db.prepare('SELECT COUNT(*) as count FROM students WHERE teacher_id = ?').get(req.params.id);
    const courseCount = db.prepare('SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?').get(req.params.id);
    if (studentCount.count > 0 || courseCount.count > 0) {
      return res.status(400).json({
        error: `该老师有 ${studentCount.count} 个学生和 ${courseCount.count} 节课程，请先转移或清空`
      });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(teacher.user_id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: '删除老师失败' });
  }
});

router.get('/:id/schedule', (req, res) => {
  try {
    const { date } = req.query;
    let sql = `SELECT c.*, s.name as student_name, s.grade as student_grade FROM courses c JOIN students s ON c.student_id = s.id WHERE c.teacher_id = ?`;
    const params = [req.params.id];
    if (date) { sql += ' AND date(c.start_time) = date(?)'; params.push(date); }
    sql += ' ORDER BY c.start_time ASC';
    const courses = db.prepare(sql).all(...params);
    return res.json({ courses });
  } catch (err) {
    return res.status(500).json({ error: '获取老师排课失败' });
  }
});

router.get('/:id/students', (req, res) => {
  try {
    const filter = instWhere(req);
    const students = db.prepare(`
      SELECT s.*,
        (SELECT COUNT(*) FROM courses WHERE student_id = s.id AND status = 'completed') as completed_courses,
        u.name as parent_name
      FROM students s
      LEFT JOIN users u ON s.parent_id = u.id
      WHERE s.teacher_id = ? ${filter.sql}
      ORDER BY s.created_at DESC
    `).all(req.params.id, ...filter.params);
    return res.json({ students });
  } catch (err) {
    return res.status(500).json({ error: '获取老师学生列表失败' });
  }
});

module.exports = router;
