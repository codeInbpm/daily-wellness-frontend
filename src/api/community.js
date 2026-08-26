import { request } from '../utils/request.js'

/**
 * 分页获取社区广场动态（支持习惯筛选）
 */
export function getPostListApi(userId = 1, habitName = '', page = 1, size = 10) {
  return request(`/v1/posts?userId=${userId}&habitName=${encodeURIComponent(habitName)}&page=${page}&size=${size}`, {
    method: 'GET'
  })
}

/**
 * 发布社区动态
 */
export function createPostApi(data) {
  return request('/v1/posts', {
    method: 'POST',
    data
  })
}

/**
 * 删除自己的动态
 */
export function deletePostApi(postId, userId = 1) {
  return request(`/v1/posts/${postId}?userId=${userId}`, {
    method: 'DELETE'
  })
}

/**
 * 切换动态公开/私密状态
 */
export function togglePrivacyApi(postId, isPrivate, userId = 1) {
  return request(`/v1/posts/${postId}/privacy?isPrivate=${isPrivate}&userId=${userId}`, {
    method: 'PUT'
  })
}

/**
 * 点赞/取消点赞动态
 */
export function toggleLikePostApi(postId, userId = 1) {
  return request(`/v1/posts/${postId}/like?userId=${userId}`, {
    method: 'POST'
  })
}

/**
 * 获取动态评论列表
 */
export function getPostCommentsApi(postId) {
  return request(`/v1/posts/${postId}/comments`, {
    method: 'GET'
  })
}

/**
 * 发表评论
 */
export function addPostCommentApi(postId, data) {
  return request(`/v1/posts/${postId}/comments`, {
    method: 'POST',
    data
  })
}
