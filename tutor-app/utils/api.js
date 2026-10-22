// API 请求封装（UniApp 版本）
import { getBaseUrl, getToken } from './auth';

function request(method, path, data = {}) {
  return new Promise((resolve, reject) => {
    const url = getBaseUrl() + path;
    const header = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url,
      method,
      header,
      data: method === 'GET' ? data : data,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          const msg = (res.data && res.data.error) || `请求失败(${res.statusCode})`;
          uni.showToast({ title: msg, icon: 'none' });
          reject(new Error(msg));
        }
      },
      fail(err) {
        uni.showToast({ title: '网络错误，请检查后端服务', icon: 'none' });
        reject(err);
      }
    });
  });
}

function get(path, params = {}) {
  const query = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== '')
    .map(k => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');
  const fullPath = query ? `${path}?${query}` : path;
  return request('GET', fullPath, {});
}

function post(path, data) { return request('POST', path, data); }
function put(path, data) { return request('PUT', path, data); }
function patch(path, data) { return request('PATCH', path, data); }
function del(path) { return request('DELETE', path); }

// ===== 认证 =====
function login(phone, password) { return post('/api/auth/login', { phone, password }); }
function register(phone, password, name, role, institution_id) { return post('/api/auth/register', { phone, password, name, role, institution_id }); }
function registerInstitution(phone, password, name, institutionName) { return post('/api/auth/register-institution', { phone, password, name, institutionName }); }
function getMe() { return get('/api/auth/me'); }

// ===== 机构 =====
function getMyInstitution() { return get('/api/institutions/my'); }
function getInstitutions() { return get('/api/institutions'); }
function updateMyInstitution(data) { return put('/api/institutions/my', data); }

// ===== 看板 =====
function getDashboardStats() { return get('/api/dashboard/stats'); }

// ===== 老师 =====
function getTeachers(params) { return get('/api/teachers', params); }
function getTeacher(id) { return get(`/api/teachers/${id}`); }
function createTeacher(data) { return post('/api/teachers', data); }
function updateTeacher(id, data) { return put(`/api/teachers/${id}`, data); }
function deleteTeacher(id) { return del(`/api/teachers/${id}`); }
function getTeacherSchedule(id, date) { return get(`/api/teachers/${id}/schedule`, { date }); }
function getTeacherStudents(id) { return get(`/api/teachers/${id}/students`); }

// ===== 学生 =====
function getStudents(params) { return get('/api/students', params); }
function getStudent(id) { return get(`/api/students/${id}`); }
function createStudent(data) { return post('/api/students', data); }
function updateStudent(id, data) { return put(`/api/students/${id}`, data); }
function getStudentFeedbacks(id) { return get(`/api/students/${id}/feedbacks`); }

// ===== 课程 =====
function getCourses(params) { return get('/api/courses', params); }
function getCourse(id) { return get(`/api/courses/${id}`); }
function createCourse(data) { return post('/api/courses', data); }
function updateCourse(id, data) { return put(`/api/courses/${id}`, data); }
function deleteCourse(id) { return del(`/api/courses/${id}`); }
function completeCourse(id) { return patch(`/api/courses/${id}/complete`); }

// ===== 反馈 =====
function getFeedbacks(params) { return get('/api/feedbacks', params); }
function getFeedback(id) { return get(`/api/feedbacks/${id}`); }
function createFeedback(data) { return post('/api/feedbacks', data); }
function updateFeedback(id, data) { return put(`/api/feedbacks/${id}`, data); }

// ===== AI =====
function generateAI(data) { return post('/api/ai/generate-feedback', data); }
function generateLessonPlan(data) { return post('/api/ai/generate-lesson-plan', data); }

// ===== 老师私有题库 =====
function getMyQuestions(params) { return get('/api/teacher/questions', params); }
function getMyQuestion(id) { return get(`/api/teacher/questions/${id}`); }
function addQuestion(data) { return post('/api/teacher/questions', data); }
function updateQuestion(id, data) { return put(`/api/teacher/questions/${id}`, data); }
function deleteQuestion(id) { return del(`/api/teacher/questions/${id}`); }
function batchImportQuestions(data) { return post('/api/teacher/questions/batch', data); }
function getTeacherQuestionStats() { return get('/api/teacher/questions/stats/summary'); }

export {
  login, register, registerInstitution, getMe,
  getMyInstitution, getInstitutions, updateMyInstitution,
  getDashboardStats,
  getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, getTeacherSchedule, getTeacherStudents,
  getStudents, getStudent, createStudent, updateStudent, getStudentFeedbacks,
  getCourses, getCourse, createCourse, updateCourse, deleteCourse, completeCourse,
  getFeedbacks, getFeedback, createFeedback, updateFeedback,
  generateAI, generateLessonPlan,
  getMyQuestions, getMyQuestion, addQuestion, updateQuestion, deleteQuestion, batchImportQuestions, getTeacherQuestionStats
};
