<template>
  <view class="role-page">
    <!-- 顶部装饰 -->
    <view class="top-wave" />

    <!-- 头部 -->
    <view class="role-header">
      <image class="role-logo" src="/src/static/logo-128.png" mode="aspectFit" />
      <text class="role-title">家教管理</text>
      <text class="role-subtitle">请选择你的身份</text>
    </view>

    <!-- 角色卡片 -->
    <view class="role-cards">
      <!-- 管理员卡片 -->
      <view class="role-card admin-card" @click="goLogin('admin')" hover-class="card-hover">
        <view class="card-glow" />
        <view class="card-icon-wrap admin-bg">
          <text class="card-icon">🏢</text>
        </view>
        <view class="card-info">
          <text class="card-name">我是管理员</text>
          <text class="card-desc">教育培训机构管理者</text>
        </view>
        <view class="card-features">
          <text class="feat-tag admin-tag">📊 数据看板</text>
          <text class="feat-tag admin-tag">👩‍🏫 老师管理</text>
          <text class="feat-tag admin-tag">👨‍🎓 学生管理</text>
          <text class="feat-tag admin-tag">📅 排课系统</text>
        </view>
        <view class="card-arrow">
          <text class="arrow-icon">→</text>
        </view>
      </view>

      <!-- 老师卡片 -->
      <view class="role-card teacher-card" @click="goLogin('teacher')" hover-class="card-hover">
        <view class="card-glow" />
        <view class="card-icon-wrap teacher-bg">
          <text class="card-icon">👩‍🏫</text>
        </view>
        <view class="card-info">
          <text class="card-name">我是老师</text>
          <text class="card-desc">查看课程、写反馈、AI备课</text>
        </view>
        <view class="card-features">
          <text class="feat-tag teacher-tag">📅 我的课表</text>
          <text class="feat-tag teacher-tag">🤖 AI 备课</text>
          <text class="feat-tag teacher-tag">📝 写反馈</text>
          <text class="feat-tag teacher-tag">📚 我的题库</text>
        </view>
        <view class="card-arrow">
          <text class="arrow-icon">→</text>
        </view>
      </view>

      <!-- 学生/家长卡片 -->
      <view class="role-card parent-card" @click="goLogin('parent')" hover-class="card-hover">
        <view class="card-glow" />
        <view class="card-icon-wrap parent-bg">
          <text class="card-icon">👨‍🎓</text>
        </view>
        <view class="card-info">
          <text class="card-name">我是学生/家长</text>
          <text class="card-desc">查看课程与学习反馈</text>
        </view>
        <view class="card-features">
          <text class="feat-tag parent-tag">📅 课程查看</text>
          <text class="feat-tag parent-tag">📝 学习反馈</text>
          <text class="feat-tag parent-tag">⭐ 课堂评分</text>
          <text class="feat-tag parent-tag">📚 作业查看</text>
        </view>
        <view class="card-arrow">
          <text class="arrow-icon">→</text>
        </view>
      </view>
    </view>

    <!-- 底部提示 -->
    <text class="role-footer">首次使用？请联系培训机构获取账号</text>
  </view>
</template>

<script>
import { getToken } from '../../utils/auth';

export default {
  data() {
    return {
      cardsLoaded: false
    };
  },
  mounted() {
    // 卡片逐个弹出动画
    this.$nextTick(() => {
      const cards = document.querySelectorAll('.role-card');
      // uni-app H5 不支持 querySelectorAll 拿到组件内的元素，改用延迟data
    });
    setTimeout(() => { this.cardsLoaded = true; }, 100);
  },
  methods: {
    goLogin(role) {
      const routes = {
        admin: '/pages/login/login',
        teacher: '/pages/login/teacher-login',
        parent: '/pages/login/parent-login'
      };
      uni.navigateTo({ url: routes[role] });
    }
  }
};
</script>

<style scoped>
.role-page {
  min-height: 100vh;
  background: linear-gradient(160deg, #F8FAFC 0%, #EFF6FF 40%, #F5F3FF 70%, #F8FAFC 100%);
  padding: 0 40rpx 60rpx;
  position: relative;
  overflow: hidden;
}

/* 顶部装饰波浪 */
.top-wave {
  position: absolute;
  top: -120rpx;
  left: -10%;
  width: 120%;
  height: 360rpx;
  background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #A78BFA 100%);
  border-radius: 0 0 50% 50%;
  opacity: 0.08;
}

/* 头部 */
.role-header {
  text-align: center;
  padding-top: 80rpx;
  margin-bottom: 48rpx;
  position: relative;
  z-index: 1;
}

.role-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 28rpx;
  box-shadow: 0 12rpx 32rpx rgba(79, 70, 229, 0.18);
  margin-bottom: 24rpx;
}

.role-title {
  display: block;
  font-size: 44rpx;
  font-weight: 800;
  color: #1F2937;
  letter-spacing: 2rpx;
}

.role-subtitle {
  display: block;
  font-size: 28rpx;
  color: #9CA3AF;
  margin-top: 12rpx;
  letter-spacing: 1rpx;
}

/* 卡片容器 */
.role-cards {
  position: relative;
  z-index: 1;
}

/* 单个卡片 */
.role-card {
  position: relative;
  border-radius: 28rpx;
  padding: 36rpx;
  margin-bottom: 28rpx;
  background: #FFFFFF;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 2rpx solid transparent;
}

.role-card::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 6rpx;
  border-radius: 0 0 28rpx 28rpx;
  transition: height 0.3s ease;
}

.admin-card::after { background: linear-gradient(90deg, #4F46E5, #7C3AED); }
.teacher-card::after { background: linear-gradient(90deg, #059669, #10B981); }
.parent-card::after { background: linear-gradient(90deg, #F59E0B, #F97316); }

.card-hover {
  transform: translateY(-6rpx) scale(0.985);
  box-shadow: 0 16rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* 光晕 */
.card-glow {
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  opacity: 0.06;
}
.admin-card .card-glow { background: #7C3AED; }
.teacher-card .card-glow { background: #10B981; }
.parent-card .card-glow { background: #F97316; }

/* 图标 */
.card-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}
.admin-bg { background: linear-gradient(135deg, #EEF2FF, #E0E7FF); }
.teacher-bg { background: linear-gradient(135deg, #ECFDF5, #D1FAE5); }
.parent-bg { background: linear-gradient(135deg, #FFF7ED, #FFEDD5); }

.card-icon {
  font-size: 44rpx;
}

/* 名称描述 */
.card-info {
  margin-bottom: 16rpx;
}

.card-name {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #9CA3AF;
}

/* 功能标签 */
.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.feat-tag {
  padding: 8rpx 18rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
}
.admin-tag { background: #F5F3FF; color: #6D28D9; }
.teacher-tag { background: #ECFDF5; color: #059669; }
.parent-tag { background: #FFF7ED; color: #EA580C; }

/* 箭头 */
.card-arrow {
  position: absolute;
  right: 36rpx;
  top: 50%;
  transform: translateY(-50%);
}

.arrow-icon {
  font-size: 36rpx;
  color: #D1D5DB;
  font-weight: 300;
  transition: transform 0.3s ease, color 0.3s ease;
}
.role-card:active .arrow-icon {
  transform: translateX(8rpx);
}

/* 底部 */
.role-footer {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #D1D5DB;
  margin-top: 40rpx;
  position: relative;
  z-index: 1;
}
</style>
