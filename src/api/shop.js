import { request } from '../utils/request.js'

/**
 * 获取时令养生商城商品列表
 */
export function getShopProductsApi(category = '') {
  return request(`/shop/products?category=${encodeURIComponent(category)}`, {
    method: 'GET'
  })
}

/**
 * 获取购物车列表
 */
export function getCartListApi(userId = 1) {
  return request(`/shop/cart?userId=${userId}`, {
    method: 'GET'
  })
}

/**
 * 加入购物车
 */
export function addToCartApi(productId, quantity = 1, userId = 1) {
  return request('/shop/cart/add', {
    method: 'POST',
    data: { productId, quantity, userId }
  })
}

/**
 * 更新购物车商品数量
 */
export function updateCartQuantityApi(cartId, quantity, userId = 1) {
  return request('/shop/cart/update-quantity', {
    method: 'POST',
    data: { cartId, quantity, userId }
  })
}

/**
 * 删除购物车商品
 */
export function deleteCartItemApi(cartId, userId = 1) {
  return request(`/shop/cart/${cartId}?userId=${userId}`, {
    method: 'DELETE'
  })
}

/**
 * 获取收货地址列表
 */
export function getAddressesApi(userId = 1) {
  return request(`/shop/address?userId=${userId}`, {
    method: 'GET'
  })
}

/**
 * 保存/编辑收货地址
 */
export function saveAddressApi(addressData) {
  return request('/shop/address', {
    method: 'POST',
    data: addressData
  })
}

/**
 * 提交商城实物商品订单
 */
export function createMallOrderApi(addressId, remark = '', userId = 1) {
  return request('/shop/order/create', {
    method: 'POST',
    data: { addressId, remark, userId }
  })
}
