<template><view class="container"><text class="text-lg text-bold mb-24">孩子的反馈</text><feedback-card v-for="f in feedbacks" :key="f.id" :item="f" :showTeacher="true" /></view></template>
<script>import { getFeedbacks } from '../../../utils/api'; export default { data(){return{feedbacks:[]}}, mounted(){this.load()}, methods:{async load(){try{const r=await getFeedbacks();this.feedbacks=r.feedbacks||[]}catch(e){}}}};</script>
<style scoped>.container{padding-bottom:60rpx}</style>
