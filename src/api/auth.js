import { request } from '../utils/request.js'

/**
 * 微信登录
 */
export function wxLoginApi(code, nickname = '', avatarUrl = '') {
  return request('/auth/wx-login', {
    method: 'POST',
    data: { code, nickname, avatarUrl }
  })
}

/**
 * 更新微信用户资料 (头像与昵称)
 */
export function updateProfileApi(userId, nickname = '', avatarUrl = '') {
  return request('/auth/update-profile', {
    method: 'POST',
    data: { userId, nickname, avatarUrl }
  })
}

/**
 * 获取用户信息
 */
export function getUserInfoApi(userId = 1) {
  return request(`/auth/user-info?userId=${userId}`, {
    method: 'GET'
  })
}

/**
 * 更新用户偏好设置
 */
export function updateUserSettingsApi(userId = 1, remindTime) {
  return request('/auth/update-settings', {
    method: 'POST',
    data: { userId, remindTime }
  })
}
