import { request } from '../utils/request.js'

/**
 * 获取今日待打卡习惯
 */
export function getTodayHabitsApi(userId = 1) {
  return request(`/habit/today?userId=${userId}`, {
    method: 'GET'
  })
}

/**
 * 一键打卡 / 取消打卡 (支持传入心得与照片/视频媒体)
 */
export function checkInApi(userId, habitId, remark = '', mediaUrl = '', mediaType = 'none') {
  return request('/habit/check-in', {
    method: 'POST',
    data: { userId, habitId, remark, mediaUrl, mediaType }
  })
}

/**
 * VIP 补打卡 (支持补打前 1~2 天)
 */
export function makeUpCheckInApi(userId, habitId, date, remark = '', mediaUrl = '', mediaType = 'none') {
  return request('/habit/make-up-check-in', {
    method: 'POST',
    data: { userId, habitId, date, remark, mediaUrl, mediaType }
  })
}

/**
 * 获取日历记录集合
 */
export function getCalendarRecordsApi(userId = 1, month) {
  return request(`/habit/calendar-records?userId=${userId}&month=${month}`, {
    method: 'GET'
  })
}

/**
 * 获取某单日完成的具体打卡记录明细 (含照片/视频与心得)
 */
export function getDayCheckInDetailApi(userId = 1, date) {
  return request(`/habit/day-detail?userId=${userId}&date=${date}`, {
    method: 'GET'
  })
}

/**
 * 添加自定义习惯
 */
export function addHabitApi(userId = 1, name, category = '养') {
  return request('/habit/add', {
    method: 'POST',
    data: { userId, name, category }
  })
}

/**
 * 更新习惯名称或归档/暂停状态
 */
export function updateHabitStatusApi(userId = 1, habitId, status, customName) {
  return request('/habit/update', {
    method: 'POST',
    data: { userId, habitId, status, customName }
  })
}

/**
 * 删除/移除习惯
 */
export function deleteHabitApi(userId = 1, habitId) {
  return request('/habit/delete', {
    method: 'POST',
    data: { userId, habitId }
  })
}
