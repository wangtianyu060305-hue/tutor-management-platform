<template>
  <view class="container">
    <view class="header card" style="background:linear-gradient(135deg,#F59E0B,#D97706);color:#FFF;"><text class="text-lg text-bold">👋 {{ userName }}</text><text class="text-sm" style="opacity:0.8;display:block;">家长看板</text></view>
    <view class="stats-grid"><view class="stat-card"><text class="stat-icon">📅</text><text class="stat-value">{{ stats.upcomingCourses||0 }}</text><text class="stat-label">待上课</text></view><view class="stat-card"><text class="stat-icon">✅</text><text class="stat-value">{{ stats.completedCourses||0 }}</text><text class="stat-label">已完成</text></view><view class="stat-card"><text class="stat-icon">📝</text><text class="stat-value">{{ stats.feedbackCount||0 }}</text><text class="stat-label">反馈数</text></view><view class="stat-card"><text class="stat-icon">⭐</text><text class="stat-value">{{ stats.avgRating||0 }}</text><text class="stat-label">平均评分</text></view></view>
    <view class="card mt-24"><text class="text-bold mb-24">📋 近期课程</text><view v-if="recentCourses.length===0" class="empty-box"><text class="text-sm text-gray">暂无课程</text></view>
    <view v-for="c in recentCourses" :key="c.id" class="course-item flex-between"><view><text class="text-bold">{{ c.subject }}</text><text class="text-sm text-gray ml-12">{{ c.start_time }}</text></view><text class="text-sm text-gray">{{ c.teacher_name }}</text></view></view>
    <view class="card mt-24"><text class="text-bold mb-24">📝 最近反馈</text><feedback-card v-for="f in recentFeedbacks" :key="f.id" :item="f" :showTeacher="true" /></view>
  </view>
</template>
<script>
import { getDashboardStats } from '../../../utils/api'; import { getUserInfo } from '../../../utils/auth';
export default { data(){return{userName:'',stats:{},recentCourses:[],recentFeedbacks:[]}}, mounted(){this.refresh()}, onShow(){this.refresh()}, methods:{refresh(){const u=getUserInfo();if(!u)return;this.userName=u.name;this.loadStats()},async loadStats(){try{const r=await getDashboardStats();this.stats=r.stats;this.recentCourses=r.recentCourses||[];this.recentFeedbacks=r.recentFeedbacks||[]}catch(e){}}}};
</script>
<style scoped>.container{padding-bottom:60rpx}.header{border-radius:20rpx;margin-bottom:24rpx}.stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:16rpx;margin-bottom:20rpx}.stat-card{background:#FFF;border-radius:16rpx;padding:28rpx;text-align:center}.stat-icon{font-size:44rpx;display:block;margin-bottom:8rpx}.stat-value{font-size:40rpx;font-weight:700;color:#4F46E5;display:block}.stat-label{font-size:24rpx;color:#6B7280;margin-top:4rpx;display:block}.course-item{padding:16rpx 0;border-bottom:1rpx solid #F3F4F6}.course-item:last-child{border-bottom:none}</style>
