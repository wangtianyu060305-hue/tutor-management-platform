<template>
  <view class="container"><view v-if="!fb" class="empty-box"><text>加载中...</text></view>
  <view v-else class="card"><view class="flex-between"><text class="text-lg text-bold">{{ fb.title }}</text><text>{{ '⭐'.repeat(fb.rating||0) }}</text></view>
  <view class="mt-12 text-sm text-gray"><text>👨‍🎓 {{ fb.student_name }}</text><text class="ml-12">👩‍🏫 {{ fb.teacher_name }}</text><text class="ml-12">🕐 {{ fb.created_at }}</text></view>
  <view class="mt-24"><text class="text-sm" style="line-height:1.8;">{{ fb.content }}</text></view>
  <view v-if="fb.highlights" class="mt-16"><text class="tag tag-green">🌟 {{ fb.highlights }}</text></view>
  <view v-if="fb.areas_to_improve" class="mt-12"><text class="tag tag-orange">📝 {{ fb.areas_to_improve }}</text></view>
  <view v-if="fb.homework" class="mt-16"><text class="text-bold">📚 作业：</text><text class="text-sm">{{ fb.homework }}</text></view></view></view>
</template>
<script>
import { getFeedback } from '../../../utils/api';
export default { data(){return{id:'',fb:null}}, mounted(){const pages=getCurrentPages();this.id=pages[pages.length-1].$page.options.id||'';this.load()}, methods:{async load(){try{const r=await getFeedback(this.id);this.fb=r.feedback}catch(e){}}}};
</script>
<style scoped>.container{padding-bottom:60rpx}</style>
