import { request } from '../utils/request.js'

/**
 * 分页获取养生干货与辟谣列表
 */
export function getArticlesApi(type = '', categoryName = '', mediaType = '', page = 1, size = 10) {
  let url = `/v1/articles?type=${type}&categoryName=${encodeURIComponent(categoryName)}&page=${page}&size=${size}`
  if (mediaType) {
    url += `&mediaType=${mediaType}`
  }
  return request(url, {
    method: 'GET'
  })
}

/**
 * 获取文章详情
 */
export function getArticleDetailApi(id) {
  return request(`/v1/articles/${id}`, {
    method: 'GET'
  })
}

/**
 * 获取推荐干货/辟谣文章
 */
export function getRecommendArticlesApi(excludeId = '') {
  return request(`/v1/articles/recommend?excludeId=${excludeId}&limit=3`, {
    method: 'GET'
  })
}

/**
 * 点赞文章
 */
export function likeArticleApi(id) {
  return request(`/v1/articles/${id}/like`, {
    method: 'POST'
  })
}
