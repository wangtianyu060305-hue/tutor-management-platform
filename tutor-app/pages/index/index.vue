<template>
  <view class="splash">
    <image class="splash-logo" src="/src/static/logo-256.png" mode="aspectFit" />
    <text class="splash-title">家教管理</text>
  </view>
</template>

<script>
import { goToHome, getToken } from '../../utils/auth';

export default {
  mounted() {
    if (getToken()) {
      goToHome();
    } else {
      setTimeout(() => {
        uni.reLaunch({ url: '/pages/login/role' });
      }, 300);
    }
  }
};
</script>

<style scoped>
.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #F5F3FF, #EFF6FF);
}
.splash-logo {
  width: 160rpx;
  height: 160rpx;
  border-radius: 36rpx;
  box-shadow: 0 16rpx 48rpx rgba(79, 70, 229, 0.15);
  margin-bottom: 24rpx;
}
.splash-title {
  font-size: 36rpx;
  font-weight: 800;
  color: #4F46E5;
  letter-spacing: 4rpx;
}
</style>
