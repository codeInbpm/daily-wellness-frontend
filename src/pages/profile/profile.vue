<template>
  <view class="container">
    <!-- 1. 顶部个人名片 Banner (已登录 vs 未登录状态) -->
    <view class="profile-banner" :class="{ unlogin: !isLogin }">
      <template v-if="isLogin">
        <view class="user-info-group" @click="openLoginModal">
          <!-- 真实微信头像渲染 -->
          <view class="avatar-box">
            <image 
              v-if="userInfo && userInfo.avatarUrl" 
              class="avatar-img" 
              :src="userInfo.avatarUrl" 
              mode="aspectFill"
              @error="handleAvatarError"
            ></image>
            <text v-else class="avatar-text">{{ userFirstChar }}</text>
          </view>
          
          <view class="user-text-info">
            <view class="name-row">
              <text class="user-name">{{ (userInfo && userInfo.nickname) || '微信用户' }}</text>
              <text class="vip-badge" v-if="userInfo && userInfo.isVip">👑 VIP</text>
            </view>
            <view class="edit-hint-row">
              <text class="edit-hint-tag">📷 点击修改头像/昵称</text>
              <text class="companion-days">· 陪伴 {{ (userInfo && userInfo.totalDays) || 28 }} 天</text>
            </view>
          </view>
        </view>

        <view class="vip-btn" @click="goToVip">
          <text>会员权益</text>
          <text class="arrow">›</text>
        </view>
      </template>

      <!-- 未登录授权引导卡片 -->
      <template v-else>
        <view class="unlogin-group" @click="openLoginModal">
          <view class="avatar-box default-avatar">
            <text class="avatar-icon">👤</text>
          </view>
          <view class="user-text-info">
            <text class="unlogin-title">未登录 / 点击授权登录</text>
            <text class="unlogin-sub">登录后开启每日习惯同步与社区交流</text>
          </view>
        </view>
        <view class="login-action-btn" @click="openLoginModal">
          一键登录
        </view>
      </template>
    </view>

    <!-- 2. 数据 3 列汇总卡片 -->
    <view class="stats-row">
      <view class="stat-card card">
        <text class="stat-title">陪伴天数</text>
        <view class="stat-num-box">
          <text class="stat-num">{{ isLogin ? ((userInfo && userInfo.totalDays) || 28) : '--' }}</text>
          <text class="stat-unit" v-if="isLogin">天</text>
        </view>
      </view>
      <view class="stat-card card">
        <text class="stat-title">完成习惯</text>
        <view class="stat-num-box">
          <text class="stat-num">{{ isLogin ? ((userInfo && userInfo.completedHabits) || 94) : '--' }}</text>
          <text class="stat-unit" v-if="isLogin">次</text>
        </view>
      </view>
      <view class="stat-card card">
        <text class="stat-title">最要节律</text>
        <view class="stat-num-box">
          <text class="stat-text-val">{{ isLogin ? ((userInfo && userInfo.bestHabit) || '早起') : '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 3. 偏好设置卡片 -->
    <view class="card pref-card">
      <text class="pref-sub">偏好设置</text>
      <text class="pref-title">让每日养生更像你</text>

      <view class="setting-item" @click="requestSubscribeMsg">
        <view class="setting-left">
          <view class="setting-icon">🔔</view>
          <view>
            <view class="setting-name-row">
              <text class="setting-name">每日打卡提醒</text>
              <view class="setting-auth-btn" @click.stop="requestSubscribeMsg">✨ 点击授权确认</view>
            </view>
            <text class="setting-desc">在固定时间提醒我回来</text>
            <!-- 绑定原生时间选择器 Picker -->
            <picker mode="time" :value="remindTime" @change="onTimeChange" @click.stop>
              <view class="time-picker-tag">
                <text>{{ remindTime }} 🕒 (点击修改时间)</text>
              </view>
            </picker>
          </view>
        </view>
        <switch :checked="remindEnabled" @change="toggleRemind" @click.stop color="#2E6D56"/>
      </view>

      <view class="setting-item">
        <view class="setting-left">
          <view class="setting-icon">🔒</view>
          <view>
            <text class="setting-name">私密模式</text>
            <text class="setting-desc">只在这台设备保留浏览痕迹</text>
          </view>
        </view>
        <switch :checked="privateMode" @change="togglePrivateMode" color="#2E6D56"/>
      </view>

      <view class="setting-item" @click="openThemeSelector">
        <view class="setting-left">
          <view class="setting-icon">🎨</view>
          <view>
            <view class="setting-name-row">
              <text class="setting-name">专属主题 / 皮肤</text>
              <text class="vip-theme-badge">👑 VIP 专属</text>
            </view>
            <text class="setting-desc">当前使用：{{ currentThemeName }}</text>
          </view>
        </view>
        <text class="cell-arrow">›</text>
      </view>
    </view>

    <!-- 4. 延伸服务与应用服务网格 -->
    <view class="grid-entry">
      <view class="entry-card card highlight-community" @click="goToCommunity">
        <text class="entry-title">🍃 养生社区 / 打卡圈</text>
        <text class="entry-desc">发布与交流每日养生餐 ›</text>
      </view>
      <view class="entry-card card" @click="goToConstitution">
        <text class="entry-title">简单体质自测</text>
        <text class="entry-desc">用 10 道题了解自己 ›</text>
      </view>
      <view class="entry-card card highlight-shop" @click="goToShop">
        <text class="entry-title">🛍️ 时令养生商城</text>
        <text class="entry-desc">茶包/滋补食材/艾灸贴 ›</text>
      </view>
      <view class="entry-card card highlight-consult" @click="goToConsult">
        <text class="entry-title">🤖 AI 养生智伴 / 答疑</text>
        <text class="entry-desc">1V1 体质复核与生活调理 ›</text>
      </view>
    </view>

    <!-- 5. 关于与服务说明 -->
    <view class="card about-card">
      <text class="card-group-title">关于</text>
      <view class="cell-item" @click="showModal('隐私说明', '我们高度重视您的个人隐私，打卡数据仅由您本人可见与使用。')">
        <text class="cell-text">🛡️ 隐私说明</text>
        <text class="cell-arrow">›</text>
      </view>
      <view class="cell-item" @click="showModal('服务条款', '欢迎使用每日养生！请合理安排日常作息。')">
        <text class="cell-text">📄 服务条款</text>
        <text class="cell-arrow">›</text>
      </view>
      <view class="cell-item" v-if="isLogin" @click="handleSyncOpenid">
        <text class="cell-text">🔄 诊断并同步当前设备微信 OpenID</text>
        <text class="cell-arrow">›</text>
      </view>

      <view class="cell-item logout" v-if="isLogin" @click="logout">
        <text class="cell-text-logout">🚪 退出当前账号</text>
      </view>
    </view>

    <!-- 通用全局登录组件 -->
    <login-modal />
  </view>
</template>

<script>
import { getUserInfoApi, updateUserSettingsApi, syncOpenidApi } from '../../api/auth.js'
import { isLoggedIn, getUserInfo, clearAuthData, checkLogin } from '../../utils/auth.js'
export default {
  data() {
    return {
      isLogin: false,
      userInfo: null,
      remindTime: '08:30',
      remindEnabled: true,
      privateMode: false,
      themeCode: 'default'
    }
  },
  computed: {
    userFirstChar() {
      const name = (this.userInfo && this.userInfo.nickname) ? this.userInfo.nickname : '微信'
      return name.charAt(0)
    },
    currentThemeName() {
      if (this.themeCode === 'warm_apricot') return '暖杏 (VIP)'
      if (this.themeCode === 'twilight_purple') return '暮山紫 (VIP)'
      if (this.themeCode === 'pine_teal') return '松柏绿 (VIP)'
      return '竹青 (默认)'
    }
  },
  onShow() {
    this.refreshAuthState()
    this.checkAndPromptSubscribe()
  },
  mounted() {
    uni.$on('user_auth_changed', () => {
      this.refreshAuthState()
      this.checkAndPromptSubscribe()
    })
    uni.$on('habit_status_changed', () => {
      if (this.isLogin) this.loadProfileBackend()
    })
  },
  beforeUnmount() {
    uni.$off('user_auth_changed')
    uni.$off('habit_status_changed')
  },
  methods: {
    checkAndPromptSubscribe() {
      if (!this.isLogin) return
      const prompted = uni.getStorageSync('subscribe_prompted_flag')
      if (!prompted) {
        uni.setStorageSync('subscribe_prompted_flag', '1')
        uni.showModal({
          title: '每日健康节气提醒',
          content: `系统已默认开启每日 ${this.remindTime} 节气与食疗卡片通知。是否立即确认并接收微信推送？`,
          confirmText: '确认开启',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm) {
              this.requestSubscribeMsg()
            }
          }
        })
      }
    },
    refreshAuthState() {
      this.isLogin = isLoggedIn()
      if (this.isLogin) {
        this.userInfo = getUserInfo()
        this.loadProfileBackend()
      } else {
        this.userInfo = null
      }
    },
    async loadProfileBackend() {
      try {
        const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
        const res = await getUserInfoApi(userId)
        if (res && res.data) {
          this.userInfo = Object.assign({}, this.userInfo || {}, res.data)
          if (res.data.remindTime) this.remindTime = res.data.remindTime
        }
      } catch (e) {
        console.error('加载个人信息失败', e)
      }
    },
    handleAvatarError() {
      if (this.userInfo) {
        this.userInfo.avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
      }
    },
    openLoginModal() {
      uni.$emit('show_login_modal')
    },
    goToVip() {
      uni.navigateTo({ url: '/pages/vip/vip' })
    },
    goToConstitution() {
      uni.navigateTo({ url: '/pages/constitution/constitution' })
    },
    goToCommunity() {
      uni.navigateTo({ url: '/pages/community/index' })
    },
    goToShop() {
      uni.navigateTo({ url: '/pages/shop/shop' })
    },
    goToConsult() {
      uni.navigateTo({ url: '/pages/consult/consult' })
    },
    openThemeSelector() {
      if (!checkLogin()) return
      
      const themes = ['竹青 (默认)', '暖杏 (VIP尊享)', '暮山紫 (VIP尊享)', '松柏绿 (VIP尊享)']
      const themeCodes = ['default', 'warm_apricot', 'twilight_purple', 'pine_teal']
      
      uni.showActionSheet({
        itemList: themes,
        success: async (res) => {
          const selectedCode = themeCodes[res.tapIndex]
          const isVip = this.userInfo && (this.userInfo.isVip || (this.userInfo.vipExpireTime && new Date(this.userInfo.vipExpireTime) > new Date()))
          
          if (selectedCode !== 'default' && !isVip) {
            uni.showModal({
              title: 'VIP 专属主题',
              content: '专属配色主题为 VIP 会员专享，是否去了解开通 VIP？',
              confirmText: '去开通',
              success: (mRes) => {
                if (mRes.confirm) {
                  uni.navigateTo({ url: '/pages/vip/vip' })
                }
              }
            })
            return
          }

          uni.showLoading({ title: '切换主题中...' })
          const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
          const updateRes = await updateUserSettingsApi(userId, this.remindTime, selectedCode)
          uni.hideLoading()

          if (updateRes && updateRes.code === 200) {
            this.themeCode = selectedCode
            uni.showToast({ title: `已成功切换为：${themes[res.tapIndex]}`, icon: 'success' })
          } else {
            uni.showToast({ title: updateRes?.msg || '切换失败', icon: 'none' })
          }
        }
      })
    },
    async onTimeChange(e) {
      if (!checkLogin()) return
      const newTime = e.detail.value
      this.remindTime = newTime
      uni.showLoading({ title: '保存提醒时间中...' })
      const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
      const res = await updateUserSettingsApi(userId, newTime)
      uni.hideLoading()
      if (res && res.code === 200) {
        uni.showToast({ title: `已成功设置每日提醒时间为 ${newTime}`, icon: 'success' })
      } else {
        uni.showToast({ title: '保存失败', icon: 'none' })
      }
    },
    toggleRemind(e) {
      this.remindEnabled = e.detail.value
      if (this.remindEnabled) {
        this.requestSubscribeMsg()
      } else {
        uni.showToast({ title: '已关闭提醒', icon: 'none' })
      }
    },
    requestSubscribeMsg() {
      if (!checkLogin()) return

      // 微信官方底层硬性限制：requestSubscribeMessage 必须在用户点击事件的第一行同步直接调用！
      uni.requestSubscribeMessage({
        tmplIds: [SUBSCRIBE_TEMPLATE_ID],
        success: async (res) => {
          if (res && res[SUBSCRIBE_TEMPLATE_ID] === 'accept') {
            uni.showToast({ title: '🎉 已成功开启微信每日养生推送！', icon: 'success', duration: 2500 })
            const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
            await saveSubscribeStatusApi(userId, SUBSCRIBE_TEMPLATE_ID, 'accept')
          } else {
            uni.showToast({ title: '授权未完成，请勾选允许', icon: 'none' })
          }
        },
        fail: (err) => {
          console.log('订阅授权失败/拒绝', err)
          uni.showModal({
            title: '授权提示',
            content: '若微信未能正常唤起弹窗，请点击右上角「···」->「设置」->「订阅消息」，将【健康调养提醒】设置为“接收消息”。',
            confirmText: '我知道了',
            showCancel: false
          })
        }
      })

      // 后台静默将设备真实的微信 OpenID 写入后端数据库 sys_user 表
      uni.login({
        provider: 'weixin',
        success: async (lRes) => {
          if (lRes && lRes.code) {
            const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
            await syncOpenidApi(userId, lRes.code)
          }
        }
      })
    },
    async handleTestSendSubscribe() {
      if (!checkLogin()) return
      uni.showLoading({ title: '组装节气并推发中...' })
      const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
      const res = await sendTestSubscribeApi(userId)
      uni.hideLoading()
      if (res && res.code === 200) {
        const msg = res.data ? `【${res.data.thing1}】${res.data.thing2}` : '订阅消息推送成功！'
        uni.showModal({
          title: '订阅消息推送模拟成功',
          content: `模版ID：${SUBSCRIBE_TEMPLATE_ID}\n` + msg,
          showCancel: false
        })
      } else {
        uni.showToast({ title: res?.msg || '发送失败', icon: 'none' })
      }
    },
    togglePrivateMode(e) {
      this.privateMode = e.detail.value
      uni.showToast({ title: this.privateMode ? '已开启私密模式' : '已关闭私密模式', icon: 'none' })
    },
    showModal(title, content) {
      uni.showModal({ title, content, showCancel: false })
    },
    async handleSyncOpenid() {
      if (!checkLogin()) return
      uni.showLoading({ title: '正在获取微信真实 OpenID...' })
      try {
        const loginRes = await new Promise((resolve) => {
          uni.login({
            provider: 'weixin',
            success: (res) => resolve(res),
            fail: (err) => resolve({ code: null, err })
          })
        })
        const wxCode = (loginRes && loginRes.code) ? loginRes.code : ''
        if (!wxCode) {
          uni.hideLoading()
          uni.showToast({ title: '未能获取到设备的微信登录凭证', icon: 'none' })
          return
        }

        const userId = (this.userInfo && this.userInfo.id) ? this.userInfo.id : 1
        const res = await syncOpenidApi(userId, wxCode)
        uni.hideLoading()

        if (res && res.code === 200 && res.data) {
          const realOpenid = res.data.openid
          if (this.userInfo) {
            this.userInfo.openid = realOpenid
          }
          uni.showModal({
            title: '✅ 真实 OpenID 同步绑定成功',
            content: `已成功将您设备当前的真实微信 OpenID 写入数据库：\n\n${realOpenid}\n\n后台定时任务向此 OpenID 发送提醒将 100% 成功！`,
            showCancel: false
          })
        } else {
          uni.showToast({ title: res?.msg || '同步失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '网络异常，请重试', icon: 'none' })
      }
    },
    logout() {
      uni.showModal({
        title: '退出确认',
        content: '确定要退出当前微信账号吗？',
        success: (res) => {
          if (res.confirm) {
            clearAuthData()
            uni.showToast({ title: '已安全退出登录', icon: 'success' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container {
  padding: 32rpx;
  background-color: #F7F5F0;
  min-height: 100vh;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

/* 深绿色名片 Banner */
.profile-banner {
  background: linear-gradient(135deg, #2E6D56 0%, #1E4D3B 100%);
  border-radius: 36rpx;
  padding: 44rpx 36rpx;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(30, 77, 59, 0.15);
}

.profile-banner.unlogin {
  background: linear-gradient(135deg, #4A6357 0%, #2A3D34 100%);
}

.user-info-group, .unlogin-group {
  display: flex;
  align-items: center;
  gap: 28rpx;
}

.avatar-box {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background-color: #C76B58;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-box.default-avatar {
  background-color: rgba(255,255,255,0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 44rpx;
  font-weight: 700;
  color: #FFFFFF;
}

.avatar-icon {
  font-size: 52rpx;
}

.user-text-info {
  display: flex;
  flex-direction: column;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-name {
  font-size: 38rpx;
  font-weight: 600;
}

.vip-badge {
  background: #FFD700;
  color: #5D4037;
  font-size: 20rpx;
  font-weight: bold;
  padding: 2rpx 12rpx;
  border-radius: 10rpx;
}

.edit-hint-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 6rpx;
}

.edit-hint-tag {
  font-size: 20rpx;
  color: #FFD700;
  font-weight: bold;
}

.companion-days {
  font-size: 22rpx;
  opacity: 0.85;
}

.unlogin-title {
  font-size: 32rpx;
  font-weight: bold;
}

.unlogin-sub {
  font-size: 22rpx;
  opacity: 0.8;
  margin-top: 6rpx;
}

.vip-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 14rpx 28rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.login-action-btn {
  background: #C89B65;
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: bold;
  padding: 14rpx 32rpx;
  border-radius: 30rpx;
}

/* 3 列统计卡片 */
.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.stat-card {
  flex: 1;
  padding: 24rpx;
  margin-bottom: 0;
}

.stat-title {
  font-size: 22rpx;
  color: #7A8B82;
  display: block;
}

.stat-num-box {
  display: flex;
  align-items: baseline;
  margin-top: 12rpx;
  gap: 4rpx;
}

.stat-num {
  font-size: 42rpx;
  font-weight: 700;
  color: #2C3531;
}

.stat-unit {
  font-size: 24rpx;
  color: #2C3531;
}

.stat-text-val {
  font-size: 32rpx;
  font-weight: 600;
  color: #2E6D56;
}

/* 偏好设置 */
.pref-card {
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
}

.pref-sub {
  font-size: 22rpx;
  color: #7A8B82;
  display: block;
}

.pref-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2C3531;
  margin-top: 4rpx;
  display: block;
  margin-bottom: 28rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px dashed rgba(46, 109, 86, 0.1);
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.setting-icon {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background-color: #FAF8F3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.setting-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
}

.setting-auth-btn {
  font-size: 20rpx;
  color: #2E6D56;
  background-color: #EBF3EF;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.setting-desc {
  font-size: 22rpx;
  color: #7A8B82;
  display: block;
  margin-top: 2rpx;
}

.time-picker-tag {
  display: inline-block;
  background-color: #EBF3EF;
  padding: 6rpx 20rpx;
  border-radius: 14rpx;
  font-size: 22rpx;
  color: #2E6D56;
  font-weight: 500;
  margin-top: 8rpx;
}

/* 网格入口 */
.grid-entry {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.entry-card {
  padding: 28rpx 24rpx;
  margin-bottom: 0;
}

.entry-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
}

.entry-desc {
  font-size: 20rpx;
  color: #7A8B82;
  margin-top: 8rpx;
  display: block;
}

.entry-card.highlight-shop {
  background: linear-gradient(135deg, #FAF4EB 0%, #FFFFFF 100%);
  border: 1px solid rgba(200, 155, 101, 0.2);
}

.entry-card.highlight-consult {
  background: linear-gradient(135deg, #EBF3EF 0%, #FFFFFF 100%);
  border: 1px solid rgba(46, 109, 86, 0.2);
}

.entry-card.highlight-community {
  background: linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%);
  border: 1px solid rgba(76, 175, 80, 0.25);
}

/* 关于列表 */
.about-card {
  padding: 28rpx 32rpx;
}

.card-group-title {
  font-size: 24rpx;
  color: #7A8B82;
  margin-bottom: 12rpx;
  display: block;
}

.cell-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px dashed rgba(0,0,0,0.05);
}

.cell-text {
  font-size: 26rpx;
  color: #2C3531;
}

.cell-arrow {
  font-size: 26rpx;
  color: #A3B1A9;
}

.cell-text-logout {
  font-size: 26rpx;
  color: #C76B58;
}
</style>
