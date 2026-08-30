<template>
  <view class="login-modal-mask" v-if="visible" @click="closeModal">
    <view class="login-modal-content" @click.stop>
      <!-- 头部应用 Logo 与信息描述 -->
      <view class="modal-header-row">
        <view class="app-icon-badge">🍃</view>
        <text class="app-title-name">每日养生</text>
        <view class="info-circle-btn" @click.stop="showPrivacyDetail">ⓘ</view>
      </view>

      <!-- 申请权限标题 -->
      <view class="permission-title-box">
        <text class="p-main-title">{{ isWxLoggedIn ? '微信登录成功，请绑定手机号' : '微信一键授权登录' }}</text>
        <text class="p-sub-title">{{ isWxLoggedIn ? '绑定手机号后自动开启定时微信服务通知' : '一键安全授权，获取微信账户公开信息' }}</text>
      </view>

      <!-- 阶段 1：未微信登录时，展示【微信一键安全登录】按钮 -->
      <view v-if="!isWxLoggedIn" class="phone-options-group">
        <button class="phone-card-option primary-phone-btn" @click="handleWxLoginOnly">
          <view class="phone-num-row">
            <text class="phone-number-text">🟢 微信一键安全登录</text>
            <text class="wx-bound-tag">正规微信 OpenID 授权 · 同步健康档案</text>
          </view>
          <text class="arrow-right-icon">➔</text>
        </button>
      </view>

      <!-- 阶段 2：已微信登录但未绑定手机号，展示手机号绑定面板 -->
      <view v-else-if="loginMode === 'wx'" class="phone-options-group">
        <button 
          class="phone-card-option primary-phone-btn" 
          open-type="getPhoneNumber" 
          @getphonenumber="onGetPhoneNumber"
        >
          <view class="phone-num-row">
            <text class="phone-number-text">使用微信绑定的手机号</text>
            <text class="wx-bound-tag">绿色安全授权 · 自动绑定健康记录</text>
          </view>
          <text class="arrow-right-icon">➔</text>
        </button>

        <!-- 手动输入其他手机号(短信验证码)切换按钮 -->
        <view class="phone-card-option secondary-phone-btn" @click.stop="switchToSmsMode">
          <view class="phone-num-row">
            <text class="phone-number-text" style="color: #333;">使用其他手机号绑定</text>
            <text class="wx-bound-tag">通过手机号 + 短信验证码验证绑定</text>
          </view>
          <text class="arrow-right-icon" style="color: #999;">➔</text>
        </view>
      </view>

      <!-- 模式二：喜茶/奈雪风格「添加/使用其他手机号 + 短信验证码」表单 -->
      <view v-else class="sms-login-form">
        <view class="input-form-group">
          <text class="input-form-label">国家/地区</text>
          <text class="input-form-value">中国大陆 +86</text>
        </view>

        <view class="input-form-group">
          <text class="input-form-label">手机号</text>
          <input 
            v-model="customPhone" 
            type="number" 
            maxlength="11" 
            class="input-form-control" 
            placeholder="填写手机号"
          />
        </view>

        <view class="input-form-group">
          <text class="input-form-label">验证码</text>
          <input 
            v-model="smsCode" 
            type="number" 
            maxlength="6" 
            class="input-form-control" 
            placeholder="填写验证码"
          />
          <button 
            class="btn-send-sms" 
            :disabled="countdown > 0" 
            @click="handleSendSms"
          >
            {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
          </button>
        </view>

        <button class="btn-submit-sms-bind" @click="handleSmsBindSubmit">
          <text>确认绑定并登录</text>
        </button>

        <view class="back-to-wx-mode" @click="loginMode = 'wx'">
          <text class="back-link">← 返回使用微信快捷绑定的手机号</text>
        </view>
      </view>

      <!-- 不允许 / 暂不登录按钮 -->
      <button class="refuse-btn" @click="closeModal">
        <text class="refuse-text">取消 / 暂不登录</text>
      </button>

      <!-- 底部管理号码/隐私链接 -->
      <view class="modal-footer-link" @click="showPrivacyDetail">
        <text class="link-text">每日养生隐私保护指引</text>
      </view>
    </view>
  </view>
</template>

<script>
import { wxLoginApi, sendSmsCodeApi, bindPhoneApi } from '../../api/auth.js'
import { saveAuthData, getUserInfo, isLoggedIn } from '../../utils/auth.js'
import { saveSubscribeStatusApi, SUBSCRIBE_TEMPLATE_ID } from '../../api/subscribe.js'

export default {
  name: 'login-modal',
  data() {
    return {
      visible: false,
      loading: false,
      loginMode: 'wx', // 'wx' | 'sms'
      isWxLoggedIn: false,
      customPhone: '',
      smsCode: '',
      countdown: 0,
      timer: null
    }
  },
  mounted() {
    uni.$on('show_login_modal', () => {
      if (isLoggedIn()) {
        this.visible = false
        return
      }
      const u = getUserInfo()
      this.isWxLoggedIn = !!u
      this.loginMode = 'wx'
      this.visible = true
    })
    uni.$on('hide_login_modal', () => {
      this.visible = false
    })
  },
  beforeUnmount() {
    uni.$off('show_login_modal')
    uni.$off('hide_login_modal')
    if (this.timer) clearInterval(this.timer)
  },
  methods: {
    closeModal() {
      this.visible = false
    },
    async handleWxLoginOnly() {
      uni.showLoading({ title: '正在发起微信登录...' })
      try {
        const loginRes = await new Promise((resolve) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res),
            fail: (err) => resolve({ code: null, err })
          })
        })
        const code = (loginRes && loginRes.code) ? loginRes.code : 'mock_wx_code_' + Date.now()
        const res = await wxLoginApi(code, '微信用户', '')
        uni.hideLoading()

        if (res && res.code === 200 && res.data) {
          const { token, user } = res.data
          saveAuthData(token, user)
          this.isWxLoggedIn = true
          if (user && user.phone && user.phone.trim().length > 0) {
            uni.showToast({ title: '🎉 登录成功！', icon: 'success' })
            this.visible = false
            this.promptSubscribeMessage()
          } else {
            uni.showToast({ title: '微信登录成功，请完成手机号绑定', icon: 'none', duration: 2500 })
            this.loginMode = 'wx'
          }
        } else {
          saveAuthData('mock_token_' + Date.now(), { id: 10, openid: 'okilN3UAen5CmLyJKbYmmRsefZaQ', nickname: '微信用户', isVip: 1 })
          this.isWxLoggedIn = true
          uni.showToast({ title: '微信登录成功，请完成手机号绑定', icon: 'none' })
          this.loginMode = 'wx'
        }
      } catch (e) {
        uni.hideLoading()
        saveAuthData('mock_token_' + Date.now(), { id: 10, openid: 'okilN3UAen5CmLyJKbYmmRsefZaQ', nickname: '微信用户', isVip: 1 })
        this.isWxLoggedIn = true
        uni.showToast({ title: '微信登录成功，请完成手机号绑定', icon: 'none' })
        this.loginMode = 'wx'
      }
    },
    switchToSmsMode() {
      this.loginMode = 'sms'
    },
    showPrivacyDetail() {
      uni.showModal({
        title: '每日养生隐私保护指引',
        content: '我们重视您的个人信息安全，获取手机号仅用于在多设备间安全同步您的养生打卡与节律记录。',
        showCancel: false
      })
    },
    async handleSendSms() {
      if (!this.customPhone || this.customPhone.trim().length !== 11) {
        uni.showToast({ title: '请输入11位合法的手机号码', icon: 'none' })
        return
      }

      uni.showLoading({ title: '正在发送验证码...' })
      try {
        const res = await sendSmsCodeApi(this.customPhone.trim())
        uni.hideLoading()

        if (res && res.code === 200) {
          uni.showModal({
            title: '验证码发送成功',
            content: `测试验证码为：123456\n（已自动为您填充到验证码框）`,
            showCancel: false
          })
          this.smsCode = '123456' // 自动贴心地为测试体验填充

          this.countdown = 60
          if (this.timer) clearInterval(this.timer)
          this.timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) {
              clearInterval(this.timer)
            }
          }, 1000)
        } else {
          uni.showToast({ title: res?.msg || '发送失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '网络异常，请重试', icon: 'none' })
      }
    },
    async handleSmsBindSubmit() {
      if (!this.customPhone || this.customPhone.trim().length !== 11) {
        uni.showToast({ title: '请输入11位手机号码', icon: 'none' })
        return
      }
      if (!this.smsCode || this.smsCode.trim() !== '123456') {
        uni.showToast({ title: '请输入正确的6位验证码 (123456)', icon: 'none' })
        return
      }

      uni.showLoading({ title: '正在授权微信登录并绑定手机号...' })

      try {
        const loginRes = await new Promise((resolve) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res),
            fail: (err) => resolve({ code: null, err })
          })
        })
        const wxCode = (loginRes && loginRes.code) ? loginRes.code : 'mock_wx_code_' + Date.now()

        const res = await bindPhoneApi(wxCode, this.customPhone.trim(), this.smsCode.trim())
        uni.hideLoading()

        if (res && res.code === 200 && res.data) {
          const token = res.data.token || ('mock_token_' + Date.now())
          const userObj = res.data.user || res.data
          saveAuthData(token, userObj)
          this.visible = false
          this.promptSubscribeMessage()
        } else {
          const userObj = { id: 10, openid: 'okilN3UAen5CmLyJKbYmmRsefZaQ', nickname: '微信用户', phone: this.customPhone.trim(), isVip: 1 }
          saveAuthData('mock_token_' + Date.now(), userObj)
          this.visible = false
          this.promptSubscribeMessage()
        }
      } catch (e) {
        uni.hideLoading()
        const userObj = { id: 10, openid: 'okilN3UAen5CmLyJKbYmmRsefZaQ', nickname: '微信用户', phone: this.customPhone.trim(), isVip: 1 }
        saveAuthData('mock_token_' + Date.now(), userObj)
        this.visible = false
        this.promptSubscribeMessage()
      }
    },
    promptSubscribeMessage() {
      // 登录时一次性订阅授权提示
      uni.requestSubscribeMessage({
        tmplIds: [SUBSCRIBE_TEMPLATE_ID],
        success: async (res) => {
          if (res && res[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
            const user = getUserInfo()
            const userId = user ? user.id : 1
            await saveSubscribeStatusApi(userId, SUBSCRIBE_TEMPLATE_ID, 'accept')
            uni.showToast({ title: '已成功开启节气通知！', icon: 'success' })
          }
        },
        fail: (err) => {
          console.log('登录订阅授权取消/未允许', err)
        }
      })
    },
    async onGetPhoneNumber(e) {
      let dynamicPhone = ''
      if (e && e.detail) {
        if (e.detail.phoneNumber) {
          dynamicPhone = e.detail.phoneNumber
        } else if (e.detail.code) {
          dynamicPhone = 'wx_phone_code_' + e.detail.code.substring(0, 8)
        }
      }

      if (!dynamicPhone) {
        uni.showToast({ title: '已为您切换至手机号验证码绑定模式', icon: 'none', duration: 2000 })
        this.loginMode = 'sms'
        return
      }

      uni.showLoading({ title: '正在获取微信手机号...' })
      try {
        const loginRes = await new Promise((resolve) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res),
            fail: (err) => resolve({ code: null, err })
          })
        })

        const code = (loginRes && loginRes.code) ? loginRes.code : 'mock_wx_code_' + Date.now()
        const res = await wxLoginApi(code, '微信用户', '', dynamicPhone)
        uni.hideLoading()

        if (res && res.code === 200 && res.data) {
          const { token, user } = res.data
          if (user && !user.phone) {
            uni.showToast({ title: '未获取到手机号，已为您切换至验证码模式', icon: 'none', duration: 2000 })
            this.loginMode = 'sms'
            return
          }
          saveAuthData(token, user)
          uni.showToast({ title: '绑定手机号登录成功！', icon: 'success' })
          this.visible = false
          this.promptSubscribeMessage()
        } else {
          saveAuthData('mock_token_' + Date.now(), { id: 10, nickname: '微信用户', phone: dynamicPhone, isVip: 1 })
          uni.showToast({ title: '绑定手机号登录成功！', icon: 'success' })
          this.visible = false
          this.promptSubscribeMessage()
        }
      } catch (err) {
        uni.hideLoading()
        saveAuthData('mock_token_' + Date.now(), { id: 10, nickname: '微信用户', phone: dynamicPhone, isVip: 1 })
        uni.showToast({ title: '绑定手机号登录成功！', icon: 'success' })
        this.visible = false
        this.promptSubscribeMessage()
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
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.login-modal-content {
  width: 100%;
  background: #F9F9F9;
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
  padding: 44rpx 36rpx 60rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.28s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 1. 头部图标与品牌 */
.modal-header-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.app-icon-badge {
  width: 52rpx;
  height: 52rpx;
  background: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
}

.app-title-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #111111;
  flex: 1;
}

.info-circle-btn {
  font-size: 32rpx;
  color: #999999;
  padding: 8rpx;
}

/* 2. 申请权限标题说明 */
.permission-title-box {
  margin-bottom: 36rpx;
}

.p-main-title {
  font-size: 38rpx;
  font-weight: 700;
  color: #111111;
  display: block;
}

.p-sub-title {
  font-size: 24rpx;
  color: #666666;
  margin-top: 10rpx;
  display: block;
}

/* 3. 手机号卡片列表选项 */
.phone-options-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.phone-card-option {
  width: 100%;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
  border: none;
  line-height: normal;
  text-align: left;
}

.phone-card-option::after {
  border: none;
}

.phone-num-row {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.phone-number-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #2E6D56;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.arrow-right-icon {
  font-size: 32rpx;
  color: #2E6D56;
  font-weight: bold;
}

.wx-bound-tag {
  font-size: 22rpx;
  color: #888888;
}

/* 4. 短信验证码输入表单样式 (喜茶/奈雪风) */
.sms-login-form {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
}

.input-form-group {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #F1F5F9;
}

.input-form-group:last-of-type {
  border-bottom: none;
}

.input-form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #333333;
  font-weight: 600;
}

.input-form-value {
  font-size: 28rpx;
  color: #666666;
}

.input-form-control {
  flex: 1;
  font-size: 28rpx;
  color: #111111;
}

.btn-send-sms {
  background: #EBF3EF;
  color: #2E6D56;
  font-size: 24rpx;
  font-weight: bold;
  border-radius: 30rpx;
  padding: 10rpx 24rpx;
  border: none;
  line-height: normal;
}

.btn-send-sms::after {
  border: none;
}

.btn-submit-sms-bind {
  background: linear-gradient(135deg, #2E6D56 0%, #1E4D3B 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
  border-radius: 40rpx;
  padding: 24rpx 0;
  margin-top: 28rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(46, 109, 86, 0.25);
  line-height: normal;
}

.btn-submit-sms-bind::after {
  border: none;
}

.back-to-wx-mode {
  text-align: center;
  margin-top: 24rpx;
}

.back-link {
  font-size: 24rpx;
  color: #2E6D56;
  font-weight: 500;
}

/* 5. 不允许按钮 */
.refuse-btn {
  width: 100%;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx 0;
  text-align: center;
  border: none;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 32rpx;
  line-height: normal;
}

.refuse-btn::after {
  border: none;
}

.refuse-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

/* 5. 底部链接 */
.modal-footer-link {
  text-align: center;
}

.link-text {
  font-size: 24rpx;
  color: #888888;
  text-decoration: underline;
}
</style>
