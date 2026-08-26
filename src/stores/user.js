import { defineStore } from 'pinia'
import { getUserInfoApi, wxLoginApi } from '../api/auth.js'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: {
      id: 1,
      nickname: '林遥',
      avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POGEwhegI5B1YfN62/132',
      isVip: 1,
      remindTime: '20:30'
    },
    token: uni.getStorageSync('token') || ''
  }),
  actions: {
    async fetchUserInfo(userId = 1) {
      const res = await getUserInfoApi(userId)
      if (res && res.code === 200 && res.data) {
        this.userInfo = res.data
      }
    },
    async login(code) {
      const res = await wxLoginApi(code)
      if (res && res.code === 200 && res.data) {
        this.token = res.data.token
        this.userInfo = res.data.user
        uni.setStorageSync('token', this.token)
      }
      return res
    }
  }
})
