<template>
  <view class="bottom-nav">
    <view
      v-for="item in items"
      :key="item.key"
      :class="'nav-item ' + (item.key === active ? 'active' : '')"
      @click="navigate(item)"
    >
      <text>{{ item.icon }}</text>
      <text>{{ item.label }}</text>
    </view>
    <view class="nav-item logout-item" @click="handleLogout">
      <text>🚪</text>
      <text>退出</text>
    </view>
  </view>
</template>

<script>
const NAV_CONFIG = {
  // 管理员底部导航
  admin: [
    { key: 'dashboard', icon: '📊', label: '看板', url: '/pages/admin/dashboard/dashboard' },
    { key: 'schedule',  icon: '📅', label: '排课', url: '/pages/schedule/calendar/calendar' },
    { key: 'teachers',  icon: '👩‍🏫', label: '老师', url: '/pages/admin/teachers/teachers' },
    { key: 'students',  icon: '👨‍🎓', label: '学生', url: '/pages/admin/students/students' }
  ],
  // 老师底部导航
  teacher: [
    { key: 'dashboard', icon: '📊', label: '看板', url: '/pages/teacher/dashboard/dashboard' },
    { key: 'schedule',  icon: '📅', label: '排课', url: '/pages/schedule/calendar/calendar' },
    { key: 'students',  icon: '👨‍🎓', label: '学生', url: '/pages/teacher/my-students/my-students' },
    { key: 'feedbacks', icon: '📝', label: '反馈', url: '/pages/feedback/list/list' }
  ]
};

export default {
  name: 'BottomNav',
  props: {
    // 'admin' | 'teacher' 或传入自定义 items 数组
    role: { type: String, default: 'admin' },
    active: { type: String, default: '' },
    customItems: { type: Array, default: null }
  },
  emits: [],
  computed: {
    items() {
      if (this.customItems && this.customItems.length > 0) return this.customItems;
      return NAV_CONFIG[this.role] || NAV_CONFIG.admin;
    }
  },
  methods: {
    navigate(item) {
      if (item.url) {
        uni.navigateTo({ url: item.url });
      }
    },
    handleLogout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        confirmText: '退出',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const { logout } = require('../../utils/auth');
            logout();
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  display: flex;
  border-top: 1rpx solid #E5E7EB;
  padding: 12rpx 0;
  padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
  z-index: 99;
}
.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 22rpx;
  color: #9CA3AF;
}
.nav-item.active {
  color: #4F46E5;
}
.nav-item text:first-child {
  font-size: 40rpx;
}
.logout-item {
  opacity: 0.6;
}
.logout-item text:first-child {
  font-size: 40rpx;
}
</style>
