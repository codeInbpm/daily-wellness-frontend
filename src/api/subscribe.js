import { request } from '../utils/request.js'

export const SUBSCRIBE_TEMPLATE_ID = 'K91dYUNJ6O195FwH596ocLpWpSAS29YM7TUvlCmQ0H8'

/**
 * 上报微信订阅授权状态
 */
export function saveSubscribeStatusApi(userId = 1, templateId = SUBSCRIBE_TEMPLATE_ID, status = 'accept') {
  return request('/v1/subscribe/save', {
    method: 'POST',
    data: { userId, templateId, status }
  })
}

/**
 * 模拟手动触发测试发送订阅消息
 */
export function sendTestSubscribeApi(userId = 1) {
  return request('/v1/subscribe/send-test', {
    method: 'POST',
    data: { userId, templateId: SUBSCRIBE_TEMPLATE_ID }
  })
}
