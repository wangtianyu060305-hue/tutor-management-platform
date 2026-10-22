<template>
  <view class="page">
    <view class="bg-circle c1" />
    <view class="bg-circle c2" />

    <!-- 返回 -->
    <view class="back-btn" @click="goBack">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>

    <!-- 头部 -->
    <view class="page-header">
      <image class="page-logo" src="/src/static/logo-128.png" mode="aspectFit" />
      <text class="page-role">👩‍🏫 老师入口</text>
      <text class="page-title">老师登录</text>
    </view>

    <!-- 教学场景宣传 -->
    <view class="feature-cards">
      <view class="f-card">
        <text class="f-icon">🤖</text>
        <text class="f-text">AI 智能备课</text>
      </view>
      <view class="f-card">
        <text class="f-icon">📝</text>
        <text class="f-text">课后反馈</text>
      </view>
      <view class="f-card">
        <text class="f-icon">📚</text>
        <text class="f-text">私有题库</text>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="input-group">
        <text class="input-label">手机号</text>
        <input class="input-field" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
      </view>
      <view class="input-group">
        <text class="input-label">密码</text>
        <input class="input-field" type="password" v-model="password" placeholder="请输入密码" />
      </view>

      <view class="btn-submit" :class="{ loading: loading }" @click="handleLogin">
        <text v-if="!loading">登 录</text>
        <text v-else>登录中...</text>
      </view>

      <view class="divider-row">
        <view class="divider-line" />
        <text class="divider-text">提示</text>
        <view class="divider-line" />
      </view>
      <text class="tip-text">请使用机构管理员分配的账号登录</text>
      <text class="tip-text">如没有账号，请联系管理员添加</text>
    </view>
  </view>
</template>

<script>
import { login as apiLogin } from '../../utils/api';
import { login as authLogin, goToHome, getToken } from '../../utils/auth';

export default {
  data() {
    return { phone: '', password: '', loading: false };
  },
  mounted() {
    if (getToken()) { goToHome(); }
  },
  methods: {
    goBack() { uni.navigateBack(); },
    async handleLogin() {
      if (!this.phone || this.phone.length < 11) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
      if (!this.password) { uni.showToast({ title: '请输入密码', icon: 'none' }); return; }
      this.loading = true;
      try {
        const res = await apiLogin(this.phone, this.password);
        authLogin(res);
        uni.showToast({ title: '欢迎回来，老师！', icon: 'success' });
        setTimeout(() => goToHome(), 500);
      } catch (e) {}
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 0 48rpx 60rpx;
  background: linear-gradient(160deg, #ECFDF5 0%, #D1FAE5 20%, #F0FDF4 50%, #EFF6FF 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.06;
}
.c1 {
  width: 500rpx; height: 500rpx;
  background: #10B981;
  top: -180rpx; right: -140rpx;
}
.c2 {
  width: 400rpx; height: 400rpx;
  background: #059669;
  bottom: -120rpx; left: -120rpx;
}

.back-btn {
  align-self: flex-start;
  display: flex; align-items: center;
  padding: 24rpx 0;
  position: relative; z-index: 1;
}
.back-icon { font-size: 36rpx; color: #059669; margin-right: 8rpx; }
.back-text { font-size: 28rpx; color: #059669; font-weight: 600; }

.page-header {
  text-align: center;
  margin-bottom: 32rpx;
  position: relative; z-index: 1;
}
.page-logo {
  width: 100rpx; height: 100rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(5, 150, 105, 0.12);
  margin-bottom: 20rpx;
}
.page-role {
  display: block;
  font-size: 26rpx; color: #059669; font-weight: 600;
  margin-bottom: 8rpx;
}
.page-title {
  display: block;
  font-size: 38rpx; font-weight: 800; color: #1F2937;
}

/* 功能卡片 */
.feature-cards {
  display: flex;
  gap: 16rpx;
  margin-bottom: 36rpx;
  position: relative; z-index: 1;
  width: 100%;
}
.f-card {
  flex: 1;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
}
.f-icon { font-size: 40rpx; display: block; margin-bottom: 6rpx; }
.f-text { font-size: 22rpx; color: #6B7280; font-weight: 500; }

/* 表单 */
.form {
  width: 100%;
  position: relative; z-index: 1;
}

.input-group { margin-bottom: 20rpx; }
.input-label {
  display: block;
  font-size: 26rpx; font-weight: 600; color: #374151;
  margin-bottom: 10rpx; padding-left: 4rpx;
}
.input-field {
  display: block; width: 100%;
  padding: 22rpx 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #E5E7EB;
  border-radius: 16rpx;
  font-size: 28rpx; color: #1F2937;
  box-sizing: border-box;
  transition: border-color 0.25s;
}
.input-field:focus { border-color: #10B981; }

.btn-submit {
  display: flex; align-items: center; justify-content: center;
  width: 100%;
  padding: 26rpx;
  margin-top: 32rpx;
  background: linear-gradient(135deg, #059669, #10B981);
  color: #FFFFFF;
  font-size: 30rpx; font-weight: 700;
  border-radius: 16rpx;
  letter-spacing: 4rpx;
  transition: transform 0.15s, opacity 0.25s;
}
.btn-submit:active { transform: scale(0.97); opacity: 0.9; }
.btn-submit.loading { opacity: 0.6; }

.divider-row {
  display: flex; align-items: center;
  margin: 32rpx 0 16rpx;
}
.divider-line { flex: 1; height: 1rpx; background: #D1FAE5; }
.divider-text { margin: 0 20rpx; font-size: 24rpx; color: #A7F3D0; }

.tip-text {
  display: block;
  text-align: center;
  font-size: 24rpx; color: #9CA3AF;
  line-height: 1.8;
}
</style>
