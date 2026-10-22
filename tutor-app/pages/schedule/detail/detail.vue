<template>
  <view class="container"><view v-if="!course" class="empty-box"><text>加载中...</text></view>
  <view v-else class="card"><text class="text-lg text-bold">{{ course.subject }}</text><text :class="'tag tag-'+(course.status==='scheduled'?'green':course.status==='completed'?'blue':'red')+' ml-12'">{{ course.status==='scheduled'?'待上课':course.status==='completed'?'已完成':'已取消' }}</text>
  <view class="mt-24 text-sm text-gray"><text>👩‍🏫 {{ course.teacher_name }}</text><text class="ml-12">👨‍🎓 {{ course.student_name }}({{ course.student_grade }})</text></view>
  <view class="mt-12 text-sm text-gray"><text>🕐 {{ course.start_time }} ~ {{ course.end_time }}</text></view>
  <view v-if="course.location" class="mt-12 text-sm text-gray"><text>📍 {{ course.location }}</text></view>
  <view v-if="course.notes" class="mt-12 text-sm text-gray"><text>📝 {{ course.notes }}</text></view>
  <view class="flex-row mt-24" v-if="course.status==='scheduled'">
    <view class="btn-outline flex-1 mr-12" @click="cancelCourse">取消课程</view>
    <view class="btn-primary flex-1" @click="completeCourse">✅ 标记完成</view>
  </view></view></view>
</template>
<script>
import { getCourse, deleteCourse, completeCourse } from '../../../utils/api';
export default { data(){return{id:'',course:null}}, mounted(){const pages=getCurrentPages();const p=pages[pages.length-1];this.id=p.$page.options.id||'';this.load()}, methods:{async load(){try{const r=await getCourse(this.id);this.course=r.course}catch(e){}},async cancelCourse(){uni.showModal({title:'确认取消',content:'确定取消该课程？',success:async(r)=>{if(r.confirm){try{await deleteCourse(this.id);uni.showToast({title:'已取消',icon:'success'});this.load()}catch(e){}}}})},async completeCourse(){uni.showModal({title:'确认完成',content:'标记完成后记得给家长写反馈~',success:async(r)=>{if(r.confirm){try{await completeCourse(this.id);uni.showToast({title:'已完成',icon:'success'});this.load()}catch(e){}}}})}}};
</script>
<style scoped>.container{padding-bottom:60rpx}</style>
