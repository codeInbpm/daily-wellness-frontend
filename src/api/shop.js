import { request } from '../utils/request.js'

/**
 * 获取时令养生商城商品列表
 */
export function getShopProductsApi(category = '') {
  return request(`/shop/products?category=${encodeURIComponent(category)}`, {
    method: 'GET'
  })
}
