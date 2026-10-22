<template>
  <view class="page">
    <!-- 顶部装饰 -->
    <view class="top-arc" />

    <!-- 返回 -->
    <view class="back-btn" @click="goBack">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>

    <!-- 头部 -->
    <view class="page-header">
      <image class="page-logo" src="/src/static/logo-128.png" mode="aspectFit" />
      <text class="page-role">👨‍🎓 学生/家长入口</text>
      <text class="page-title">学生登录</text>
      <text class="page-subtitle">查看课程安排与学习反馈</text>
    </view>

    <!-- 场景图 -->
    <view class="scene-row">
      <view class="scene-item">
        <text class="scene-icon">📅</text>
        <text class="scene-label">课程表</text>
      </view>
      <view class="scene-arrow">→</view>
      <view class="scene-item">
        <text class="scene-icon">📝</text>
        <text class="scene-label">反馈</text>
      </view>
      <view class="scene-arrow">→</view>
      <view class="scene-item">
        <text class="scene-icon">⭐</text>
        <text class="scene-label">评分</text>
      </view>
      <view class="scene-arrow">→</view>
      <view class="scene-item">
        <text class="scene-icon">📈</text>
        <text class="scene-label">进步</text>
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
      <text class="tip-text">请使用机构分配的家长/学生账号登录</text>
      <text class="tip-text">如没有账号，请联系培训机构老师</text>
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
        uni.showToast({ title: '登录成功！', icon: 'success' });
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
  background: linear-gradient(160deg, #FFF7ED 0%, #FFEDD5 20%, #FFF7ED 50%, #FEFCE8 80%, #F8FAFC 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.top-arc {
  position: absolute;
  top: -60rpx;
  left: -10%;
  width: 120%;
  height: 300rpx;
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  border-radius: 0 0 50% 50%;
  opacity: 0.06;
}

.back-btn {
  align-self: flex-start;
  display: flex; align-items: center;
  padding: 24rpx 0;
  position: relative; z-index: 1;
}
.back-icon { font-size: 36rpx; color: #EA580C; margin-right: 8rpx; }
.back-text { font-size: 28rpx; color: #EA580C; font-weight: 600; }

.page-header {
  text-align: center;
  margin-bottom: 32rpx;
  position: relative; z-index: 1;
}
.page-logo {
  width: 100rpx; height: 100rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(245, 158, 11, 0.12);
  margin-bottom: 20rpx;
}
.page-role {
  display: block;
  font-size: 26rpx; color: #EA580C; font-weight: 600;
  margin-bottom: 8rpx;
}
.page-title {
  display: block;
  font-size: 38rpx; font-weight: 800; color: #1F2937;
}
.page-subtitle {
  display: block;
  font-size: 26rpx; color: #9CA3AF;
  margin-top: 10rpx;
}

/* 场景流程 */
.scene-row {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 36rpx;
  position: relative; z-index: 1;
  width: 100%;
}
.scene-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.scene-icon { font-size: 44rpx; margin-bottom: 4rpx; }
.scene-label { font-size: 22rpx; color: #9CA3AF; font-weight: 500; }
.scene-arrow {
  font-size: 32rpx; color: #FCD34D;
  margin: 0 8rpx;
  padding-bottom: 20rpx;
}

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
.input-field:focus { border-color: #F97316; }

.btn-submit {
  display: flex; align-items: center; justify-content: center;
  width: 100%;
  padding: 26rpx;
  margin-top: 32rpx;
  background: linear-gradient(135deg, #F59E0B, #F97316);
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
.divider-line { flex: 1; height: 1rpx; background: #FED7AA; }
.divider-text { margin: 0 20rpx; font-size: 24rpx; color: #FDBA74; }

.tip-text {
  display: block;
  text-align: center;
  font-size: 24rpx; color: #9CA3AF;
  line-height: 1.8;
}
</style>
