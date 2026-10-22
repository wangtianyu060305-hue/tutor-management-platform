<template>
  <view class="container">
    <view class="flex-between mb-24">
      <text class="text-lg text-bold">学生管理 ({{ students.length }})</text>
      <view class="btn-primary btn-sm" @click="showAddDialog">+ 添加</view>
    </view>

    <view v-if="students.length === 0" class="empty-box"><text>👨‍🎓</text><text class="text-sm text-gray">暂无学生</text></view>

    <view v-for="item in students" :key="item.id" class="student-card card">
      <view class="flex-between">
        <view><text class="text-bold" style="font-size:32rpx;">{{ item.name }}</text><text class="tag tag-blue ml-12">{{ item.grade }}</text></view>
        <view>
          <text class="text-sm mr-12" style="color:#4F46E5" @click="editStudent(item)">编辑</text>
          <text class="text-sm" style="color:#EA580C" @click="viewFeedbacks(item.id)">反馈</text>
        </view>
      </view>
      <view class="mt-12"><text v-for="s in item.subjects" :key="s" class="tag tag-purple">{{ s }}</text></view>
      <view class="mt-12 text-sm text-gray">
        <text>👩‍🏫 老师：{{ item.teacher_name || '未分配' }}</text>
        <text class="ml-12">👨‍👩‍👧 家长：{{ item.parent_name || '未关联' }}</text>
      </view>
      <view v-if="item.notes" class="mt-12 text-sm text-gray">📝 {{ item.notes }}</view>
      <view class="divider" />
      <view class="flex-between">
        <text class="text-sm text-gray">✅ {{ item.completed_courses || 0 }} 节已完成</text>
        <text class="text-sm text-gray">📅 {{ item.upcoming_courses || 0 }} 节待上</text>
      </view>
    </view>

    <bottom-nav role="admin" active="students" />

    <view class="modal" v-if="showForm">
      <view class="modal-mask" @click="hideForm" />
      <view class="modal-content">
        <text class="text-lg text-bold mb-24">{{ editingId ? '编辑学生' : '添加学生' }}</text>
        <view class="form-group"><text class="form-label">姓名 *</text><input class="form-input" v-model="form.name" placeholder="学生姓名" /></view>
        <view class="form-group"><text class="form-label">年级</text><input class="form-input" v-model="form.grade" placeholder="如：初三、高一" /></view>
        <view class="form-group">
          <text class="form-label">补习科目</text>
          <view class="flex-row flex-wrap">
            <view v-for="s in subjectOptions" :key="s" :class="'tag ' + (form.subjects.includes(s) ? 'tag-purple' : '')" style="padding:12rpx 20rpx;margin:6rpx;" @click="toggleSubject(s)">{{ s }}</view>
          </view>
        </view>
        <view class="form-group">
          <text class="form-label">分配老师</text>
          <picker :range="teacherOptions" range-key="name" :value="form.teacherIndex" @change="onTeacherChange">
            <view class="form-picker">{{ teacherOptions[form.teacherIndex] ? teacherOptions[form.teacherIndex].name : '请选择老师' }}</view>
          </picker>
        </view>
        <view class="form-group"><text class="form-label">备注</text><input class="form-input" v-model="form.notes" placeholder="学生薄弱点、特殊要求等" /></view>
        <view class="flex-row mt-24">
          <view class="btn-outline flex-1 mr-12" @click="hideForm">取消</view>
          <view class="btn-primary flex-1" @click="submitForm">{{ editingId ? '保存' : '添加' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getStudents, createStudent, updateStudent, getTeachers } from '../../../utils/api';
import { isAdmin } from '../../../utils/auth';

export default {
  data() {
    return {
      students: [], teacherOptions: [], showForm: false, editingId: null,
      subjectOptions: ['语文','数学','英语','物理','化学','生物','历史','地理','政治'],
      form: { name:'', grade:'', subjects:[], teacher_id:null, teacherIndex:0, notes:'' }
    };
  },
  mounted() { this.guard(); this.loadData(); },
  onShow() { this.guard(); this.loadData(); },
  methods: {
    guard() { if (!isAdmin()) { uni.reLaunch({ url: '/pages/login/role' }); } },
    async loadData() {
      try {
        const [sRes, tRes] = await Promise.all([getStudents(), getTeachers()]);
        this.students = (sRes.students || []).map(s => ({ ...s, subjects: typeof s.subjects === 'string' ? JSON.parse(s.subjects) : (s.subjects || []) }));
        this.teacherOptions = (tRes.teachers || []).map(t => ({ id: t.id, name: t.name }));
      } catch (e) {}
    },
    showAddDialog() {
      this.showForm = true; this.editingId = null;
      this.form = { name:'', grade:'', subjects:[], teacher_id:null, teacherIndex:0, notes:'' };
    },
    editStudent(s) {
      const ti = this.teacherOptions.findIndex(t => t.id === s.teacher_id);
      this.showForm = true; this.editingId = s.id;
      this.form = { name: s.name, grade: s.grade, subjects: s.subjects || [], teacher_id: s.teacher_id, teacherIndex: ti >= 0 ? ti : 0, notes: s.notes || '' };
    },
    hideForm() { this.showForm = false; },
    toggleSubject(s) {
      const idx = this.form.subjects.indexOf(s);
      if (idx > -1) this.form.subjects.splice(idx, 1); else this.form.subjects.push(s);
    },
    onTeacherChange(e) {
      const idx = parseInt(e.detail.value);
      this.form.teacherIndex = idx;
      this.form.teacher_id = this.teacherOptions[idx] ? this.teacherOptions[idx].id : null;
    },
    async submitForm() {
      if (!this.form.name) { uni.showToast({ title: '姓名不能为空', icon: 'none' }); return; }
      try {
        const payload = { name: this.form.name, grade: this.form.grade, subjects: this.form.subjects, teacher_id: this.form.teacher_id, notes: this.form.notes };
        if (this.editingId) { await updateStudent(this.editingId, payload); } else { await createStudent(payload); }
        uni.showToast({ title: this.editingId ? '已更新' : '已添加', icon: 'success' });
        this.hideForm(); this.loadData();
      } catch (e) {}
    },
    viewFeedbacks(id) { uni.navigateTo({ url: `/pages/feedback/list/list?studentId=${id}` }); },
    goTo(p) {
      const m = { dashboard: '/pages/admin/dashboard/dashboard', schedule: '/pages/schedule/calendar/calendar', teachers: '/pages/admin/teachers/teachers' };
      uni.navigateTo({ url: m[p] });
    }
  }
};
</script>

<style scoped>
.container { padding-bottom: 120rpx; }
.divider { height: 1rpx; background: #E5E7EB; margin: 16rpx 0; }
.student-card { margin-bottom: 16rpx; }
.modal { position: fixed; top:0; left:0; right:0; bottom:0; z-index:100; display:flex; align-items:flex-end; }
.modal-mask { position:absolute; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); }
.modal-content { position:relative; width:100%; max-height:80vh; background:#FFF; border-radius:24rpx 24rpx 0 0; padding:32rpx; overflow-y:auto; }
</style>
