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
 * 发起 AI 养生智伴 1V1 体质复核咨询 (自动持久化到 ai_consult_log)
 */
export function askAiConsultApi(message, userId = 1) {
  return request('/consult/ask', {
    method: 'POST',
    data: { message, userId }
  })
}

/**
 * 分页获取 AI 养生咨询历史会话列表
 */
export function getConsultHistoryApi(userId = 1, page = 1, size = 10) {
  return request(`/consult/history?userId=${userId}&page=${page}&size=${size}`, {
    method: 'GET'
  })
}

/**
 * 删除单条 AI 咨询历史记录
 */
export function deleteConsultHistoryApi(id, userId = 1) {
  return request(`/consult/history/${id}?userId=${userId}`, {
    method: 'DELETE'
  })
}
