<script>
export default {
  onLaunch() {
    console.log('App Launch');
  },
  onShow() {
    console.log('App Show');
  },
  onHide() {
    console.log('App Hide');
  }
};
</script>

<style lang="scss">
/* 全局样式 — 从 app.wxss 迁移 */
page {
  background: #F5F5F5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 28rpx;
  color: #1F2937;
  line-height: 1.5;
  box-sizing: border-box;
}

/* ===== 通用布局 ===== */
.container { padding: 24rpx; }

.card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 16rpx;
}

.flex-row { display: flex; flex-direction: row; align-items: center; }
.flex-between { display: flex; justify-content: space-between; align-items: center; }
.flex-wrap { flex-wrap: wrap; }
.flex-1 { flex: 1; }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.text-bold { font-weight: 700; }
.text-sm { font-size: 24rpx; }
.text-lg { font-size: 34rpx; }
.text-gray { color: #6B7280; }

.mt-8 { margin-top: 8rpx; }
.mt-12 { margin-top: 12rpx; }
.mt-16 { margin-top: 16rpx; }
.mt-24 { margin-top: 24rpx; }
.mt-32 { margin-top: 32rpx; }
.mb-8 { margin-bottom: 8rpx; }
.mb-12 { margin-bottom: 12rpx; }
.mb-16 { margin-bottom: 16rpx; }
.mb-24 { margin-bottom: 24rpx; }
.ml-8 { margin-left: 8rpx; }
.ml-12 { margin-left: 12rpx; }
.ml-16 { margin-left: 16rpx; }
.mr-8 { margin-right: 8rpx; }
.mr-12 { margin-right: 12rpx; }
.mr-16 { margin-right: 16rpx; }

/* ===== 按钮 ===== */
.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 32rpx;
  background: linear-gradient(135deg, #4F46E5, #7C3AED);
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 12rpx;
  text-align: center;
}
.btn-primary:active { opacity: 0.85; }
.btn-primary[disabled] { opacity: 0.5; }

.btn-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 32rpx;
  border: 2rpx solid #4F46E5;
  color: #4F46E5;
  font-size: 28rpx;
  font-weight: 600;
  border-radius: 12rpx;
  text-align: center;
}
.btn-outline:active { background: #F5F3FF; }

.btn-sm { padding: 10rpx 20rpx; font-size: 24rpx; }
.btn-danger { background: #EF4444; color: #FFF; border: none; }

/* ===== 表单 ===== */
.form-group { margin-bottom: 16rpx; }
.form-label {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8rpx;
}
.form-input {
  display: block;
  width: 100%;
  padding: 20rpx;
  background: #F9FAFB;
  border: 2rpx solid #E5E7EB;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1F2937;
  box-sizing: border-box;
}
.form-textarea {
  display: block;
  width: 100%;
  padding: 20rpx;
  background: #F9FAFB;
  border: 2rpx solid #E5E7EB;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1F2937;
  min-height: 200rpx;
  box-sizing: border-box;
}
.form-picker {
  padding: 20rpx;
  background: #F9FAFB;
  border: 2rpx solid #E5E7EB;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1F2937;
  min-height: 40rpx;
  display: flex;
  align-items: center;
}

/* ===== 标签 ===== */
.tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  font-weight: 600;
  margin-right: 8rpx;
  margin-bottom: 6rpx;
}
.tag-blue { background: #EFF6FF; color: #2563EB; }
.tag-green { background: #F0FDF4; color: #16A34A; }
.tag-purple { background: #F5F3FF; color: #7C3AED; }
.tag-orange { background: #FFF7ED; color: #EA580C; }
.tag-red { background: #FEF2F2; color: #DC2626; }

/* ===== 空状态 ===== */
.empty-box {
  text-align: center;
  padding: 80rpx 0;
}
</style>
