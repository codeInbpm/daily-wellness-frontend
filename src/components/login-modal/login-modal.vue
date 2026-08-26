<template>
  <view class="login-modal-mask" v-if="visible" @click.self="closeModal">
    <view class="login-modal-content">
      <!-- 关闭图标按钮 -->
      <view class="close-btn" @click="closeModal">✕</view>

      <!-- 头部 Logo 与标题 -->
      <view class="modal-header">
        <view class="app-logo">🍃</view>
        <text class="modal-title">{{ isAlreadyLoggedIn ? '修改个人资料' : '欢迎使用 每日养生' }}</text>
        <text class="modal-sub">{{ isAlreadyLoggedIn ? '设置您满意的微信头像与昵称' : '授权登录开启您的专属养生打卡与健康记录' }}</text>
      </view>

      <!-- 微信原生头像与昵称设置 -->
      <view class="profile-setup-box">
        <!-- 微信快捷选择头像 -->
        <button 
          class="avatar-wrapper" 
          open-type="chooseAvatar" 
          @chooseavatar="onChooseAvatar"
        >
          <image 
            class="avatar-img" 
            :src="avatarUrl" 
            mode="aspectFill"
            @error="handleAvatarError"
          ></image>
          <view class="avatar-edit-tag">📷 点击获取/上传微信头像</view>
        </button>

        <!-- 微信快捷填报昵称 -->
        <view class="nickname-input-group">
          <text class="input-label">微信昵称：</text>
          <input 
            type="nickname" 
            class="nickname-input" 
            v-model="nickname" 
            placeholder="点击自动带出或手写昵称"
            @blur="onNicknameBlur"
            @input="onNicknameInput"
          />
        </view>
      </view>

      <!-- 授权登录/保存主按钮 -->
      <button class="submit-login-btn" :loading="loading" @click="handleWxLogin">
        {{ isAlreadyLoggedIn ? '💾 保存个人资料' : '🍃 微信一键授权登录' }}
      </button>

      <!-- 隐私政策提示 -->
      <view class="privacy-tips">
        <text class="tip-text">登录即代表您同意《每日养生服务条款》与《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script>
import { wxLoginApi, updateProfileApi } from '../../api/auth.js'
import { saveAuthData, getUserInfo, isLoggedIn } from '../../utils/auth.js'
import { uploadFileApi } from '../../utils/request.js'

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'

export default {
  name: 'login-modal',
  data() {
    return {
      visible: false,
      loading: false,
      isAlreadyLoggedIn: false,
      nickname: '微信用户',
      avatarUrl: DEFAULT_AVATAR
    }
  },
  mounted() {
    uni.$on('show_login_modal', () => {
      this.initUserData()
      this.visible = true
    })
    uni.$on('hide_login_modal', () => {
      this.visible = false
    })
  },
  beforeUnmount() {
    uni.$off('show_login_modal')
    uni.$off('hide_login_modal')
  },
  methods: {
    initUserData() {
      this.isAlreadyLoggedIn = isLoggedIn()
      const user = getUserInfo()
      if (user) {
        if (user.nickname) this.nickname = user.nickname
        if (user.avatarUrl) this.avatarUrl = user.avatarUrl
      }
    },
    closeModal() {
      this.visible = false
    },
    async onChooseAvatar(e) {
      if (e.detail && e.detail.avatarUrl) {
        const tempPath = e.detail.avatarUrl
        this.avatarUrl = tempPath
        uni.showToast({ title: '已选择微信头像', icon: 'none' })

        // 尝试传到后端服务器保存永久图片
        try {
          const upRes = await uploadFileApi(tempPath)
          if (upRes && upRes.data && upRes.data.url) {
            this.avatarUrl = upRes.data.url
          }
        } catch (err) {
          console.log('头像上传服务器回退为临时路径', err)
        }
      }
    },
    onNicknameBlur(e) {
      if (e.detail && e.detail.value) {
        this.nickname = e.detail.value.trim()
      }
    },
    onNicknameInput(e) {
      if (e.detail && e.detail.value) {
        this.nickname = e.detail.value.trim()
      }
    },
    handleAvatarError() {
      this.avatarUrl = DEFAULT_AVATAR
    },
    async handleWxLogin() {
      if (!this.nickname || !this.nickname.trim()) {
        uni.showToast({ title: '请输入或选择微信昵称', icon: 'none' })
        return
      }

      this.loading = true
      try {
        const currentUser = getUserInfo()

        // 已登录模式下直接保存资料
        if (this.isAlreadyLoggedIn && currentUser && currentUser.id) {
          const upRes = await updateProfileApi(currentUser.id, this.nickname, this.avatarUrl)
          this.loading = false
          if (upRes && upRes.code === 200) {
            const newUser = Object.assign({}, currentUser, {
              nickname: this.nickname,
              avatarUrl: this.avatarUrl
            })
            saveAuthData(null, newUser)
            uni.showToast({ title: '个人资料已更新', icon: 'success' })
            this.visible = false
            return
          }
        }

        // 未登录模式下微信一键登录
        const loginRes = await new Promise((resolve) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res),
            fail: (err) => resolve({ code: null, err })
          })
        })

        const code = (loginRes && loginRes.code) ? loginRes.code : 'mock_wx_code_' + Date.now()
        const res = await wxLoginApi(code, this.nickname, this.avatarUrl)
        this.loading = false

        if (res && res.code === 200 && res.data) {
          const { token, user } = res.data
          if (user && user.id) {
            user.nickname = this.nickname
            user.avatarUrl = this.avatarUrl
            await updateProfileApi(user.id, this.nickname, this.avatarUrl)
          }

          saveAuthData(token, user)
          uni.showToast({ title: '登录成功！', icon: 'success' })
          this.visible = false
        } else {
          uni.showToast({ title: (res && res.msg) || '登录失败，请重试', icon: 'none' })
        }
      } catch (e) {
        this.loading = false
        console.error('微信登录/修改异常', e)
        uni.showToast({ title: '操作失败，请重试', icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.login-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.login-modal-content {
  width: 100%;
  background: #FFFFFF;
  border-radius: 36rpx;
  padding: 48rpx 40rpx;
  position: relative;
  box-shadow: 0 16rpx 48rpx rgba(30, 77, 59, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 28rpx;
  right: 32rpx;
  font-size: 32rpx;
  color: #999;
  padding: 10rpx;
}

.modal-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 36rpx;
}

.app-logo {
  font-size: 64rpx;
  width: 110rpx;
  height: 110rpx;
  background: #EBF3EF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2C3531;
}

.modal-sub {
  font-size: 24rpx;
  color: #7A8B82;
  margin-top: 8rpx;
}

/* 头像与昵称框 */
.profile-setup-box {
  width: 100%;
  background: #FAF8F3;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  background: transparent;
  padding: 0;
  margin: 0;
  line-height: normal;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper::after {
  border: none;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #2E6D56;
  box-shadow: 0 4rpx 12rpx rgba(46, 109, 86, 0.15);
}

.avatar-edit-tag {
  font-size: 20rpx;
  color: #2E6D56;
  font-weight: 600;
  margin-top: 10rpx;
}

.nickname-input-group {
  width: 100%;
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid #E0E0E0;
  border-radius: 16rpx;
  padding: 16rpx 24rpx;
  margin-top: 24rpx;
}

.input-label {
  font-size: 24rpx;
  color: #555;
  font-weight: bold;
  flex-shrink: 0;
}

.nickname-input {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.submit-login-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #2E6D56 0%, #1E4D3B 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 44rpx;
  box-shadow: 0 8rpx 20rpx rgba(46, 109, 86, 0.3);
}

.privacy-tips {
  margin-top: 24rpx;
  text-align: center;
}

.tip-text {
  font-size: 20rpx;
  color: #A3B1A9;
}
</style>
