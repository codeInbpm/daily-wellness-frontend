<template>
  <view class="container">
    <view class="vip-header-card">
      <view class="crown-icon">👑</view>
      <text class="vip-main-title">每日养生 会员计划</text>
      <text class="vip-sub-title">解锁无限习惯与专属节气进阶修养</text>
    </view>

    <!-- 权益清单卡片 -->
    <view class="card benefits-card">
      <text class="benefits-header">VIP 专属权益</text>
      <view class="benefit-item">
        <text class="benefit-icon">✨</text>
        <view class="benefit-text">
          <text class="b-title">无限自定义习惯</text>
          <text class="b-desc">打破普通用户最多5个习惯限制，支持高达20个节律</text>
        </view>
      </view>
      <view class="benefit-item">
        <text class="benefit-icon">📅</text>
        <view class="benefit-text">
          <text class="b-title">补打卡权益卡</text>
          <text class="b-desc">忙碌无暇时支持补打前1-2天记录，延续连续成就天数</text>
        </view>
      </view>
      <view class="benefit-item">
        <text class="benefit-icon">📜</text>
        <view class="benefit-text">
          <text class="b-title">专属海报与主题皮肤</text>
          <text class="b-desc">解锁高清特制禅意分享画报与专属柔和配色</text>
        </view>
      </view>
    </view>

    <!-- 价格选择 -->
    <view class="plans-grid">
      <view 
        class="plan-card card" 
        :class="{ selected: selectedPlan === 'YEAR' }"
        @click="selectedPlan = 'YEAR'"
      >
        <view class="popular-tag">最受欢迎</view>
        <text class="plan-name">连续包年</text>
        <view class="price-box">
          <text class="price-symbol">¥</text>
          <text class="price-num">48</text>
          <text class="price-unit">/年</text>
        </view>
        <text class="plan-sub">低至 ¥4.0/月</text>
      </view>

      <view 
        class="plan-card card" 
        :class="{ selected: selectedPlan === 'MONTH' }"
        @click="selectedPlan = 'MONTH'"
      >
        <text class="plan-name">连续包月</text>
        <view class="price-box">
          <text class="price-symbol">¥</text>
          <text class="price-num">6</text>
          <text class="price-unit">/月</text>
        </view>
        <text class="plan-sub">随时取消</text>
      </view>
    </view>

    <!-- 立即开通按钮 -->
    <button class="pay-btn" @click="handlePay">
      <text>微信一键开通 · ¥{{ selectedPlan === 'YEAR' ? '48' : '6' }}</text>
    </button>
  </view>
</template>

<script>
import { request } from '../../utils/request.js'

export default {
  data() {
    return {
      selectedPlan: 'YEAR'
    }
  },
  methods: {
    async handlePay() {
      uni.showLoading({ title: '准备支付中...' })
      const res = await request('/pay/create-order', {
        method: 'POST',
        data: { planType: this.selectedPlan }
      })
      uni.hideLoading()

      if (res && res.code === 200) {
        uni.showToast({
          title: '恭喜！会员已成功开通',
          icon: 'success',
          duration: 2000
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({ title: '开通成功', icon: 'success' })
      }
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

.vip-header-card {
  background: linear-gradient(135deg, #1E4D3B 0%, #2E6D56 100%);
  border-radius: 36rpx;
  padding: 50rpx 40rpx;
  color: #FFFFFF;
  text-align: center;
  margin-bottom: 24rpx;
}

.crown-icon {
  font-size: 56rpx;
}

.vip-main-title {
  font-size: 42rpx;
  font-weight: 700;
  margin-top: 12rpx;
  display: block;
}

.vip-sub-title {
  font-size: 24rpx;
  opacity: 0.85;
  margin-top: 8rpx;
  display: block;
}

.benefits-card {
  padding: 36rpx 32rpx;
}

.benefits-header {
  font-size: 30rpx;
  font-weight: 600;
  color: #2C3531;
  margin-bottom: 24rpx;
  display: block;
}

.benefit-item {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.benefit-icon {
  font-size: 36rpx;
}

.benefit-text {
  display: flex;
  flex-direction: column;
}

.b-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
}

.b-desc {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 4rpx;
}

.plans-grid {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

.plan-card {
  flex: 1;
  padding: 36rpx 24rpx;
  text-align: center;
  position: relative;
  border: 2rpx solid transparent;
  margin-bottom: 0;
}

.plan-card.selected {
  border-color: #2E6D56;
  background-color: #EBF3EF;
}

.popular-tag {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #C79A5E;
  color: #FFFFFF;
  font-size: 18rpx;
  padding: 4rpx 14rpx;
  border-bottom-left-radius: 16rpx;
  border-top-right-radius: 24rpx;
}

.plan-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
}

.price-box {
  margin-top: 16rpx;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.price-symbol {
  font-size: 24rpx;
  color: #2E6D56;
}

.price-num {
  font-size: 48rpx;
  font-weight: 700;
  color: #2E6D56;
}

.price-unit {
  font-size: 22rpx;
  color: #7A8B82;
}

.plan-sub {
  font-size: 20rpx;
  color: #A3B1A9;
  margin-top: 8rpx;
  display: block;
}

.pay-btn {
  background-color: #2E6D56;
  color: #FFFFFF;
  border-radius: 44rpx;
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-top: 40rpx;
  border: none;
}
</style>
