const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// dotenv 已在 index.js 中加载，此处直接读取 process.env

// 数据目录：优先用 Electron 传入的 DATA_DIR，否则用默认相对路径
const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'tutor.db');
const db = new Database(dbPath);

// 性能与安全优化
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');          // 忙等待最多5秒
db.pragma('cache_size = -20000');          // 20MB 缓存
db.pragma('synchronous = NORMAL');         // WAL 模式下 NORMAL 足够安全

function initialize() {
  // ===== 机构表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      logo TEXT DEFAULT '',
      plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'basic', 'pro')),
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 用户表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('super_admin', 'admin', 'teacher', 'parent')),
      institution_id INTEGER REFERENCES institutions(id),
      openid TEXT,
      avatar TEXT,
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 兼容旧表（列迁移） =====
  try { db.exec("ALTER TABLE users ADD COLUMN institution_id INTEGER REFERENCES institutions(id)"); } catch (_) {}
  try { db.exec("ALTER TABLE students ADD COLUMN institution_id INTEGER REFERENCES institutions(id)"); } catch (_) {}
  try { db.exec("ALTER TABLE question_bank ADD COLUMN teacher_id INTEGER REFERENCES teachers(id)"); } catch (_) {}

  // ===== 老师表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subjects TEXT DEFAULT '[]',
      bio TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 学生表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grade TEXT DEFAULT '',
      subjects TEXT DEFAULT '[]',
      parent_id INTEGER REFERENCES users(id),
      teacher_id INTEGER REFERENCES teachers(id),
      institution_id INTEGER REFERENCES institutions(id),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 课程表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      student_id INTEGER NOT NULL REFERENCES students(id),
      subject TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      location TEXT DEFAULT '',
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
      notes TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 反馈表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER REFERENCES courses(id),
      student_id INTEGER NOT NULL REFERENCES students(id),
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      parent_id INTEGER NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      highlights TEXT DEFAULT '',
      areas_to_improve TEXT DEFAULT '',
      homework TEXT,
      rating INTEGER DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
      type TEXT DEFAULT 'after_class' CHECK(type IN ('after_class', 'weekly', 'monthly')),
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 题库表 =====
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_bank (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      topic TEXT NOT NULL,
      question_type TEXT NOT NULL CHECK(question_type IN ('calculation','choice','fill','proof','application','reading','writing','grammar','concept','experiment','other')),
      difficulty INTEGER DEFAULT 3 CHECK(difficulty >= 1 AND difficulty <= 5),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      knowledge_point TEXT DEFAULT '',
      tags TEXT DEFAULT '',
      source TEXT DEFAULT 'system',
      teacher_id INTEGER REFERENCES teachers(id),
      created_at DATETIME DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // ===== 索引 =====
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_institution ON users(institution_id);
    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    CREATE INDEX IF NOT EXISTS idx_students_institution ON students(institution_id);
    CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_courses_student ON courses(student_id);
    CREATE INDEX IF NOT EXISTS idx_courses_start_time ON courses(start_time);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_student ON feedbacks(student_id);
    CREATE INDEX IF NOT EXISTS idx_feedbacks_parent ON feedbacks(parent_id);
    CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_qb_subject ON question_bank(subject);
    CREATE INDEX IF NOT EXISTS idx_qb_grade ON question_bank(grade);
    CREATE INDEX IF NOT EXISTS idx_qb_topic ON question_bank(topic);
    CREATE INDEX IF NOT EXISTS idx_qb_diff ON question_bank(difficulty);
    CREATE INDEX IF NOT EXISTS idx_qb_type ON question_bank(question_type);
    CREATE INDEX IF NOT EXISTS idx_qb_teacher ON question_bank(teacher_id);
  `);

  console.log('[DB] 数据库初始化完成（支持多机构 + 题库）');
}

module.exports = { db, initialize };
