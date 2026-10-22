<template>
  <view class="feedback-card">
    <view class="flex-between">
      <text class="text-bold">{{ item.title }}</text>
      <text>{{ stars }}</text>
    </view>

    <view class="mt-12 text-sm text-gray flex-row">
      <text v-if="showStudent">👨‍🎓 {{ item.student_name }}</text>
      <text v-if="showTeacher" class="ml-12">👩‍🏫 {{ item.teacher_name }}</text>
      <text class="ml-12">🕐 {{ item.created_at }}</text>
    </view>

    <view class="mt-12">
      <text class="text-sm" style="line-height:1.6;color:#4B5563;">{{ item.content }}</text>
    </view>

    <view v-if="item.highlights" class="mt-12 flex-row">
      <text class="tag tag-green">🌟 {{ item.highlights }}</text>
    </view>

    <view class="mt-12 flex-row">
      <text class="tag tag-purple">{{ typeLabel }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FeedbackCard',
  props: {
    item: { type: Object, default: () => ({}) },
    showStudent: { type: Boolean, default: false },
    showTeacher: { type: Boolean, default: false }
  },
  emits: [],
  computed: {
    stars() {
      const r = parseInt(this.item?.rating) || 0;
      return '⭐'.repeat(r);
    },
    typeLabel() {
      const t = this.item?.type;
      if (t === 'after_class') return '课后反馈';
      if (t === 'weekly') return '周报';
      return '月报';
    }
  }
};
</script>

<style scoped>
.feedback-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
</style>
