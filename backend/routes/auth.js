const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { generateToken, authenticate } = require('../middleware/auth');
const { requiredFields, isValidPhone, isValidRole } = require('../utils/validate');

const router = express.Router();

const SALT_ROUNDS = 10;

// ===== 统一注册（管理员 / 老师 / 学生家长） =====
router.post('/register', async (req, res) => {
  try {
    const { phone, password, name, role, institutionName, studentName, studentGrade } = req.body;

    const missing = requiredFields(req.body, ['phone', 'password', 'name', 'role']);
    if (missing) return res.status(400).json({ error: missing });
    if (!isValidPhone(phone)) return res.status(400).json({ error: '手机号格式不正确' });
    if (!isValidRole(role)) return res.status(400).json({ error: '角色无效，可选：admin / teacher / parent' });

    // 管理员必须有机构名
    if (role === 'admin' && !institutionName) {
      return res.status(400).json({ error: '管理员注册需要填写机构名称' });
    }
    // 家长必须有学生信息
    if (role === 'parent' && (!studentName || !studentGrade)) {
      return res.status(400).json({ error: '学生/家长注册需要填写学生姓名和年级' });
    }

    // 检查手机号是否已注册
    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) {
      return res.status(400).json({ error: '该手机号已注册' });
    }

    // 异步哈希密码，避免阻塞事件循环
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    let institutionId = null;

    // 管理员：创建机构
    if (role === 'admin') {
      const instResult = db.prepare('INSERT INTO institutions (name, phone) VALUES (?, ?)').run(institutionName, phone);
      institutionId = instResult.lastInsertRowid;
    }

    // 老师：如果填了机构名，自动创建小机构
    if (role === 'teacher' && institutionName) {
      const instResult = db.prepare('INSERT INTO institutions (name, phone) VALUES (?, ?)').run(institutionName, phone);
      institutionId = instResult.lastInsertRowid;
    }

    // 家长：查找或创建机构
    if (role === 'parent' && institutionName) {
      const existingInst = db.prepare('SELECT id FROM institutions WHERE name = ? AND status = ?').get(institutionName, 'active');
      if (existingInst) {
        institutionId = existingInst.id;
      } else {
        const instResult = db.prepare('INSERT INTO institutions (name, phone) VALUES (?, ?)').run(institutionName, phone);
        institutionId = instResult.lastInsertRowid;
      }
    }

    // 创建用户
    const userResult = db.prepare(
      'INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)'
    ).run(phone, password_hash, name, role, institutionId);

    const userId = userResult.lastInsertRowid;

    // 老师：创建老师记录
    if (role === 'teacher') {
      db.prepare('INSERT OR IGNORE INTO teachers (user_id, phone) VALUES (?, ?)').run(userId, phone);
    }

    // 家长：创建学生记录
    if (role === 'parent') {
      db.prepare(
        'INSERT INTO students (name, grade, subjects, parent_id, institution_id, notes) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(studentName, studentGrade, '[]', userId, institutionId, '');
    }

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const token = generateToken(user);

    let institution = null;
    if (institutionId) {
      institution = db.prepare('SELECT * FROM institutions WHERE id = ?').get(institutionId);
    }

    return res.status(201).json({
      token,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      institution
    });
  } catch (err) {
    console.error('注册失败:', err);
    return res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// ===== 机构注册（兼容旧入口） =====
router.post('/register-institution', async (req, res) => {
  try {
    const { phone, password, name, institutionName } = req.body;

    const missing = requiredFields(req.body, ['phone', 'password', 'name', 'institutionName']);
    if (missing) return res.status(400).json({ error: missing });
    if (!isValidPhone(phone)) return res.status(400).json({ error: '手机号格式不正确' });

    const existing = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (existing) return res.status(400).json({ error: '该手机号已注册' });

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const instResult = db.prepare('INSERT INTO institutions (name, phone) VALUES (?, ?)').run(institutionName, phone);
    const institutionId = instResult.lastInsertRowid;

    const userResult = db.prepare(
      'INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)'
    ).run(phone, password_hash, name, 'admin', institutionId);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userResult.lastInsertRowid);
    const token = generateToken(user);

    return res.status(201).json({
      token,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      institution: db.prepare('SELECT * FROM institutions WHERE id = ?').get(institutionId)
    });
  } catch (err) {
    console.error('机构注册失败:', err);
    return res.status(500).json({ error: '机构注册失败，请稍后重试' });
  }
});

// ===== 登录 =====
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const missing = requiredFields(req.body, ['phone', 'password']);
    if (missing) return res.status(400).json({ error: missing });

    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
    if (!user) {
      return res.status(400).json({ error: '手机号未注册' });
    }

    // 异步验证密码
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ error: '密码错误' });
    }

    let institution = null;
    if (user.institution_id) {
      institution = db.prepare('SELECT * FROM institutions WHERE id = ?').get(user.institution_id);
      if (institution && institution.status === 'inactive') {
        return res.status(403).json({ error: '所属机构已停用，请联系管理员' });
      }
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
      institution
    });
  } catch (err) {
    console.error('登录失败:', err);
    return res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// ===== 获取当前用户信息 =====
router.get('/me', authenticate, (req, res) => {
  try {
    const user = db.prepare('SELECT id, phone, name, role, avatar, openid, institution_id FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: '用户不存在' });

    let extra = {};
    if (user.role === 'teacher') {
      extra = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(user.id);
    }

    const institution = user.institution_id
      ? db.prepare('SELECT * FROM institutions WHERE id = ?').get(user.institution_id)
      : null;

    return res.json({ user: { ...user, ...extra }, institution });
  } catch (err) {
    console.error('获取用户信息失败:', err);
    return res.status(500).json({ error: '获取用户信息失败' });
  }
});

module.exports = router;
