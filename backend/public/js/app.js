const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

// API 地址：本地开发用空字符串（相对路径），部署后改为服务器地址
// 例如：const API = 'https://your-server.com:3000';
const API = location.hostname === 'localhost' ? '' : `http://${location.hostname}:3000`;

function fmtDate(y,m,d){return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;}

createApp({
  setup() {
    const page = ref('login');
    const token = ref(localStorage.getItem('tutor_token')||'');
    const user = ref(JSON.parse(localStorage.getItem('tutor_user')||'null'));
    const inst = ref(JSON.parse(localStorage.getItem('tutor_inst')||'null'));
    const today = ref('');
    const loading = ref(false);

    // Login
    const phone = ref(''); const password = ref('');
    const authMode = ref('login'); // 'login' | 'register'
    const authRole = ref('admin'); // 'admin' | 'teacher' | 'parent'
    const regName = ref(''); const regInstName = ref('');
    const regStudentName = ref(''); const regStudentGrade = ref('');

    // Stats
    const stats = ref({}); const pendingFeedback = ref([]); const recentFeedbacks = ref([]);
    const todaySchedule = ref([]); const recentCourses = ref([]);
    const teachers = ref([]); const students = ref([]);
    const feedbacks = ref([]);

    // Forms
    const showTeacherForm = ref(false); const editingTeacher = ref(null);
    const tForm = reactive({name:'',phone:'',password:'123456',subjects:[],bio:''});
    const showStudentForm = ref(false); const editingStudent = ref(null);
    const sForm = reactive({name:'',grade:'',subjects:[],teacher_id:null,notes:''});
    const courseForm = reactive({teacher_id:null,student_id:null,subject:'',date:'',start_time:'09:00',end_time:'10:00',location:'',notes:''});
    const showQForm = ref(false); const editingQ = ref(null);
    const qForm = reactive({subject:'',grade:'',topic:'',difficulty:3,question:'',answer:'',tags:''});
    const qbFilterSubject = ref(''); const qbFilterGrade = ref('');
    const myQuestions = ref([]);

    // Calendar
    const calYear = ref(2026); const calMonth = ref(7); const selDate = ref('');
    const calDays = ref([]); const dayCourses = ref([]);
    const weekDays = ['日','一','二','三','四','五','六'];

    // Lesson Plan
    const planGenerated = ref(false); const genLoading = ref(false);
    const plan = ref({}); const planStudentId = ref(null); const planSubject = ref('数学');
    const planDuration = ref(120); const planGoals = ref(''); const planProblems = ref('');

    const subjects = ['语文','数学','英语','物理','化学','生物','历史','地理','政治'];
    const grades = ['一年级','二年级','三年级','四年级','五年级','六年级','初一','初二','初三','高一','高二','高三'];
    const presetTags = ['基础薄弱','计算容易出错','概念理解不透彻','公式记不住','不会灵活运用','做题速度太慢','审题不仔细','应用题看不懂','考前突击','需要拔高拓展'];

    // Computed
    const roleLabel = computed(() => {
      if (!user.value) return ''; const m={super_admin:'超级管理员',admin:'管理员',teacher:'老师',parent:'家长'};
      return m[user.value.role]||'';
    });
    const selStudent = computed(() => students.value.find(s=>s.id===planStudentId.value)||null);
    const menu = computed(() => {
      if (!user.value) return [];
      const r = user.value.role;
      if (r==='super_admin'||r==='admin') return [
        {key:'admin-dashboard',icon:'📊',label:'看板'},{key:'schedule',icon:'📅',label:'排课'},
        {key:'admin-teachers',icon:'👩‍🏫',label:'老师'},{key:'admin-students',icon:'👨‍🎓',label:'学生'},
        {key:'feedbacks',icon:'📝',label:'反馈'},{key:'lesson-plan',icon:'🤖',label:'AI备课'}
      ];
      if (r==='teacher') return [
        {key:'teacher-dashboard',icon:'📊',label:'看板'},{key:'schedule',icon:'📅',label:'排课'},
        {key:'lesson-plan',icon:'🤖',label:'AI备课'},{key:'question-bank',icon:'📚',label:'题库'},
        {key:'feedbacks',icon:'📝',label:'反馈'}
      ];
      if (r==='parent') return [
        {key:'parent-dashboard',icon:'📊',label:'看板'},{key:'feedbacks',icon:'📝',label:'反馈'}
      ];
      return [];
    });

    // API helpers
    function authHeaders() {
      return token.value ? {'Content-Type':'application/json','Authorization':'Bearer '+token.value} : {'Content-Type':'application/json'};
    }
    async function api(method, path, data) {
      const opts = {method, headers:authHeaders()};
      if (data && method!=='GET') opts.body = JSON.stringify(data);
      let url = API + path;
      if (method==='GET' && data) {
        const qs = Object.entries(data).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&');
        if (qs) url += '?'+qs;
      }
      const res = await fetch(url, opts);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error||'请求失败');
      return json;
    }
    const get = (p,d) => api('GET',p,d); const post = (p,d) => api('POST',p,d);
    const put = (p,d) => api('PUT',p,d); const del = (p,d) => api('DELETE',p,d);

    // Actions
    async function doLogin() {
      if (!phone.value||phone.value.length<11) { alert('请输入正确的手机号'); return; }
      if (!password.value) { alert('请输入密码'); return; }
      loading.value = true;
      try {
        const r = await post('/api/auth/login',{phone:phone.value,password:password.value});
        saveLogin(r); goHome();
      } catch(e) { alert(e.message); }
      loading.value = false;
    }

    async function doRegister() {
      if (!phone.value||phone.value.length<11) { alert('请输入正确的手机号'); return; }
      if (!password.value||password.value.length<6) { alert('密码至少6位'); return; }
      if (!regName.value) { alert('请输入姓名'); return; }
      if (authRole.value==='admin' && !regInstName.value) { alert('管理员注册需要填写机构名称'); return; }
      if (authRole.value==='parent' && (!regStudentName.value||!regStudentGrade.value)) { alert('请填写学生姓名和年级'); return; }

      loading.value = true;
      try {
        const r = await post('/api/auth/register',{
          phone:phone.value, password:password.value, name:regName.value,
          role:authRole.value,
          institutionName:regInstName.value||undefined,
          studentName:authRole.value==='parent'?regStudentName.value:undefined,
          studentGrade:authRole.value==='parent'?regStudentGrade.value:undefined
        });
        saveLogin(r); goHome();
      } catch(e) { alert(e.message); }
      loading.value = false;
    }

    function saveLogin(r) {
      token.value = r.token; user.value = r.user; inst.value = r.institution||null;
      localStorage.setItem('tutor_token',r.token);
      localStorage.setItem('tutor_user',JSON.stringify(r.user));
      localStorage.setItem('tutor_inst',JSON.stringify(r.institution||null));
    }

    function goHome() {
      const r = user.value?.role;
      if (r==='super_admin'||r==='admin') goPage('admin-dashboard');
      else if (r==='teacher') goPage('teacher-dashboard');
      else if (r==='parent') goPage('parent-dashboard');
    }

    function goPage(p) { page.value = p; loadPageData(); }

    function logout() {
      localStorage.clear(); token.value=''; user.value=null; inst.value=null; page.value='login';
    }

    async function loadPageData() {
      const n = new Date(); today.value = `${n.getFullYear()}年${String(n.getMonth()+1).padStart(2,'0')}月${String(n.getDate()).padStart(2,'0')}日 星期${weekDays[n.getDay()]}`;
      try {
        if (page.value.startsWith('admin-')||page.value.startsWith('teacher-')||page.value==='parent-dashboard') {
          const r = await get('/api/dashboard/stats');
          stats.value = r.stats||{}; pendingFeedback.value = r.pendingFeedback||[];
          recentFeedbacks.value = r.recentFeedbacks||[]; todaySchedule.value = r.todaySchedule||[];
          recentCourses.value = r.recentCourses||[];
        }
        if (page.value==='admin-teachers'||page.value==='schedule-create'||page.value==='admin-students'||page.value==='lesson-plan') {
          const[t,s] = await Promise.all([get('/api/teachers'),get('/api/students')]);
          teachers.value = (t.teachers||[]).map(x=>({...x,subjects:typeof x.subjects==='string'?JSON.parse(x.subjects):(x.subjects||[])}));
          students.value = (s.students||[]).map(x=>({...x,subjects:typeof x.subjects==='string'?JSON.parse(x.subjects):(x.subjects||[])}));
        }
        if (page.value==='schedule') { calYear.value=n.getFullYear(); calMonth.value=n.getMonth()+1; selDate.value=fmtDate(n.getFullYear(),n.getMonth()+1,n.getDate()); await loadCalendar(); }
        if (page.value==='feedbacks') { const r = await get('/api/feedbacks'); feedbacks.value = r.feedbacks||[]; }
        if (page.value==='question-bank') { await loadMyQuestions(); }
        if (page.value==='schedule-create') { courseForm.date = fmtDate(n.getFullYear(),n.getMonth()+1,n.getDate()); }
      } catch(e) { console.error(e); }
    }

    // Calendar
    async function loadCalendar() {
      try {
        const r = await get('/api/courses',{month:`${calYear.value}-${String(calMonth.value).padStart(2,'0')}`});
        const courses = r.courses||[];
        const cd = new Set(courses.map(c=>(c.start_time||'').slice(0,10)).filter(Boolean));
        const todayStr = fmtDate(new Date().getFullYear(),new Date().getMonth()+1,new Date().getDate());
        const first = new Date(calYear.value,calMonth.value-1,1);
        const last = new Date(calYear.value,calMonth.value,0);
        const days = [];
        for (let i=first.getDay()-1;i>=0;i--) { const d=new Date(calYear.value,calMonth.value-1,-i); const ds=fmtDate(d.getFullYear(),d.getMonth()+1,d.getDate()); days.push({day:d.getDate(),date:ds,isCurr:false,isToday:ds===todayStr,hasCourse:cd.has(ds)}); }
        for (let i=1;i<=last.getDate();i++) { const ds=fmtDate(calYear.value,calMonth.value,i); days.push({day:i,date:ds,isCurr:true,isToday:ds===todayStr,hasCourse:cd.has(ds)}); }
        const rem=7-(days.length%7); if (rem<7) { for (let i=1;i<=rem;i++) { const m=calMonth.value+1>12?1:calMonth.value+1; const ds=fmtDate(m>1?calYear.value:calYear.value+1,m,i); days.push({day:i,date:ds,isCurr:false,isToday:ds===todayStr,hasCourse:cd.has(ds)}); } }
        calDays.value = days;
      } catch(e) {}
      await loadDayCourses();
    }
    async function loadDayCourses() {
      try { const r = await get('/api/courses',{date:selDate.value}); dayCourses.value = r.courses||[]; } catch(e) {}
    }
    function selectDate(d) { selDate.value = d; loadDayCourses(); }
    function prevMonth() { if (calMonth.value===1) { calYear.value--; calMonth.value=12; } else calMonth.value--; loadCalendar(); }
    function nextMonth() { if (calMonth.value===12) { calYear.value++; calMonth.value=1; } else calMonth.value++; loadCalendar(); }

    // Teacher CRUD
    function openTeacherForm(t) {
      if (t) { editingTeacher.value=t; Object.assign(tForm,{name:t.name,phone:t.user_phone,password:'',subjects:[...t.subjects],bio:t.bio||''}); }
      else { editingTeacher.value=null; Object.assign(tForm,{name:'',phone:'',password:'123456',subjects:[],bio:''}); }
      showTeacherForm.value = true;
    }
    async function saveTeacher() {
      if (!tForm.name||!tForm.phone) { alert('姓名和手机号不能为空'); return; }
      try {
        if (editingTeacher.value) await put(`/api/teachers/${editingTeacher.value.id}`,{subjects:tForm.subjects,bio:tForm.bio,phone:tForm.phone});
        else await post('/api/teachers',{name:tForm.name,phone:tForm.phone,password:tForm.password,subjects:tForm.subjects,bio:tForm.bio});
        showTeacherForm.value = false; loadPageData();
      } catch(e) { alert(e.message); }
    }
    async function delTeacher(t) {
      if (!confirm(`确定删除 ${t.name}？`)) return;
      try { await del(`/api/teachers/${t.id}`); loadPageData(); } catch(e) { alert(e.message); }
    }

    // Student CRUD
    function openStudentForm(s) {
      if (s) { editingStudent.value=s; Object.assign(sForm,{name:s.name,grade:s.grade,subjects:[...s.subjects],teacher_id:s.teacher_id,notes:s.notes||''}); }
      else { editingStudent.value=null; Object.assign(sForm,{name:'',grade:'',subjects:[],teacher_id:null,notes:''}); }
      showStudentForm.value = true;
    }
    async function saveStudent() {
      if (!sForm.name) { alert('姓名不能为空'); return; }
      try {
        if (editingStudent.value) await put(`/api/students/${editingStudent.value.id}`,{...sForm});
        else await post('/api/students',{...sForm});
        showStudentForm.value = false; loadPageData();
      } catch(e) { alert(e.message); }
    }

    // Course
    async function createCourse() {
      if (!courseForm.teacher_id||!courseForm.student_id||!courseForm.subject||!courseForm.date||!courseForm.start_time||!courseForm.end_time) { alert('请填写所有必填项'); return; }
      if (courseForm.end_time <= courseForm.start_time) { alert('结束时间必须晚于开始时间'); return; }
      try {
        await post('/api/courses',{teacher_id:courseForm.teacher_id,student_id:courseForm.student_id,subject:courseForm.subject,start_time:`${courseForm.date} ${courseForm.start_time}:00`,end_time:`${courseForm.date} ${courseForm.end_time}:00`,location:courseForm.location,notes:courseForm.notes});
        alert('排课成功！'); goPage('schedule');
      } catch(e) { alert(e.message); }
    }
    function writeFeedback(c) {
      goPage('feedbacks');
      // Could pre-fill a feedback form here
    }

    // Lesson Plan
    async function generatePlan() {
      if (!planStudentId.value) { alert('请选择学生'); return; }
      if (!planProblems.value) { alert('请描述学生问题'); return; }
      genLoading.value = true;
      try {
        const s = selStudent.value;
        const r = await post('/api/ai/generate-lesson-plan',{studentName:s?.name,grade:s?.grade||'',subject:planSubject.value,problems:planProblems.value,goals:planGoals.value,duration:planDuration.value});
        plan.value = r; planGenerated.value = true;
      } catch(e) { alert(e.message); }
      genLoading.value = false;
    }
    function usePlanForSchedule() {
      planGenerated.value = false;
      const s = selStudent.value;
      if (s) { courseForm.student_id = s.id; courseForm.subject = planSubject.value; }
      goPage('schedule-create');
    }

    // Question Bank
    async function loadMyQuestions() {
      try { const r = await get('/api/teacher/questions',{subject:qbFilterSubject.value,grade:qbFilterGrade.value,limit:100}); myQuestions.value = r.questions||[]; } catch(e) {}
    }
    function openQForm(q) {
      if (q) { editingQ.value=q; Object.assign(qForm,{subject:q.subject,grade:q.grade,topic:q.topic||'',difficulty:q.difficulty,question:q.question,answer:q.answer,tags:q.tags||''}); }
      else { editingQ.value=null; Object.assign(qForm,{subject:'',grade:'',topic:'',difficulty:3,question:'',answer:'',tags:''}); }
      showQForm.value = true;
    }
    async function saveQ() {
      if (!qForm.subject||!qForm.grade||!qForm.question||!qForm.answer) { alert('请填写必填项'); return; }
      try {
        if (editingQ.value) await put(`/api/teacher/questions/${editingQ.value.id}`,{...qForm});
        else await post('/api/teacher/questions',{...qForm});
        showQForm.value = false; loadMyQuestions();
      } catch(e) { alert(e.message); }
    }
    async function delQ(q) {
      if (!confirm('确认删除？')) return;
      try { await del(`/api/teacher/questions/${q.id}`); loadMyQuestions(); } catch(e) { alert(e.message); }
    }

    // Import
    const showImport = ref(false); const importStep = ref(1);
    const importPreview = ref({total:0,valid:0,skipped:0,preview:[]});
    const importResult = ref({imported:0,skipped:0}); const importing = ref(false);

    function triggerImport() {
      showImport.value = true; importStep.value = 1; importPreview.value = {total:0,valid:0,skipped:0,preview:[]};
    }
    function closeImport() {
      showImport.value = false;
      if (importStep.value === 3) loadMyQuestions();
    }
    function onDrop(e) {
      const files = e.dataTransfer.files;
      if (files.length > 0) uploadFile(files[0]);
    }
    function onFileSelect(e) {
      const files = e.target.files;
      if (files.length > 0) uploadFile(files[0]);
    }
    async function uploadFile(file) {
      const ext = file.name.toLowerCase();
      if (!ext.endsWith('.csv') && !ext.endsWith('.json')) { alert('仅支持 .csv / .json 文件'); return; }
      if (file.size > 5*1024*1024) { alert('文件不能超过 5MB'); return; }

      const formData = new FormData();
      formData.append('file', file);
      importStep.value = 2; importing.value = true;
      try {
        const res = await fetch(API+'/api/teacher/questions/import/preview', {
          method: 'POST', headers: { 'Authorization': 'Bearer '+token.value }, body: formData
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error||'解析失败');
        importPreview.value = json;
      } catch(e) { alert(e.message); importStep.value = 1; }
      importing.value = false;
    }
    async function confirmImport() {
      if (importPreview.value.valid === 0) { alert('没有可导入的有效题目'); return; }
      importing.value = true;
      try {
        const res = await fetch(API+'/api/teacher/questions/import/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token.value },
          body: JSON.stringify({ questions: importPreview.value.preview })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error||'导入失败');
        importResult.value = json;
        importStep.value = 3;
      } catch(e) { alert(e.message); }
      importing.value = false;
    }
    function downloadTemplate() {
      fetch(API+'/api/teacher/questions/import/template', {
        headers: { 'Authorization': 'Bearer '+token.value }
      }).then(res => res.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = '题库导入模板.csv'; a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Init
    onMounted(() => {
      if (token.value && user.value) goHome();
      const n = new Date(); today.value = `${n.getFullYear()}年${String(n.getMonth()+1).padStart(2,'0')}月${String(n.getDate()).padStart(2,'0')}日 星期${weekDays[n.getDay()]}`;

      // Capacitor 原生返回键处理
      if (window.Capacitor) {
        const { App: CapApp } = window.Capacitor.Plugins || {};
        if (CapApp) {
          CapApp.addListener('backButton', ({ canGoBack: nativeBack }) => {
            if (page.value !== 'admin-dashboard' && page.value !== 'teacher-dashboard' && page.value !== 'parent-dashboard' && page.value !== 'login') {
              page.value = user.value?.role === 'teacher' ? 'teacher-dashboard' : user.value?.role === 'parent' ? 'parent-dashboard' : 'admin-dashboard';
            } else {
              if (!nativeBack) CapApp.exitApp();
            }
          });
        }
      }
    });

    return {
      page, token, user, inst, today, loading, phone, password,
      authMode, authRole, regName, regInstName, regStudentName, regStudentGrade,
      stats, pendingFeedback, recentFeedbacks, todaySchedule, recentCourses, teachers, students, feedbacks,
      showTeacherForm, editingTeacher, tForm, showStudentForm, editingStudent, sForm,
      courseForm, showQForm, editingQ, qForm, qbFilterSubject, qbFilterGrade, myQuestions,
      calYear, calMonth, selDate, calDays, dayCourses, weekDays,
      planGenerated, genLoading, plan, planStudentId, selStudent, planSubject, planDuration, planGoals, planProblems,
      subjects, grades, presetTags, roleLabel, menu,
      doLogin, doRegister, logout, goPage, goHome,
      openTeacherForm, saveTeacher, delTeacher, openStudentForm, saveStudent,
      createCourse, writeFeedback, loadCalendar, selectDate, prevMonth, nextMonth,
      generatePlan, usePlanForSchedule,
      loadMyQuestions, openQForm, saveQ, delQ,
      showImport, importStep, importPreview, importResult, importing,
      triggerImport, closeImport, onDrop, onFileSelect, confirmImport, downloadTemplate
    };
  }
}).mount('#app');
