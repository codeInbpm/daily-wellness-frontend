import { request } from '../utils/request.js'

/**
 * 与 AI 养生智伴进行实时对话
 */
export function chatWithAiApi(message, sessionId = 'default_session') {
  return request('/ai/chat', {
    method: 'POST',
    data: { message, sessionId, userId: 1 }
  })
}
