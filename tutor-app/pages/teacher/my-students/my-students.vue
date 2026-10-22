<template>
  <view class="container">
    <text class="text-lg text-bold mb-24">我的学生 ({{ students.length }})</text>
    <view v-if="students.length===0" class="empty-box"><text>👨‍🎓</text><text class="text-sm text-gray">暂无学生</text></view>
    <view v-for="s in students" :key="s.id" class="student-card card">
      <view class="flex-between"><view><text class="text-bold" style="font-size:32rpx;">{{ s.name }}</text><text class="tag tag-blue ml-12">{{ s.grade }}</text></view></view>
      <view class="mt-12"><text v-for="sub in s.subjects" :key="sub" class="tag tag-purple">{{ sub }}</text></view>
      <view v-if="s.parent_name" class="mt-12 text-sm text-gray"><text>👨‍👩‍👧 家长：{{ s.parent_name }}</text></view>
      <view v-if="s.notes" class="mt-12 text-sm text-gray">📝 {{ s.notes }}</view>
      <view class="divider" />
      <view class="flex-between"><text class="text-sm text-gray">✅ {{ s.completed_courses||0 }} 节已完成</text><text class="text-sm text-gray">📅 {{ s.upcoming_courses||0 }} 节待上</text></view>
    </view>
    <bottom-nav role="teacher" active="students" />
  </view>
</template>
<script>
import { getStudents } from '../../../utils/api';
export default { data(){return{students:[]}}, mounted(){this.load()}, onShow(){this.load()}, methods:{async load(){try{const r=await getStudents();this.students=(r.students||[]).map(s=>({...s,subjects:typeof s.subjects==='string'?JSON.parse(s.subjects):(s.subjects||[])}))}catch(e){}},goTo(p){const m={dashboard:'/pages/teacher/dashboard/dashboard',schedule:'/pages/schedule/calendar/calendar',feedbacks:'/pages/feedback/list/list'};uni.navigateTo({url:m[p]})}}};
</script>
<style scoped>.container{padding-bottom:120rpx}.divider{height:1rpx;background:#E5E7EB;margin:16rpx 0}.student-card{margin-bottom:16rpx}</style>
