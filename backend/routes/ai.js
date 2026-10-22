const express = require('express');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// AI 辅助生成反馈
router.post('/generate-feedback', async (req, res) => {
  try {
    const { generateFeedback } = require('../utils/ai');
    const { studentName, subject, courseNotes, previousFeedbacks } = req.body;

    if (!studentName || !subject) {
      return res.status(400).json({ error: '学生姓名和科目不能为空' });
    }

    const result = await generateFeedback({ studentName, subject, courseNotes, previousFeedbacks });
    return res.json(result);
  } catch (err) {
    console.error('AI 生成反馈失败:', err);
    return res.status(500).json({ error: 'AI 生成失败，请稍后重试' });
  }
});

// AI 自动备课
router.post('/generate-lesson-plan', async (req, res) => {
  try {
    const { generateLessonPlan } = require('../utils/ai');
    const { studentName, grade, subject, problems, goals, duration, previousCourses } = req.body;

    if (!studentName || !grade || !subject) {
      return res.status(400).json({ error: '学生姓名、年级和科目不能为空' });
    }

    // 获取老师ID（用于匹配私有题库）
    let teacherId = null;
    if (req.user.role === 'teacher') {
      const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(req.user.id);
      if (teacher) teacherId = teacher.id;
    }

    const result = await generateLessonPlan({
      studentName, grade, subject, problems, goals, duration, previousCourses, teacherId
    });
    return res.json(result);
  } catch (err) {
    console.error('AI 备课失败:', err);
    return res.status(500).json({ error: 'AI 备课失败，请稍后重试' });
  }
});

module.exports = router;
