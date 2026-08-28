import { request } from '../utils/request.js'

/**
 * 随机获取一条权威《黄帝内经》/中医名家/民间谚语金句 (实时调用后端接口)
 */
export function getRandomQuoteApi() {
  return request('/content/random-quote', {
    method: 'GET'
  })
}

/**
 * 获取今日养生灵感金句卡片
 */
export function getTodayQuoteApi() {
  return request('/content/today-quote', {
    method: 'GET'
  })
}

/**
 * 获取当前子午流注十二时辰作息提示
 */
export function getCurrentOrganClockApi() {
  return request('/content/organ-clock/current', {
    method: 'GET'
  })
}

/**
 * 获取当前节气
 */
export function getCurrentSolarTermApi() {
  return request('/content/solar-term/current', {
    method: 'GET'
  })
}

/**
 * 获取 24 节气列表
 */
export function getSolarTermListApi() {
  return request('/content/solar-term/list', {
    method: 'GET'
  })
}
