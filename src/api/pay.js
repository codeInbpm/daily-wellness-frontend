import { request } from '../utils/request.js'

/**
 * 创建开通订单
 */
export function createOrderApi(userId, planType) {
  return request('/pay/create-order', {
    method: 'POST',
    data: { userId, planType }
  })
}
