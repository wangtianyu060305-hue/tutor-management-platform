<template>
  <view class="course-card">
    <view class="flex-between">
      <view>
        <text class="text-bold">{{ item.subject }}</text>
        <text class="tag ml-12" :class="statusClass">{{ statusLabel }}</text>
      </view>
      <text class="text-sm text-gray">{{ item.start_time }}</text>
    </view>
    <view class="flex-between mt-12 text-sm text-gray">
      <text>👩‍🏫 {{ item.teacher_name }}</text>
      <text>👨‍🎓 {{ item.student_name }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CourseCard',
  props: {
    item: { type: Object, default: () => ({}) }
  },
  emits: [],
  computed: {
    statusClass() {
      const s = this.item?.status;
      if (s === 'scheduled') return 'tag-blue';
      if (s === 'completed') return 'tag-green';
      return 'tag-red';
    },
    statusLabel() {
      const s = this.item?.status;
      if (s === 'scheduled') return '待上';
      if (s === 'completed') return '已完成';
      return '已取消';
    }
  }
};
</script>

<style scoped>
.course-card { padding: 20rpx 0; border-bottom: 1rpx solid #F3F4F6; }
.course-card:last-child { border-bottom: none; }
</style>
