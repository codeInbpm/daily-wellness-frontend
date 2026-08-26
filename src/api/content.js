import { request } from '../utils/request.js'

/**
 * 获取今日灵感短短句/贴士
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
