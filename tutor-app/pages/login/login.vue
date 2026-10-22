<template>
  <view class="page" :class="showReg ? 'mode-register' : 'mode-login'">
    <view class="bg-blob" />

    <!-- 返回按钮 -->
    <view class="back-btn" @click="goBack">
      <text class="back-icon">←</text>
      <text class="back-text">返回</text>
    </view>

    <!-- 头部 -->
    <view class="page-header">
      <image class="page-logo" src="/src/static/logo-128.png" mode="aspectFit" />
      <text class="page-role">🏢 教育培训机构</text>
      <text class="page-title">管理员登录</text>
    </view>

    <!-- 登录表单 -->
    <view class="form" v-if="!showReg">
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
        <text class="divider-text">测试账号</text>
        <view class="divider-line" />
      </view>
      <view class="test-accounts">
        <text class="test-item">超管：13800000000 / 123456</text>
        <text class="test-item">机构：13800000001 / 123456</text>
      </view>

      <text class="switch-link" @click="showReg = true">🏢 没有账号？注册培训机构 →</text>
    </view>

    <!-- 注册表单 -->
    <view class="form" v-if="showReg">
      <text class="form-section-title">注册教育培训机构</text>

      <view class="input-group">
        <text class="input-label">机构名称 *</text>
        <input class="input-field" v-model="institutionName" placeholder="如：星辰教育培训学校" />
      </view>
      <view class="input-group">
        <text class="input-label">管理员姓名 *</text>
        <input class="input-field" v-model="name" placeholder="你的姓名" />
      </view>
      <view class="input-group">
        <text class="input-label">手机号 *</text>
        <input class="input-field" type="number" v-model="phone" placeholder="登录用手机号" maxlength="11" />
      </view>
      <view class="input-group">
        <text class="input-label">密码 *</text>
        <input class="input-field" type="password" v-model="password" placeholder="至少6位" />
      </view>

      <view class="btn-submit reg-btn" :class="{ loading: loading }" @click="handleRegister">
        <text v-if="!loading">注册并开通机构</text>
        <text v-else>注册中...</text>
      </view>

      <text class="switch-link" @click="showReg = false">← 已有账号？返回登录</text>
    </view>
  </view>
</template>

<script>
import { login as apiLogin, registerInstitution } from '../../utils/api';
import { login as authLogin, goToHome, getToken } from '../../utils/auth';

export default {
  data() {
    return {
      phone: '', password: '', loading: false,
      showReg: false, name: '', institutionName: ''
    };
  },
  mounted() {
    if (getToken()) { goToHome(); }
  },
  methods: {
    goBack() {
      if (this.showReg) { this.showReg = false; return; }
      uni.navigateBack();
    },
    async handleLogin() {
      if (!this.phone || this.phone.length < 11) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
      if (!this.password) { uni.showToast({ title: '请输入密码', icon: 'none' }); return; }
      this.loading = true;
      try {
        const res = await apiLogin(this.phone, this.password);
        authLogin(res);
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => goToHome(), 500);
      } catch (e) {}
      this.loading = false;
    },
    async handleRegister() {
      if (!this.phone || this.phone.length < 11) { uni.showToast({ title: '请输入正确的手机号', icon: 'none' }); return; }
      if (!this.password || this.password.length < 6) { uni.showToast({ title: '密码至少6位', icon: 'none' }); return; }
      if (!this.name) { uni.showToast({ title: '请输入姓名', icon: 'none' }); return; }
      if (!this.institutionName) { uni.showToast({ title: '请输入机构名称', icon: 'none' }); return; }
      this.loading = true;
      try {
        const res = await registerInstitution(this.phone, this.password, this.name, this.institutionName);
        authLogin(res);
        uni.showToast({ title: `${this.institutionName} 注册成功！`, icon: 'success' });
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
  background: linear-gradient(160deg, #F5F3FF 0%, #EEEBFF 30%, #EFF6FF 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.bg-blob {
  position: absolute;
  top: -200rpx;
  right: -160rpx;
  width: 600rpx;
  height: 600rpx;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.06) 0%, transparent 70%);
  border-radius: 50%;
}

/* 返回 */
.back-btn {
  align-self: flex-start;
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  position: relative;
  z-index: 1;
}
.back-icon { font-size: 36rpx; color: #4F46E5; margin-right: 8rpx; }
.back-text { font-size: 28rpx; color: #4F46E5; font-weight: 600; }

/* 头部 */
.page-header {
  text-align: center;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}
.page-logo {
  width: 100rpx; height: 100rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 70, 229, 0.15);
  margin-bottom: 20rpx;
}
.page-role {
  display: block;
  font-size: 26rpx;
  color: #7C3AED;
  font-weight: 600;
  margin-bottom: 8rpx;
}
.page-title {
  display: block;
  font-size: 38rpx;
  font-weight: 800;
  color: #1F2937;
}

/* 表单 */
.form {
  width: 100%;
  position: relative;
  z-index: 1;
}
.form-section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 28rpx;
}

.input-group { margin-bottom: 20rpx; }
.input-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10rpx;
  padding-left: 4rpx;
}
.input-field {
  display: block;
  width: 100%;
  padding: 22rpx 24rpx;
  background: #FFFFFF;
  border: 2rpx solid #E5E7EB;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #1F2937;
  box-sizing: border-box;
  transition: border-color 0.25s;
}
.input-field:focus { border-color: #7C3AED; }

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 26rpx;
  margin-top: 32rpx;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 16rpx;
  letter-spacing: 4rpx;
  transition: transform 0.15s, opacity 0.25s;
}
.btn-submit:active { transform: scale(0.97); opacity: 0.9; }
.btn-submit.loading { opacity: 0.6; }

.reg-btn {
  background: linear-gradient(135deg, #059669, #10B981);
  letter-spacing: 2rpx;
}

.divider-row {
  display: flex;
  align-items: center;
  margin: 32rpx 0 16rpx;
}
.divider-line { flex: 1; height: 1rpx; background: #E5E7EB; }
.divider-text { margin: 0 20rpx; font-size: 24rpx; color: #D1D5DB; }

.test-accounts {
  text-align: center;
  margin-bottom: 20rpx;
}
.test-item {
  display: block;
  font-size: 24rpx;
  color: #9CA3AF;
  line-height: 1.8;
}

.switch-link {
  display: block;
  text-align: center;
  margin-top: 28rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #7C3AED;
}
</style>
