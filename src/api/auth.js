import { request } from '../utils/request.js'

/**
 * 微信登录
 */
export function wxLoginApi(code, nickname = '', avatarUrl = '', phone = '') {
  return request('/auth/wx-login', {
    method: 'POST',
    data: { code, nickname, avatarUrl, phone }
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
 * 更新用户偏好设置 (提醒时间、主题等)
 */
export function updateUserSettingsApi(userId = 1, remindTime, themeCode) {
  return request('/auth/update-settings', {
    method: 'POST',
    data: { userId, remindTime, themeCode }
  })
}

/**
 * 发送短信验证码
 */
export function sendSmsCodeApi(phone) {
  return request('/auth/send-sms', {
    method: 'POST',
    data: { phone }
  })
}

/**
 * 校验并绑定手机号与微信 OpenID
 */
export function bindPhoneApi(wxCode, phone, smsCode) {
  return request('/auth/bind-phone', {
    method: 'POST',
    data: { wxCode, phone, smsCode }
  })
}

/**
 * 强行用设备最新的 wxCode 同步更新写入用户的真实微信 OpenID
 */
export function syncOpenidApi(userId, wxCode) {
  return request('/auth/sync-openid', {
    method: 'POST',
    data: { userId, wxCode }
  })
}
