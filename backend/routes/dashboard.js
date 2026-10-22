const express = require('express');
const { db } = require('../db');
const { authenticate, institutionFilter } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// 辅助：获取今天日期字符串 YYYY-MM-DD
const today = () => new Date().toISOString().split('T')[0];

// 辅助：获取当月第一天
const monthStart = () => today().substring(0, 7) + '-01';

function instWhere(req, tableAlias) {
  return institutionFilter(req, { tableAlias });
}

router.get('/stats', (req, res) => {
  try {
    const td = today();

    if (req.user.role === 'super_admin') {
      // 全平台统计
      const totalInstitutions = db.prepare("SELECT COUNT(*) as count FROM institutions WHERE status = 'active'").get();
      const totalTeachers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'").get();
      const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get();
      const monthlyCourses = db.prepare('SELECT COUNT(*) as count FROM courses WHERE start_time >= ?').get(monthStart());

      const recentInstitutions = db.prepare(`
        SELECT i.*,
          (SELECT COUNT(*) FROM users WHERE institution_id = i.id) as user_count,
          (SELECT COUNT(*) FROM students WHERE institution_id = i.id) as student_count
        FROM institutions i ORDER BY i.created_at DESC LIMIT 10
      `).all();

      return res.json({
        stats: {
          totalInstitutions: totalInstitutions.count,
          totalTeachers: totalTeachers.count,
          totalStudents: totalStudents.count,
          monthlyCourses: monthlyCourses.count,
        },
        recentInstitutions
      });
    }

    if (req.user.role === 'admin') {
      const todayCourses = db.prepare(`
        SELECT COUNT(*) as count FROM courses c
        JOIN teachers t ON c.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE date(c.start_time) = date(?) AND c.status = 'scheduled' AND u.institution_id = ?
      `).get(td, req.institutionId || 0);

      const activeTeachers = db.prepare(
        'SELECT COUNT(*) as count FROM users WHERE role = ? AND institution_id = ?'
      ).get('teacher', req.institutionId || 0);

      const totalStudents = db.prepare(
        'SELECT COUNT(*) as count FROM students WHERE institution_id = ?'
      ).get(req.institutionId || 0);

      const monthlyHours = db.prepare(`
        SELECT COALESCE(SUM(ROUND((julianday(c.end_time) - julianday(c.start_time)) * 24, 1)), 0) as hours
        FROM courses c
        JOIN teachers t ON c.teacher_id = t.id
        JOIN users u ON t.user_id = u.id
        WHERE c.start_time >= ? AND c.status = 'completed' AND u.institution_id = ?
      `).get(monthStart(), req.institutionId || 0);

      const pendingFeedback = db.prepare(`
        SELECT c.*, s.name as student_name, t_user.name as teacher_name
        FROM courses c
        JOIN students s ON c.student_id = s.id
        JOIN teachers t ON c.teacher_id = t.id
        JOIN users t_user ON t.user_id = t_user.id
        WHERE c.status = 'completed' AND s.institution_id = ?
          AND c.id NOT IN (SELECT course_id FROM feedbacks WHERE course_id IS NOT NULL)
        ORDER BY c.start_time DESC LIMIT 10
      `).all(req.institutionId || 0);

      const recentFeedbacks = db.prepare(`
        SELECT f.*, s.name as student_name, t_user.name as teacher_name
        FROM feedbacks f
        JOIN students s ON f.student_id = s.id
        JOIN teachers t ON f.teacher_id = t.id
        JOIN users t_user ON t.user_id = t_user.id
        WHERE s.institution_id = ?
        ORDER BY f.created_at DESC LIMIT 5
      `).all(req.institutionId || 0);

      return res.json({
        stats: {
          todayCourses: todayCourses.count,
          activeTeachers: activeTeachers.count,
          totalStudents: totalStudents.count,
          monthlyHours: monthlyHours.hours,
          pendingFeedbackCount: pendingFeedback.length,
        },
        pendingFeedback,
        recentFeedbacks
      });
    }

    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(req.user.id);
      if (!teacher) return res.status(404).json({ error: '老师信息不存在' });

      const todayCourses = db.prepare(
        "SELECT COUNT(*) as count FROM courses WHERE teacher_id = ? AND date(start_time) = date(?) AND status = 'scheduled'"
      ).get(teacher.id, td);

      const myStudents = db.prepare('SELECT COUNT(*) as count FROM students WHERE teacher_id = ?').get(teacher.id);
      const monthlyHours = db.prepare(`
        SELECT COALESCE(SUM(ROUND((julianday(end_time) - julianday(start_time)) * 24, 1)), 0) as hours
        FROM courses WHERE teacher_id = ? AND start_time >= ? AND status = 'completed'
      `).get(teacher.id, monthStart());

      const todaySchedule = db.prepare(`
        SELECT c.*, s.name as student_name FROM courses c JOIN students s ON c.student_id = s.id
        WHERE c.teacher_id = ? AND date(c.start_time) = date(?) ORDER BY c.start_time ASC
      `).all(teacher.id, td);

      const pendingFeedback = db.prepare(`
        SELECT c.*, s.name as student_name FROM courses c JOIN students s ON c.student_id = s.id
        WHERE c.teacher_id = ? AND c.status = 'completed'
          AND c.id NOT IN (SELECT course_id FROM feedbacks WHERE course_id IS NOT NULL)
        ORDER BY c.start_time DESC LIMIT 10
      `).all(teacher.id);

      return res.json({
        stats: { todayCourses: todayCourses.count, myStudents: myStudents.count, monthlyHours: monthlyHours.hours, pendingFeedbackCount: pendingFeedback.length },
        todaySchedule, pendingFeedback
      });
    }

    if (req.user.role === 'parent') {
      const myChildren = db.prepare('SELECT * FROM students WHERE parent_id = ?').all(req.user.id);
      const childIds = myChildren.map(c => c.id);
      if (childIds.length === 0) return res.json({ stats: { childrenCount: 0 }, upcomingCourses: [], recentFeedbacks: [] });

      const placeholders = childIds.map(() => '?').join(',');
      const upcomingCourses = db.prepare(`
        SELECT c.*, s.name as student_name, t_user.name as teacher_name
        FROM courses c JOIN students s ON c.student_id = s.id JOIN teachers t ON c.teacher_id = t.id JOIN users t_user ON t.user_id = t_user.id
        WHERE c.student_id IN (${placeholders}) AND c.status = 'scheduled' ORDER BY c.start_time ASC LIMIT 10
      `).all(...childIds);

      const recentFeedbacks = db.prepare(`
        SELECT f.*, s.name as student_name, t_user.name as teacher_name
        FROM feedbacks f JOIN students s ON f.student_id = s.id JOIN teachers t ON f.teacher_id = t.id JOIN users t_user ON t.user_id = t_user.id
        WHERE f.parent_id = ? ORDER BY f.created_at DESC LIMIT 10
      `).all(req.user.id);

      return res.json({ stats: { childrenCount: myChildren.length }, children: myChildren, upcomingCourses, recentFeedbacks });
    }

    return res.json({ stats: {} });
  } catch (err) {
    console.error('获取看板数据失败:', err);
    return res.status(500).json({ error: '获取看板数据失败' });
  }
});

module.exports = router;
