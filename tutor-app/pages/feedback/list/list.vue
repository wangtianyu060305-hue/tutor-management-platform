<template>
  <view class="container">
    <text class="text-lg text-bold mb-24">反馈列表 ({{ feedbacks.length }})</text>
    <view v-if="feedbacks.length===0" class="empty-box"><text>📝</text><text class="text-sm text-gray">暂无反馈</text></view>
    <feedback-card v-for="f in feedbacks" :key="f.id" :item="f" :showStudent="true" :showTeacher="true" @click="goDetail(f.id)" />
  </view>
</template>
<script>
import { getFeedbacks } from '../../../utils/api';
export default { data(){return{feedbacks:[]}}, mounted(){this.load()}, onLoad(o){if(o&&o.studentId)this.studentId=o.studentId}, methods:{async load(){try{const p={};if(this.studentId)p.student_id=this.studentId;const r=await getFeedbacks(p);this.feedbacks=r.feedbacks||[]}catch(e){}},goDetail(id){uni.navigateTo({url:`/pages/feedback/detail/detail?id=${id}`})}}};
</script>
<style scoped>.container{padding-bottom:60rpx}</style>
