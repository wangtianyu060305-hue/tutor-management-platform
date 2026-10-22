const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { db, initialize } = require('./db');

initialize();

// 彻底重置：删表重建
db.exec('DROP TABLE IF EXISTS feedbacks');
db.exec('DROP TABLE IF EXISTS courses');
db.exec('DROP TABLE IF EXISTS students');
db.exec('DROP TABLE IF EXISTS teachers');
db.exec('DROP TABLE IF EXISTS users');
db.exec('DROP TABLE IF EXISTS institutions');

// 重新建表
initialize();

console.log('🌱 正在插入多机构种子数据...\n');

const hash = bcrypt.hashSync('123456', 10);

// =============================================
// 🏢 超级管理员
// =============================================
const superAdmin = db.prepare('INSERT INTO users (phone, password_hash, name, role) VALUES (?, ?, ?, ?)')
  .run('13800000000', hash, '平台管理员', 'super_admin');
console.log('✅ 超级管理员：13800000000 / 123456');

// =============================================
// 🏢 机构A：王老师教育
// =============================================
const instA = db.prepare('INSERT INTO institutions (name, phone, address, plan) VALUES (?, ?, ?, ?)')
  .run('王老师教育培训中心', '13800000001', '北京市海淀区中关村大街1号', 'pro');
const instAId = instA.lastInsertRowid;

// 管理员
const adminA = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13800000001', hash, '王校长', 'admin', instAId);
const adminAId = adminA.lastInsertRowid;

// 老师
const tA1 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13810000001', hash, '张老师', 'teacher', instAId);
const tA1Id = tA1.lastInsertRowid;
const teacherA1 = db.prepare('INSERT INTO teachers (user_id, subjects, bio, phone) VALUES (?, ?, ?, ?)')
  .run(tA1Id, '["数学", "物理"]', '5年教龄，擅长初高中数理化', '13810000001');
const teacherA1Tid = teacherA1.lastInsertRowid;

const tA2 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13810000002', hash, '李老师', 'teacher', instAId);
const tA2Id = tA2.lastInsertRowid;
const teacherA2 = db.prepare('INSERT INTO teachers (user_id, subjects, bio, phone) VALUES (?, ?, ?, ?)')
  .run(tA2Id, '["英语"]', '英语专八，口语流利', '13810000002');
const teacherA2Tid = teacherA2.lastInsertRowid;

// 家长
const parentA1 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13810000003', hash, '小明妈妈', 'parent', instAId);
const parentA1Id = parentA1.lastInsertRowid;

const parentA2 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13810000004', hash, '小红爸爸', 'parent', instAId);
const parentA2Id = parentA2.lastInsertRowid;

// 学生
const sA1 = db.prepare('INSERT INTO students (name, grade, subjects, parent_id, teacher_id, institution_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
  .run('小明', '初三', '["数学", "物理"]', parentA1Id, teacherA1Tid, instAId, '数学基础弱，计算容易出错');
const sA1Id = sA1.lastInsertRowid;

const sA2 = db.prepare('INSERT INTO students (name, grade, subjects, parent_id, teacher_id, institution_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
  .run('小红', '高一', '["英语"]', parentA2Id, teacherA2Tid, instAId, '英语阅读和写作需要提高');
const sA2Id = sA2.lastInsertRowid;

// 课程
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 0);
const tmr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

function fmt(d, time) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day} ${time}`;
}

db.prepare("INSERT INTO courses (teacher_id, student_id, subject, start_time, end_time, location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
  .run(teacherA1Tid, sA1Id, '数学', fmt(today, '09:00:00'), fmt(today, '11:00:00'), '教室A', 'completed', '二次函数与一元二次方程');

db.prepare("INSERT INTO courses (teacher_id, student_id, subject, start_time, end_time, location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
  .run(teacherA1Tid, sA1Id, '物理', fmt(tmr, '09:00:00'), fmt(tmr, '11:00:00'), '教室A', 'scheduled', '力学基础：牛顿定律');

const courseA2 = db.prepare("INSERT INTO courses (teacher_id, student_id, subject, start_time, end_time, location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
  .run(teacherA2Tid, sA2Id, '英语', fmt(tmr, '14:00:00'), fmt(tmr, '16:00:00'), '教室B', 'scheduled', '议论文写作技巧');

// 反馈
db.prepare("INSERT INTO feedbacks (course_id, student_id, teacher_id, parent_id, title, content, highlights, areas_to_improve, homework, rating, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
  .run(1, sA1Id, teacherA1Tid, parentA1Id, '小明数学课后反馈',
    '小明今天上课状态不错，二次函数的图像理解有进步。公式法解题准确率提高到了85%。需要注意的是计算时偶尔跳步，导致符号出错。',
    '二次函数图像理解进步明显', '计算过程需要完整书写，避免跳步',
    '完成练习册P45-48的二次函数综合题', 4, 'after_class');

console.log('✅ 机构A（王老师教育）：管理员 + 2老师 + 2家长 + 2学生 + 3课程 + 1反馈');

// =============================================
// 🏢 机构B：星辰教育
// =============================================
const instB = db.prepare('INSERT INTO institutions (name, phone, address, plan) VALUES (?, ?, ?, ?)')
  .run('星辰教育培训学校', '13800000002', '上海市浦东新区陆家嘴', 'basic');
const instBId = instB.lastInsertRowid;

// 管理员
const adminB = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13800000002', hash, '陈校长', 'admin', instBId);
const adminBId = adminB.lastInsertRowid;

// 老师
const tB1 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13820000001', hash, '赵老师', 'teacher', instBId);
const tB1Id = tB1.lastInsertRowid;
const teacherB1 = db.prepare('INSERT INTO teachers (user_id, subjects, bio, phone) VALUES (?, ?, ?, ?)')
  .run(tB1Id, '["化学", "生物"]', '985生物化学专业，6年教学经验', '13820000001');
const teacherB1Tid = teacherB1.lastInsertRowid;

const tB2 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13820000002', hash, '孙老师', 'teacher', instBId);
const tB2Id = tB2.lastInsertRowid;
const teacherB2 = db.prepare('INSERT INTO teachers (user_id, subjects, bio, phone) VALUES (?, ?, ?, ?)')
  .run(tB2Id, '["语文", "历史"]', '文科综合，擅长中高考冲刺', '13820000002');
const teacherB2Tid = teacherB2.lastInsertRowid;

// 家长
const parentB1 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13820000003', hash, '小刚妈妈', 'parent', instBId);
const parentB1Id = parentB1.lastInsertRowid;

const parentB2 = db.prepare('INSERT INTO users (phone, password_hash, name, role, institution_id) VALUES (?, ?, ?, ?, ?)')
  .run('13820000004', hash, '小丽爸爸', 'parent', instBId);
const parentB2Id = parentB2.lastInsertRowid;

// 学生
const sB1 = db.prepare('INSERT INTO students (name, grade, subjects, parent_id, teacher_id, institution_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
  .run('小刚', '高二', '["化学", "数学"]', parentB1Id, teacherB1Tid, instBId, '化学方程式、反应速率章节薄弱');
const sB1Id = sB1.lastInsertRowid;

const sB2 = db.prepare('INSERT INTO students (name, grade, subjects, parent_id, teacher_id, institution_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
  .run('小丽', '初三', '["语文"]', parentB2Id, teacherB2Tid, instBId, '阅读理解丢分多，作文结构需要提升');
const sB2Id = sB2.lastInsertRowid;

// 课程
db.prepare("INSERT INTO courses (teacher_id, student_id, subject, start_time, end_time, location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
  .run(teacherB1Tid, sB1Id, '化学', fmt(tmr, '10:00:00'), fmt(tmr, '12:00:00'), '三楼实验室', 'scheduled', '化学反应速率与化学平衡');
db.prepare("INSERT INTO courses (teacher_id, student_id, subject, start_time, end_time, location, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
  .run(teacherB2Tid, sB2Id, '语文', fmt(tmr, '15:00:00'), fmt(tmr, '17:00:00'), 'VIP教室', 'scheduled', '文言文阅读与作文立意');

console.log('✅ 机构B（星辰教育）：管理员 + 2老师 + 2家长 + 2学生 + 2课程');

// =============================================
console.log('\n📋 测试账号（密码统一：123456）\n');

console.log('🔷 超级管理员（看全部）：');
console.log('   13800000000  平台管理员\n');

console.log('🔷 机构A — 王老师教育培训中心：');
console.log('   13800000001  王校长（管理员）');
console.log('   13810000001  张老师（数学/物理）');
console.log('   13810000002  李老师（英语）');
console.log('   13810000003  小明妈妈（家长）');
console.log('   13810000004  小红爸爸（家长）\n');

console.log('🔷 机构B — 星辰教育培训学校：');
console.log('   13800000002  陈校长（管理员）');
console.log('   13820000001  赵老师（化学/生物）');
console.log('   13820000002  孙老师（语文/历史）');
console.log('   13820000003  小刚妈妈（家长）');
console.log('   13820000004  小丽爸爸（家长）\n');

console.log('💡 验证数据隔离：');
console.log('   王校长登录 → 只能看到机构A的2个学生、2个老师');
console.log('   陈校长登录 → 只能看到机构B的2个学生、2个老师');
console.log('   超级管理员 → 看到全部数据\n');

process.exit(0);
