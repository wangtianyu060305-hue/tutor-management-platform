<template>
  <view class="container">
    <view class="flex-between mb-24">
      <text class="text-lg text-bold">老师管理 ({{ teachers.length }})</text>
      <view class="btn-primary btn-sm" @click="showAddDialog">+ 添加</view>
    </view>

    <view v-if="loading" class="text-center text-gray">加载中...</view>
    <view v-if="teachers.length === 0 && !loading" class="empty-box"><text>👩‍🏫</text><text class="text-sm text-gray">暂无老师</text></view>

    <view v-for="item in teachers" :key="item.id" class="teacher-card card">
      <view class="flex-between">
        <view class="flex-1">
          <text class="text-bold" style="font-size:32rpx;">{{ item.name }}</text>
          <text :class="'tag tag-' + (item.status === 'active' ? 'green' : 'red') + ' ml-12'">{{ item.status === 'active' ? '在职' : '离职' }}</text>
        </view>
        <view>
          <text class="text-sm mr-12" style="color:#4F46E5" @click="editTeacher(item)">编辑</text>
          <text class="text-sm" style="color:#EF4444" @click="confirmDelete(item)">删除</text>
        </view>
      </view>
      <view class="mt-12"><text class="text-sm text-gray">📱 {{ item.user_phone }}</text></view>
      <view class="mt-12">
        <text v-for="s in item.subjects" :key="s" class="tag tag-blue">{{ s }}</text>
        <text v-if="item.bio" class="text-sm text-gray ml-12">{{ item.bio }}</text>
      </view>
      <view class="divider" />
      <view class="flex-between">
        <text class="text-sm text-gray">👨‍🎓 {{ item.student_count || 0 }} 个学生</text>
        <text class="text-sm text-gray">📅 {{ item.upcoming_courses || 0 }} 节待上课</text>
      </view>
    </view>

    <bottom-nav role="admin" active="teachers" />

    <view class="modal" v-if="showForm">
      <view class="modal-mask" @click="hideForm" />
      <view class="modal-content">
        <text class="text-lg text-bold mb-24">{{ editingId ? '编辑老师' : '添加老师' }}</text>
        <view class="form-group"><text class="form-label">姓名 *</text><input class="form-input" v-model="form.name" placeholder="老师姓名" /></view>
        <view class="form-group"><text class="form-label">手机号 *</text><input class="form-input" v-model="form.phone" placeholder="手机号（登录用）" /></view>
        <view v-if="!editingId" class="form-group"><text class="form-label">密码 *</text><input class="form-input" v-model="form.password" type="password" placeholder="登录密码" /></view>
        <view class="form-group"><text class="form-label">联系电话</text><input class="form-input" v-model="form.teacherPhone" placeholder="联系电话" /></view>
        <view class="form-group">
          <text class="form-label">擅长科目</text>
          <view class="flex-row flex-wrap">
            <view v-for="s in subjectOptions" :key="s" :class="'tag ' + (form.subjects.includes(s) ? 'tag-purple' : '')" style="padding:12rpx 20rpx;margin:6rpx;" @click="toggleSubject(s)">{{ s }}</view>
          </view>
        </view>
        <view class="form-group"><text class="form-label">简介</text><input class="form-input" v-model="form.bio" placeholder="如：5年教龄" /></view>
        <view v-if="editingId" class="form-group">
          <text class="form-label">状态</text>
          <view class="flex-row">
            <view class="tag tag-green" style="padding:12rpx 24rpx;" @click="form.status='active'">在职</view>
            <view class="tag tag-red ml-12" style="padding:12rpx 24rpx;" @click="form.status='inactive'">离职</view>
          </view>
        </view>
        <view class="flex-row mt-24">
          <view class="btn-outline flex-1 mr-12" @click="hideForm">取消</view>
          <view class="btn-primary flex-1" @click="submitForm">{{ editingId ? '保存' : '添加' }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../../utils/api';
import { isAdmin } from '../../../utils/auth';

export default {
  data() {
    return {
      teachers: [], loading: false, showForm: false, editingId: null,
      subjectOptions: ['语文','数学','英语','物理','化学','生物','历史','地理','政治'],
      form: { name:'', phone:'', password:'123456', teacherPhone:'', subjects:[], bio:'', status:'active' }
    };
  },
  mounted() { this.guard(); this.loadTeachers(); },
  onShow() { this.guard(); this.loadTeachers(); },
  methods: {
    guard() { if (!isAdmin()) { uni.reLaunch({ url: '/pages/login/role' }); } },
    async loadTeachers() {
      this.loading = true;
      try {
        const res = await getTeachers();
        this.teachers = (res.teachers || []).map(t => ({
          ...t, subjects: typeof t.subjects === 'string' ? JSON.parse(t.subjects) : (t.subjects || [])
        }));
      } catch (e) {}
      this.loading = false;
    },
    showAddDialog() {
      this.showForm = true; this.editingId = null;
      this.form = { name:'', phone:'', password:'123456', teacherPhone:'', subjects:[], bio:'', status:'active' };
    },
    editTeacher(t) {
      this.showForm = true; this.editingId = t.id;
      this.form = { name: t.name, phone: t.user_phone, teacherPhone: t.phone || '', subjects: t.subjects || [], bio: t.bio || '', status: t.status };
    },
    hideForm() { this.showForm = false; },
    toggleSubject(s) {
      const idx = this.form.subjects.indexOf(s);
      if (idx > -1) this.form.subjects.splice(idx, 1);
      else this.form.subjects.push(s);
    },
    async submitForm() {
      if (!this.form.name || !this.form.phone) { uni.showToast({ title: '姓名和手机号不能为空', icon: 'none' }); return; }
      try {
        if (this.editingId) {
          await updateTeacher(this.editingId, { subjects: this.form.subjects, bio: this.form.bio, phone: this.form.teacherPhone, status: this.form.status });
        } else {
          await createTeacher({ name: this.form.name, phone: this.form.phone, password: this.form.password, subjects: this.form.subjects, bio: this.form.bio, teacher_phone: this.form.teacherPhone });
        }
        uni.showToast({ title: this.editingId ? '已更新' : '已添加', icon: 'success' });
        this.hideForm(); this.loadTeachers();
      } catch (e) {}
    },
    confirmDelete(t) {
      uni.showModal({ title: '确认删除', content: `确定要删除 ${t.name} 吗？`, success: async (res) => {
        if (res.confirm) { try { await deleteTeacher(t.id); uni.showToast({ title: '已删除', icon: 'success' }); this.loadTeachers(); } catch(e){} }
      }});
    },
    goTo(p) {
      const m = { dashboard: '/pages/admin/dashboard/dashboard', schedule: '/pages/schedule/calendar/calendar', students: '/pages/admin/students/students' };
      uni.navigateTo({ url: m[p] });
    }
  }
};
</script>

<style scoped>
.container { padding-bottom: 120rpx; }
.divider { height: 1rpx; background: #E5E7EB; margin: 16rpx 0; }
.teacher-card { margin-bottom: 16rpx; }
.modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 100; display: flex; align-items: flex-end; }
.modal-mask { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); }
.modal-content { position: relative; width: 100%; max-height: 80vh; background: #FFF; border-radius: 24rpx 24rpx 0 0; padding: 32rpx; overflow-y: auto; }
</style>
