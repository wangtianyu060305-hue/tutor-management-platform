// 认证状态管理（UniApp 版本）

const STORAGE_KEYS = {
  TOKEN: 'tutor_token',
  USER: 'tutor_user',
  INSTITUTION: 'tutor_institution',
  BASE_URL: 'tutor_base_url'
};

function getBaseUrl() {
  return uni.getStorageSync(STORAGE_KEYS.BASE_URL) || 'http://localhost:3000';
}

function setBaseUrl(url) {
  uni.setStorageSync(STORAGE_KEYS.BASE_URL, url);
}

function getToken() {
  return uni.getStorageSync(STORAGE_KEYS.TOKEN) || '';
}

function setToken(token) {
  uni.setStorageSync(STORAGE_KEYS.TOKEN, token);
}

function getUserInfo() {
  return uni.getStorageSync(STORAGE_KEYS.USER) || null;
}

function setUserInfo(user) {
  uni.setStorageSync(STORAGE_KEYS.USER, user);
}

function getInstitution() {
  return uni.getStorageSync(STORAGE_KEYS.INSTITUTION) || null;
}

function setInstitution(inst) {
  uni.setStorageSync(STORAGE_KEYS.INSTITUTION, inst);
}

function isSuperAdmin() {
  const user = getUserInfo();
  return user && user.role === 'super_admin';
}

function isAdmin() {
  const user = getUserInfo();
  return user && (user.role === 'admin' || user.role === 'super_admin');
}

function isTeacher() {
  const user = getUserInfo();
  return user && user.role === 'teacher';
}

function isParent() {
  const user = getUserInfo();
  return user && user.role === 'parent';
}

function login(loginData) {
  setToken(loginData.token);
  setUserInfo(loginData.user);
  if (loginData.institution) {
    setInstitution(loginData.institution);
  }
}

function logout() {
  uni.removeStorageSync(STORAGE_KEYS.TOKEN);
  uni.removeStorageSync(STORAGE_KEYS.USER);
  uni.removeStorageSync(STORAGE_KEYS.INSTITUTION);
  uni.reLaunch({ url: '/pages/login/role' });
}

function goToHome() {
  const user = getUserInfo();
  if (!user) {
    uni.reLaunch({ url: '/pages/login/role' });
    return;
  }
  switch (user.role) {
    case 'super_admin':
    case 'admin':
      uni.reLaunch({ url: '/pages/admin/dashboard/dashboard' });
      break;
    case 'teacher':
      uni.reLaunch({ url: '/pages/teacher/dashboard/dashboard' });
      break;
    case 'parent':
      uni.reLaunch({ url: '/pages/parent/dashboard/dashboard' });
      break;
    default:
      uni.reLaunch({ url: '/pages/login/role' });
  }
}

export {
  getBaseUrl, setBaseUrl,
  getToken, setToken,
  getUserInfo, setUserInfo,
  getInstitution, setInstitution,
  isSuperAdmin, isAdmin, isTeacher, isParent,
  login, logout, goToHome
};
