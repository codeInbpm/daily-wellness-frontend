import { request } from '../utils/request.js'

/**
 * 获取用户信息
 */
export function getUserInfoApi(userId = 1) {
  return request(`/user/info?userId=${userId}`, {
    method: 'GET'
  })
}

/**
 * 更新用户偏好设置 (提醒时间等)
 */
export function updateUserSettingsApi(remindTime) {
  return request('/user/settings', {
    method: 'POST',
    data: { userId: 1, remindTime }
  })
}

/**
 * 更新用户健康档案 (体质分类 + 生活作息嗜好)
 */
export function updateHealthProfileApi(profileData) {
  return request('/user/health-profile', {
    method: 'POST',
    data: { userId: 1, ...profileData }
  })
}
