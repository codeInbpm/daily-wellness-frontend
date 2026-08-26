import { request } from '../utils/request.js'

/**
 * 按功效、体质或搜索词查询药膳食材列表
 */
export function getHerbalFoodListApi(category = '', constitution = '', keyword = '') {
  let url = `/food/list?category=${encodeURIComponent(category)}&constitution=${encodeURIComponent(constitution)}&keyword=${encodeURIComponent(keyword)}`
  return request(url, {
    method: 'GET'
  })
}
