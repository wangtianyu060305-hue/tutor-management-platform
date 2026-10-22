const jwt = require('jsonwebtoken');
const { db } = require('../db');

// dotenv 只需在入口加载一次，这里从 process.env 读取
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role, name: user.name, institution_id: user.institution_id },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// 认证中间件
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    // 注入机构上下文
    req.institutionId = req.user.institution_id || null;
    req.isSuperAdmin = req.user.role === 'super_admin';
    next();
  } catch (err) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

// 角色校验
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: '未登录' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: '权限不足' });
    next();
  };
}

// ===== 统一的机构数据隔离 =====
// 各路由文件不再需要各自定义 instWhere()，统一使用此函数
function institutionFilter(req, { tableAlias = null, userTableAlias = null } = {}) {
  if (req.isSuperAdmin) return { sql: '', params: [] };
  if (!req.institutionId) return { sql: '', params: [] };

  // 方式1：直接指定表别名
  if (tableAlias) {
    return { sql: ` AND ${tableAlias}.institution_id = ?`, params: [req.institutionId] };
  }
  // 方式2：通过用户表别名过滤（常用于 JOIN users 的场景）
  if (userTableAlias) {
    return { sql: ` AND ${userTableAlias}.institution_id = ?`, params: [req.institutionId] };
  }
  // 默认：同时检查老师和家长的 institution_id（用于 feedbacks 等需要双端隔离的场景）
  return { sql: ' AND (t_user.institution_id = ? OR u.institution_id = ?)', params: [req.institutionId, req.institutionId] };
}

// 检查是否属于同一机构（用于跨机构操作防护）
function sameInstitution(req, targetInstitutionId) {
  if (req.isSuperAdmin) return true;
  return req.institutionId === targetInstitutionId;
}

module.exports = { generateToken, authenticate, requireRole, institutionFilter, sameInstitution };
