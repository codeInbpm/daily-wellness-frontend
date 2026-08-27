const TOKEN_KEY = 'daily_wellness_token'
const USER_KEY = 'daily_wellness_user_info'

/**
 * 获取本地 Token
 */
export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}

/**
 * 获取本地缓存的用户信息
 */
export function getUserInfo() {
  const data = uni.getStorageSync(USER_KEY)
  if (!data) return null
  try {
    return typeof data === 'string' ? JSON.parse(data) : data
  } catch (e) {
    return null
  }
}

/**
 * 是否已经登录 (微信授权成功)
 */
export function isLoggedIn() {
  const token = getToken()
  const user = getUserInfo()
  return !!(token && user)
}

/**
 * 是否已绑定手机号
 */
export function hasBoundPhone() {
  const user = getUserInfo()
  return !!(user && user.phone && user.phone.trim().length > 0)
}

/**
 * 保存登录状态及用户信息
 */
export function saveAuthData(token, user) {
  if (token) {
    uni.setStorageSync(TOKEN_KEY, token)
  }
  if (user) {
    uni.setStorageSync(USER_KEY, JSON.stringify(user))
  }
  uni.$emit('user_auth_changed', { isLoggedIn: true, user })
}

/**
 * 清除登录状态及缓存
 */
export function clearAuthData() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(USER_KEY)
  uni.$emit('user_auth_changed', { isLoggedIn: false, user: null })
}

/**
 * 校验登录状态，若未登录弹窗引导授权
 * @param {Function} callback 已登录时要执行的回调函数
 * @returns {Boolean}
 */
export function checkLogin(callback) {
  if (isLoggedIn()) {
    if (typeof callback === 'function') callback()
    return true
  }

  // 触发全局唤起登录模态框事件
  uni.$emit('show_login_modal')
  return false
}
