<template>
  <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
    <view class="navbar-inner">
      <view class="navbar-left" @click="goBack">
        <text v-if="showBack" class="navbar-back">← 返回</text>
      </view>
      <text class="navbar-title">{{ title }}</text>
      <view class="navbar-right" />
    </view>
  </view>
</template>

<script>
export default {
  name: 'Navbar',
  props: {
    title: { type: String, default: '家教管理' },
    showBack: { type: Boolean, default: false }
  },
  emits: [],
  data() {
    return {
      statusBarHeight: 0
    };
  },
  created() {
    const info = uni.getSystemInfoSync();
    this.statusBarHeight = info.statusBarHeight || 20;
  },
  methods: {
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.navbar {
  background: #FFFFFF;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
}
.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  position: relative;
  padding: 0 24rpx;
}
.navbar-left {
  position: absolute;
  left: 24rpx;
  display: flex;
  align-items: center;
}
.navbar-back {
  font-size: 28rpx;
  color: #4F46E5;
}
.navbar-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1F2937;
}
.navbar-right {
  position: absolute;
  right: 24rpx;
}
</style>
