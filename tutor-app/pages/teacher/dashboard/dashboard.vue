<template>
  <view class="container">
    <view class="header card" style="background:linear-gradient(135deg,#059669,#10B981);color:#FFF;">
      <text class="text-lg text-bold">👋 {{ userName }}老师</text>
      <text class="text-sm" style="opacity:0.8;">今天是 {{ today }}</text>
    </view>
    <view class="stats-grid">
      <view class="stat-card"><text class="stat-icon">📅</text><text class="stat-value">{{ stats.todayCourses || 0 }}</text><text class="stat-label">今日课程</text></view>
      <view class="stat-card"><text class="stat-icon">👨‍🎓</text><text class="stat-value">{{ stats.myStudents || 0 }}</text><text class="stat-label">我的学生</text></view>
      <view class="stat-card"><text class="stat-icon">⏱️</text><text class="stat-value">{{ stats.monthlyHours || 0 }}h</text><text class="stat-label">本月课时</text></view>
      <view class="stat-card"><text class="stat-icon">⚠️</text><text class="stat-value">{{ stats.pendingFeedbackCount || 0 }}</text><text class="stat-label">待写反馈</text></view>
    </view>
    <view class="ai-entry card mt-24" @click="goToLessonPlan" style="background:linear-gradient(135deg,#8B5CF6,#6D28D9);color:#FFF;display:flex;align-items:center;justify-content:space-between;">
      <view><text class="text-bold" style="font-size:30rpx;">🤖 AI 自动备课</text><text class="text-sm" style="display:block;opacity:0.8;margin-top:4rpx;">告诉AI学生的问题，一键生成教案</text></view>
      <text style="font-size:48rpx;">▶</text>
    </view>
    <view class="card mt-24"><text class="text-bold mb-24">📋 今日课表</text>
      <view v-if="todaySchedule.length===0" class="empty-box"><text>🎉</text><text class="text-sm text-gray">今天没有课程</text></view>
      <view v-for="c in todaySchedule" :key="c.id" class="course-item flex-between" @click="goToCourse(c.id)">
        <view><text class="text-bold">{{ c.subject }}</text><text class="text-sm text-gray ml-12">{{ c.start_time.slice(11,16) }}~{{ c.end_time.slice(11,16) }}</text></view>
        <text class="text-sm text-gray">{{ c.student_name }}</text>
      </view>
    </view>
    <view class="card mt-24" v-if="pendingFeedback.length>0"><text class="text-bold mb-24">⚠️ 待写反馈</text>
      <view v-for="c in pendingFeedback" :key="c.id" class="course-item flex-between" @click="writeFeedback(c)">
        <text>{{ c.student_name }} · {{ c.subject }}</text><view class="btn-primary btn-sm">写反馈</view>
      </view>
    </view>
    <bottom-nav role="teacher" active="dashboard" />
  </view>
</template>

<script>
import { getDashboardStats } from '../../../utils/api';
import { getUserInfo } from '../../../utils/auth';

export default {
  data() { return { userName:'', today:'', stats:{}, todaySchedule:[], pendingFeedback:[] }; },
  mounted() { this.refresh(); },
  onShow() { this.refresh(); },
  methods: {
    refresh() {
      const u = getUserInfo(); if (!u) return;
      this.userName = u.name;
      const n = new Date(); const w = ['日','一','二','三','四','五','六'];
      this.today = `${n.getFullYear()}年${String(n.getMonth()+1).padStart(2,'0')}月${String(n.getDate()).padStart(2,'0')}日 星期${w[n.getDay()]}`;
      this.loadStats();
    },
    async loadStats() {
      try { const r = await getDashboardStats(); this.stats = r.stats; this.todaySchedule = r.todaySchedule || []; this.pendingFeedback = r.pendingFeedback || []; } catch(e){}
    },
    goToCourse(id) { uni.navigateTo({ url:`/pages/schedule/detail/detail?id=${id}` }); },
    goToLessonPlan() { uni.navigateTo({ url:'/pages/teacher/lesson-plan/lesson-plan' }); },
    goTo(p) {
      const m = { schedule:'/pages/schedule/calendar/calendar', students:'/pages/teacher/my-students/my-students', feedbacks:'/pages/feedback/list/list' };
      uni.navigateTo({ url:m[p] });
    },
    writeFeedback(c) { uni.navigateTo({ url:`/pages/feedback/create/create?courseId=${c.id}&studentId=${c.student_id}&studentName=${c.student_name}` }); }
  }
};
</script>

<style scoped>
.container { padding-bottom: 120rpx; }
.header { border-radius: 20rpx; margin-bottom: 24rpx; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16rpx; margin-bottom: 20rpx; }
.stat-card { background: #FFF; border-radius: 16rpx; padding: 28rpx; text-align: center; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.stat-icon { font-size: 44rpx; display: block; margin-bottom: 8rpx; }
.stat-value { font-size: 40rpx; font-weight: 700; color: #4F46E5; display: block; }
.stat-label { font-size: 24rpx; color: #6B7280; margin-top: 4rpx; display: block; }
.ai-entry { border-radius: 16rpx; }
.course-item { padding: 16rpx 0; border-bottom: 1rpx solid #F3F4F6; }
.course-item:last-child { border-bottom: none; }
</style>
