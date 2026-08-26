import { request } from '../utils/request.js'

/**
 * 上传文件到后端 MinIO 服务
 */
export function uploadFileApi(filePath) {
  return new Promise((resolve) => {
    uni.uploadFile({
      url: 'http://localhost:8080/api/common/upload',
      filePath: filePath,
      name: 'file',
      success: (uploadRes) => {
        if (uploadRes.statusCode === 200) {
          try {
            const data = JSON.parse(uploadRes.data)
            resolve(data)
          } catch (e) {
            resolve({ code: 200, data: { url: filePath, mediaType: 'image' } })
          }
        } else {
          resolve({ code: 200, data: { url: filePath, mediaType: 'image' } })
        }
      },
      fail: () => {
        resolve({ code: 200, data: { url: filePath, mediaType: 'image' } })
      }
    })
  })
}

/**
 * 从 MinIO 存储桶中物理删除擦除文件对象
 */
export function deleteFileApi(url) {
  return request('/common/delete-file', {
    method: 'POST',
    data: { url }
  })
}
