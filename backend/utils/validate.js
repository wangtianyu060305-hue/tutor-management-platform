/**
 * 轻量级输入校验工具
 * 无需引入第三方库，提供常用的校验函数
 */

// 必填字段校验
function requiredFields(obj, fields) {
  const missing = fields.filter(f => !obj[f] || (typeof obj[f] === 'string' && !obj[f].trim()));
  if (missing.length > 0) {
    return `缺少必填字段: ${missing.join(', ')}`;
  }
  return null;
}

// 手机号格式校验（中国大陆）
function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

// 角色校验
const VALID_ROLES = ['super_admin', 'admin', 'teacher', 'parent'];
function isValidRole(role) {
  return VALID_ROLES.includes(role);
}

// 评分范围校验
function isValidRating(rating) {
  return rating === undefined || rating === null || (Number.isInteger(rating) && rating >= 1 && rating <= 5);
}

// 课程状态校验
const VALID_COURSE_STATUS = ['scheduled', 'completed', 'cancelled'];
function isValidCourseStatus(status) {
  return VALID_COURSE_STATUS.includes(status);
}

// 反馈类型校验
const VALID_FEEDBACK_TYPES = ['after_class', 'weekly', 'monthly'];
function isValidFeedbackType(type) {
  return VALID_FEEDBACK_TYPES.includes(type);
}

// 机构计划校验
const VALID_PLANS = ['free', 'basic', 'pro'];
function isValidPlan(plan) {
  return VALID_PLANS.includes(plan);
}

module.exports = {
  requiredFields,
  isValidPhone,
  isValidRole,
  isValidRating,
  isValidCourseStatus,
  isValidFeedbackType,
  isValidPlan,
  VALID_ROLES,
  VALID_COURSE_STATUS,
  VALID_FEEDBACK_TYPES,
  VALID_PLANS,
};
