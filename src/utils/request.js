// 每日养生统一 API 网络请求层 (生产可调通规范版)

const DEFAULT_BASE_URL = 'http://localhost:8080/api'

export function getBaseUrl() {
  return uni.getStorageSync('custom_api_base') || DEFAULT_BASE_URL
}

export function request(url, options = {}) {
  return new Promise((resolve) => {
    const fullUrl = getBaseUrl() + url
    const token = uni.getStorageSync('daily_wellness_token') || uni.getStorageSync('token') || ''
    
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 401) {
          uni.$emit('show_login_modal')
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          resolve({ code: 401, msg: '未登录或登录已过期' })
          return
        }
        if (res.statusCode === 200 && res.data) {
          resolve(res.data)
        } else {
          const errMsg = (res.data && (res.data.msg || res.data.message)) || `服务器响应异常 (${res.statusCode})`
          uni.showToast({ title: errMsg, icon: 'none' })
          resolve({ code: res.statusCode || 500, msg: errMsg, data: null })
        }
      },
      fail: (err) => {
        logError(fullUrl, err)
        uni.showToast({ title: '无法连接后端服务器，请检查网络或后端启动状态', icon: 'none', duration: 3000 })
        resolve({ code: 500, msg: '网络连接失败', data: null })
      }
    })
  })
}

export function uploadFileApi(filePath) {
  return new Promise((resolve) => {
    const token = uni.getStorageSync('daily_wellness_token') || uni.getStorageSync('token') || ''
    uni.uploadFile({
      url: getBaseUrl() + '/common/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (data && data.code === 200) {
            resolve(data)
          } else {
            const msg = (data && data.msg) || '上传失败'
            uni.showToast({ title: msg, icon: 'none' })
            resolve({ code: 500, msg: msg })
          }
        } catch (e) {
          resolve({ code: 500, msg: '解析上传响应失败' })
        }
      },
      fail: () => {
        uni.showToast({ title: '文件上传失败，请检查网络', icon: 'none' })
        resolve({ code: 500, msg: '网络异常，上传失败' })
      }
    })
  })
}

function logError(url, err) {
  console.error('[API Error]', url, err)
}
