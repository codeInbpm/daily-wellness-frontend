import { request } from '../utils/request.js'

/**
 * 获取 AI 养生智伴 1V1 热门体质复核与调理主题
 */
export function getConsultTopicsApi() {
  return request('/consult/topics', {
    method: 'GET'
  })
}

/**
 * 发起 AI 养生智伴 1V1 体质复核咨询
 */
export function askAiConsultApi(message) {
  return request('/consult/ask', {
    method: 'POST',
    data: { message }
  })
}
