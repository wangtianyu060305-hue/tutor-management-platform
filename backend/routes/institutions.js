const express = require('express');
const { db } = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// 获取当前用户的机构信息
router.get('/my', authenticate, (req, res) => {
  try {
    if (!req.institutionId) {
      return res.json({ institution: null });
    }
    const inst = db.prepare('SELECT * FROM institutions WHERE id = ?').get(req.institutionId);
    return res.json({ institution: inst || null });
  } catch (err) {
    return res.status(500).json({ error: '获取机构信息失败' });
  }
});

// 超级管理员：所有机构列表
router.get('/', authenticate, requireRole('super_admin'), (req, res) => {
  try {
    const institutions = db.prepare(`
      SELECT i.*,
        (SELECT COUNT(*) FROM users WHERE institution_id = i.id AND role = 'admin') as admin_count,
        (SELECT COUNT(*) FROM users WHERE institution_id = i.id AND role = 'teacher') as teacher_count,
        (SELECT COUNT(*) FROM students WHERE institution_id = i.id) as student_count,
        (SELECT COUNT(*) FROM courses c JOIN users u ON c.teacher_id = (SELECT id FROM teachers WHERE user_id = u.id) WHERE u.institution_id = i.id) as course_count
      FROM institutions i
      ORDER BY i.created_at DESC
    `).all();
    return res.json({ institutions });
  } catch (err) {
    console.error('获取机构列表失败:', err);
    return res.status(500).json({ error: '获取机构列表失败' });
  }
});

// 管理员：更新自己机构的信息
router.put('/my', authenticate, requireRole('admin', 'super_admin'), (req, res) => {
  try {
    const instId = req.isSuperAdmin ? req.body.id : req.institutionId;
    if (!instId) return res.status(400).json({ error: '无法确定机构' });

    const { name, phone, address } = req.body;

    db.prepare('UPDATE institutions SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address) WHERE id = ?')
      .run(name || null, phone || null, address || null, instId);

    const updated = db.prepare('SELECT * FROM institutions WHERE id = ?').get(instId);
    return res.json({ institution: updated });
  } catch (err) {
    return res.status(500).json({ error: '更新失败' });
  }
});

// 超级管理员：更新机构状态
router.patch('/:id/status', authenticate, requireRole('super_admin'), (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: '状态无效' });
    }
    db.prepare('UPDATE institutions SET status = ? WHERE id = ?').run(status, req.params.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: '更新失败' });
  }
});

module.exports = router;
