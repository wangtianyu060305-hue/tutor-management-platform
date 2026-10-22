<template>
  <view class="container">
    <view class="header card" style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: #FFF;">
      <text class="text-lg text-bold">👋 你好，{{ userName }}</text>
      <text class="text-sm" style="opacity:0.8;display:block;">🏢 {{ institutionName }}</text>
      <text class="text-sm" style="opacity:0.7;">{{ today }}</text>
    </view>

    <view class="stats-grid">
      <view class="stat-card"><text class="stat-icon">📅</text><text class="stat-value">{{ stats.todayCourses || 0 }}</text><text class="stat-label">今日课程</text></view>
      <view class="stat-card"><text class="stat-icon">👩‍🏫</text><text class="stat-value">{{ stats.activeTeachers || 0 }}</text><text class="stat-label">活跃老师</text></view>
      <view class="stat-card"><text class="stat-icon">👨‍🎓</text><text class="stat-value">{{ stats.totalStudents || 0 }}</text><text class="stat-label">在学学生</text></view>
      <view class="stat-card"><text class="stat-icon">⏱️</text><text class="stat-value">{{ stats.monthlyHours || 0 }}h</text><text class="stat-label">本月课时</text></view>
    </view>

    <view class="quick-actions card">
      <text class="text-bold">快捷操作</text>
      <view class="action-grid mt-24">
        <view class="action-item" @click="goTo('schedule')"><text class="action-icon">📅</text><text>排课管理</text></view>
        <view class="action-item" @click="goTo('teachers')"><text class="action-icon">👩‍🏫</text><text>老师管理</text></view>
        <view class="action-item" @click="goTo('students')"><text class="action-icon">👨‍🎓</text><text>学生管理</text></view>
        <view class="action-item" @click="goTo('feedbacks')"><text class="action-icon">📝</text><text>反馈管理</text></view>
        <view class="action-item" @click="goTo('lessonPlan')"><text class="action-icon">🤖</text><text>AI 备课</text></view>
      </view>
    </view>

    <view class="card mt-24" v-if="pendingFeedback.length > 0">
      <view class="flex-between mb-24">
        <text class="text-bold">⚠️ 待写反馈 ({{ pendingFeedback.length }})</text>
        <text class="text-sm" style="color:#4F46E5" @click="goTo('feedbacks')">全部</text>
      </view>
      <view v-for="item in pendingFeedback" :key="item.id" class="pending-item flex-between">
        <view>
          <text class="text-bold">{{ item.student_name }}</text>
          <text class="text-sm text-gray ml-12">{{ item.teacher_name }} · {{ item.subject }}</text>
        </view>
        <view class="btn-primary btn-sm" @click="writeFeedback(item)">写反馈</view>
      </view>
    </view>

    <view class="card mt-24">
      <text class="text-bold mb-24">最近反馈</text>
      <view v-if="recentFeedbacks.length === 0" class="empty-box"><text>📭</text><text class="text-sm text-gray">暂无反馈记录</text></view>
      <feedback-card v-for="item in recentFeedbacks" :key="item.id" :item="item" :showStudent="true" />
    </view>

    <bottom-nav role="admin" active="dashboard" />
  </view>
</template>

<script>
import { getDashboardStats } from '../../../utils/api';
import { getUserInfo, getInstitution, isSuperAdmin, isAdmin } from '../../../utils/auth';

export default {
  data() {
    return {
      userName: '', institutionName: '', isSuper: false, today: '',
      stats: {}, pendingFeedback: [], recentFeedbacks: []
    };
  },
  mounted() { this.guard(); this.refresh(); },
  onShow() { this.guard(); this.refresh(); },
  methods: {
    guard() {
      if (!isAdmin()) { uni.reLaunch({ url: '/pages/login/role' }); return; }
    },
    refresh() {
      const user = getUserInfo();
      if (!user) return;
      const inst = getInstitution();
      this.userName = user.name;
      this.institutionName = inst ? inst.name : '平台管理';
      this.isSuper = isSuperAdmin();
      const now = new Date();
      const week = ['日','一','二','三','四','五','六'];
      this.today = `${now.getFullYear()}年${String(now.getMonth()+1).padStart(2,'0')}月${String(now.getDate()).padStart(2,'0')}日 星期${week[now.getDay()]}`;
      this.loadStats();
    },
    async loadStats() {
      try {
        const res = await getDashboardStats();
        this.stats = res.stats;
        this.pendingFeedback = res.pendingFeedback || [];
        this.recentFeedbacks = res.recentFeedbacks || [];
      } catch (e) {}
    },
    goTo(page) {
      const map = {
        schedule: '/pages/schedule/calendar/calendar',
        teachers: '/pages/admin/teachers/teachers',
        students: '/pages/admin/students/students',
        feedbacks: '/pages/feedback/list/list',
        lessonPlan: '/pages/teacher/lesson-plan/lesson-plan'
      };
      uni.navigateTo({ url: map[page] });
    },
    writeFeedback(course) {
      uni.navigateTo({ url: `/pages/feedback/create/create?courseId=${course.id}&studentId=${course.student_id}&studentName=${course.student_name}` });
    }
  }
};
</script>

<style scoped>
.container { padding-bottom: 120rpx; }
.header { border-radius: 20rpx; margin-bottom: 24rpx; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; margin-bottom: 20rpx; }
.stat-card { background: #FFFFFF; border-radius: 16rpx; padding: 28rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.stat-icon { font-size: 44rpx; display: block; margin-bottom: 8rpx; }
.stat-value { font-size: 40rpx; font-weight: 700; color: #4F46E5; display: block; }
.stat-label { font-size: 24rpx; color: #6B7280; margin-top: 4rpx; display: block; }
.action-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16rpx; }
.action-item { display: flex; flex-direction: column; align-items: center; padding: 20rpx 0; background: #F9FAFB; border-radius: 12rpx; font-size: 24rpx; }
.action-icon { font-size: 48rpx; margin-bottom: 8rpx; }
.pending-item { padding: 16rpx 0; border-bottom: 1rpx solid #F3F4F6; }
.pending-item:last-child { border-bottom: none; }
</style>
