<template>
  <view :class="['container', themeClass]">
    <!-- 顶部尊享 VIP Banner -->
    <view class="vip-header-card">
      <view class="header-top">
        <view class="crown-badge">👑 VIP 尊享会员</view>
        <text class="social-proof">已有 1,280+ 养生道友加入</text>
      </view>
      
      <!-- 如果当前已经是 VIP 会员，展示生效及到期时间 -->
      <view class="current-vip-info-box" v-if="userInfo && userInfo.isVip">
        <view class="info-tag-row">
          <text class="status-tag">尊贵会员已生效</text>
          <text class="days-remaining-pill">剩余 {{ (userInfo.vipRemainingDays > 30000) ? '永久有效' : (userInfo.vipRemainingDays + ' 天') }}</text>
        </view>
        <view class="dates-detail-row">
          <text>开通时间：{{ formatVipDate(userInfo.vipStartTime) }}</text>
          <text>到期时间：{{ formatVipDate(userInfo.vipExpireTime) }}</text>
        </view>
        <view v-if="userInfo.isExpiringSoon" class="expiring-notice">
          ⚠️ 您的会员即将在 {{ userInfo.vipRemainingDays }} 天后到期，现在续费可延长有效期！
        </view>
      </view>
      <template v-else>
        <text class="vip-main-title">让坚持养生更自由、更有仪式感</text>
        <text class="vip-sub-title">解锁无限习惯、历史补打卡、专属柔和主题与完整养生干货</text>
      </template>
    </view>

    <!-- 8 大 VIP 专属权益清单卡片 -->
    <view class="card benefits-card">
      <view class="card-title-row">
        <text class="benefits-header">VIP 核心特权清单</text>
        <text class="benefits-sub-tag">可感知 · 可炫耀 · 助坚持</text>
      </view>

      <view class="benefits-grid">
        <view class="benefit-item">
          <text class="benefit-icon">✨</text>
          <view class="benefit-text">
            <text class="b-title">无限自定义习惯</text>
            <text class="b-desc">突破免费 5 个限制，支持高达 20 个个人习惯节律。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">📅</text>
          <view class="benefit-text">
            <text class="b-title">补打卡权益保护</text>
            <text class="b-desc">忙碌或忘记时，可补打前 1~2 天记录，保护连续成就不中断。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">🎨</text>
          <view class="benefit-text">
            <text class="b-title">多套专属主题皮肤</text>
            <text class="b-desc">解锁竹青、暖杏、暮山紫、松柏绿等多套柔和高级配色。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">📜</text>
          <view class="benefit-text">
            <text class="b-title">高清无水印成就海报</text>
            <text class="b-desc">生成精美禅意打卡海报，带专属 VIP 标识，方便分享圈子。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">📊</text>
          <view class="benefit-text">
            <text class="b-title">完整养生周报 / 月报</text>
            <text class="b-desc">自动分析完成率、习惯分布与连续记录，清晰复盘调理进阶。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">🔓</text>
          <view class="benefit-text">
            <text class="b-title">全量干货与节气方案</text>
            <text class="b-desc">解锁全部中医调养文章、辟谣真解与进阶食疗起居方案。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">🏷️</text>
          <view class="benefit-text">
            <text class="b-title">社区 VIP 专属标识</text>
            <text class="b-desc">在养生圈显示 VIP 尊贵尊享徽章，优质打卡动态优先推荐。</text>
          </view>
        </view>

        <view class="benefit-item">
          <text class="benefit-icon">🚫</text>
          <view class="benefit-text">
            <text class="b-title">无广告纯净体验</text>
            <text class="b-desc">彻底清除页面广告弹窗与干扰，享受极致纯净的养生体验。</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 价格套餐卡片方案 (支持连续包月 6元 / 连续包年 48元 / 永久会员 128元) -->
    <view class="plans-section card">
      <text class="section-title">1. 选择适合您的修养套餐</text>
      
      <view class="plans-grid">
        <view 
          class="plan-card" 
          :class="{ selected: selectedPlan === 'YEAR' }"
          @click="selectPlan('YEAR')"
        >
          <view class="popular-tag">最受欢迎 · 推荐</view>
          <text class="plan-name">连续包年</text>
          <view class="price-box">
            <text class="price-symbol">¥</text>
            <text class="price-num">48</text>
            <text class="price-unit">/年</text>
          </view>
          <text class="plan-sub">折合 ¥4.0/月 (每天1毛3)</text>
        </view>

        <view 
          class="plan-card" 
          :class="{ selected: selectedPlan === 'MONTH' }"
          @click="selectPlan('MONTH')"
        >
          <text class="plan-name">连续包月</text>
          <view class="price-box">
            <text class="price-symbol">¥</text>
            <text class="price-num">6</text>
            <text class="price-unit">/月</text>
          </view>
          <text class="plan-sub">灵活试用 · 随时取消</text>
        </view>

        <view 
          class="plan-card" 
          :class="{ selected: selectedPlan === 'LIFETIME' }"
          @click="selectPlan('LIFETIME')"
        >
          <view class="popular-tag lifetime-tag">限时终身</view>
          <text class="plan-name">永久会员</text>
          <view class="price-box">
            <text class="price-symbol">¥</text>
            <text class="price-num">128</text>
            <text class="price-unit">/终身</text>
          </view>
          <text class="plan-sub">一次付费 · 终身享有</text>
        </view>
      </view>

      <view class="plan-guarantee">
        <text class="guarantee-icon">🛡️</text>
        <text class="guarantee-text">真实个人扫码赞赏开通 · 提交凭证后秒级自动审核开通 VIP</text>
      </view>
    </view>

    <!-- 2. 线下扫码转账卡片 (生成订单后展示) -->
    <view v-if="orderInfo" class="card pay-qr-card">
      <view class="qr-header">
        <text class="qr-title">2. 扫描微信赞赏码完成转账</text>
        <text class="order-no-tag">订单号：{{ orderInfo.orderNo }}</text>
      </view>

      <view class="qr-content-box">
        <view class="amount-line">
          <text class="a-label">应付金额：</text>
          <text class="a-symbol">¥</text>
          <text class="a-num">{{ orderInfo.amount }}</text>
        </view>

        <!-- 收款码图片展示区 (点击全屏大图/支持保存与微信扫码) -->
        <view class="qr-image-wrapper">
          <view class="qr-code-box">
            <text class="qr-badge-title">云养生的店铺 · 微信官方支付收款码</text>
            <view class="real-qr-container" @click="previewQrCode">
              <image class="real-qr-img" src="/static/qr_code.png" mode="widthFix" show-menu-by-longpress="true"/>
              <view class="qr-hover-mask">
                <text class="zoom-icon">🔍</text>
                <text class="zoom-tip">点击放大大图 / 长按弹出微信识别</text>
              </view>
            </view>
            
            <button class="btn-preview-big" @click="previewQrCode">
              🔍 无法扫码？点击全屏放大 / 长按识别
            </button>
          </view>
        </view>

        <view class="pay-tips-box">
          <text class="tip-line">💡 支付说明：扫码转账对应金额【¥{{ orderInfo.amount }}】后，将转账成功截图或微信交易单号上传至下方，系统将自动核销并秒级开通 VIP 权益！</text>
        </view>
      </view>

      <!-- 3. 上传转账凭证截图与单号备注 -->
      <view class="proof-form-section">
        <text class="form-title">3. 上传转账凭证与确认</text>
        
        <view class="upload-proof-box">
          <view v-if="!payScreenshot" class="upload-trigger" @click="chooseProofImage">
            <text class="upload-icon">📷</text>
            <text class="upload-tip">点击上传微信转账成功截图</text>
          </view>
          <view v-else class="preview-proof-box">
            <image :src="payScreenshot" class="proof-img" mode="aspectFill"/>
            <view class="btn-remove-proof" @click="payScreenshot = ''">✕ 重新上传</view>
          </view>
        </view>

        <view class="remark-input-box">
          <input 
            v-model="transferRemark" 
            class="remark-input" 
            placeholder="可选填：微信转账单号 / 微信昵称备注"
          />
        </view>

        <button class="btn-submit-proof" @click="submitPayProof">
          <text>确认已完成转账 · 提交开通 VIP</text>
        </button>
      </view>
    </view>

    <!-- 底部固定开通栏 (未生成订单时显示) -->
    <view v-if="!orderInfo" class="footer-spacer"></view>
    <view v-if="!orderInfo" class="fixed-bottom-bar">
      <button class="pay-btn" @click="handleCreateOrder">
        <text class="pay-btn-text">生成订单并展示转账收款码 · ¥{{ getPlanPrice() }}</text>
        <text class="pay-btn-sub">获得【{{ currentPlanText }}】完整养生权益</text>
      </button>
    </view>
  </view>
</template>

<script>
import { createOrderApi } from '../../api/pay.js'
import { getUserInfoApi } from '../../api/auth.js'
import { checkLogin, getUserInfo } from '../../utils/auth.js'
import { setupThemeListener, getThemeClass } from '../../utils/theme.js'
import loginModal from '../../components/login-modal/login-modal.vue'

export default {
  components: {
    loginModal
  },
  data() {
    return {
      selectedPlan: 'YEAR', // 'MONTH', 'YEAR', 'LIFETIME'
      showQrModal: false,
      payOrderInfo: null,
      userInfo: null,
      themeClass: getThemeClass()
    }
  },
  computed: {
    currentPlanText() {
      if (this.selectedPlan === 'MONTH') return '连续包月 (¥6/月)'
      if (this.selectedPlan === 'LIFETIME') return '永久会员 (¥128/终身)'
      return '连续包年 (¥48/年)'
    }
  },
  mounted() {
    setupThemeListener(this)
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    formatVipDate(dateStr) {
      if (!dateStr) return '暂无记录'
      return dateStr.substring(0, 10)
    },
    async loadUserInfo() {
      const u = getUserInfo()
      if (u && u.id) {
        try {
          const res = await getUserInfoApi(u.id)
          if (res && res.data) {
            this.userInfo = res.data
          }
        } catch (e) {
          this.userInfo = u
        }
      }
    },
    selectPlan(plan) {
      this.selectedPlan = plan
      this.orderInfo = null // 切换套餐时重置订单
    },
    getPlanPrice() {
      if (this.selectedPlan === 'MONTH') return '6'
      if (this.selectedPlan === 'LIFETIME') return '128'
      return '48'
    },
    previewQrCode() {
      // 优先从前端网络中提取或传入兼容的全路径，避免部分低版本 IDE 模拟器黑屏转圈
      const imgUrl = '/static/qr_code.png'
      uni.previewImage({
        urls: [imgUrl],
        current: imgUrl,
        showmenu: true,
        fail: (err) => {
          console.error('全屏大图预览', err)
        }
      })
    },
    async handleCreateOrder() {
      if (!checkLogin()) return

      const user = getUserInfo()
      const userId = (user && user.id) ? user.id : 1

      uni.showLoading({ title: '生成转账订单中...' })
      try {
        const res = await request('/pay/create-order', {
          method: 'POST',
          data: { userId: userId, planType: this.selectedPlan }
        })
        uni.hideLoading()

        if (res && res.code === 200 && res.data) {
          this.orderInfo = res.data
          uni.showToast({ title: '订单创建成功，请扫码转账', icon: 'success' })
        } else {
          uni.showToast({ title: res?.msg || '创建失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '请求失败', icon: 'none' })
      }
    },
    chooseProofImage() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          const tempPath = res.tempFilePaths[0]
          uni.showLoading({ title: '上传凭证中...' })
          try {
            const upRes = await uploadFileApi(tempPath)
            uni.hideLoading()
            this.payScreenshot = (upRes && upRes.data && upRes.data.url) ? upRes.data.url : tempPath
          } catch (e) {
            uni.hideLoading()
            this.payScreenshot = tempPath
          }
        }
      })
    },
    async submitPayProof() {
      if (!this.orderInfo || !this.orderInfo.orderNo) {
        uni.showToast({ title: '订单信息有误', icon: 'none' })
        return
      }

      const user = getUserInfo()
      const userId = (user && user.id) ? user.id : 1

      uni.showLoading({ title: '正在核销开通 VIP...' })
      try {
        const res = await request('/pay/submit-proof', {
          method: 'POST',
          data: {
            userId: userId,
            orderNo: this.orderInfo.orderNo,
            payScreenshot: this.payScreenshot,
            remark: this.transferRemark
          }
        })
        uni.hideLoading()

        if (res && res.code === 200) {
          uni.showToast({
            title: '🎉 VIP 权益已成功秒级开通！',
            icon: 'success',
            duration: 2000
          })
          uni.$emit('user_auth_changed')
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({ title: res?.msg || '提交失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '提交异常', icon: 'none' })
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

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
  margin-bottom: 24rpx;
}

/* 顶部 Banner */
.vip-header-card {
  background: var(--color-banner-gradient);
  border-radius: 36rpx;
  padding: 48rpx 40rpx;
  color: #FFFFFF;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(30, 77, 59, 0.2);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.crown-badge {
  background: rgba(255, 215, 0, 0.2);
  color: #FFD700;
  border: 1px solid rgba(255, 215, 0, 0.4);
  font-size: 24rpx;
  font-weight: bold;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
}

.social-proof {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.current-vip-info-box {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  padding: 24rpx 28rpx;
  margin-top: 16rpx;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.info-tag-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.status-tag {
  font-size: 28rpx;
  font-weight: 700;
  color: #FFD700;
}

.days-remaining-pill {
  background: #FFD700;
  color: #5D4037;
  font-size: 20rpx;
  font-weight: 800;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
}

.dates-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  opacity: 0.9;
}

.expiring-notice {
  margin-top: 16rpx;
  background: rgba(220, 38, 38, 0.25);
  border: 1px solid rgba(252, 165, 165, 0.5);
  color: #FECACA;
  font-size: 22rpx;
  padding: 10rpx 16rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.vip-main-title {
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.35;
  display: block;
}

.vip-sub-title {
  font-size: 24rpx;
  opacity: 0.85;
  margin-top: 12rpx;
  display: block;
  line-height: 1.5;
}

/* 8 大权益 */
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.benefits-header {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C3531;
}

.benefits-sub-tag {
  font-size: 20rpx;
  color: #2E6D56;
  background-color: #EBF3EF;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  font-weight: 600;
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24rpx;
}

.benefit-item {
  display: flex;
  gap: 20rpx;
  align-items: flex-start;
}

.benefit-icon {
  font-size: 38rpx;
  line-height: 1;
  background: #FAF8F3;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
  line-height: 1.4;
}

/* 价格方案 */
.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2C3531;
  margin-bottom: 24rpx;
  display: block;
}

.plans-grid {
  display: flex;
  gap: 20rpx;
}

.plan-card {
  flex: 1;
  padding: 36rpx 20rpx;
  text-align: center;
  position: relative;
  border: 4rpx solid #EBF3EF;
  border-radius: 24rpx;
  background-color: #FAF8F3;
  transition: all 0.25s ease;
}

.plan-card.selected {
  border-color: #2E6D56;
  background-color: #EBF3EF;
}

.popular-tag.lifetime-tag {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
}

/* 扫码转账卡片与凭证上传样式 */
.pay-qr-card {
  padding: 40rpx 32rpx;
  background: linear-gradient(180deg, #FFFFFF 0%, #FAF8F3 100%);
  border: 2rpx solid rgba(46, 109, 86, 0.2);
}

.qr-header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.qr-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C3531;
}

.order-no-tag {
  font-size: 22rpx;
  color: #7A8B82;
  font-family: monospace;
}

.amount-line {
  display: flex;
  align-items: baseline;
  background: #EBF3EF;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.a-label {
  font-size: 26rpx;
  color: #2C3531;
}

.a-symbol {
  font-size: 28rpx;
  color: #DC2626;
  font-weight: bold;
}

.a-num {
  font-size: 48rpx;
  font-weight: 800;
  color: #DC2626;
}

.qr-image-wrapper {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}

.qr-code-box {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);
  text-align: center;
  width: 100%;
}

.qr-badge-title {
  font-size: 24rpx;
  color: #2E6D56;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.real-qr-container {
  position: relative;
  width: 100%;
  max-width: 480rpx;
  margin: 0 auto;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.08);
}

.real-qr-img {
  width: 100%;
  display: block;
}

.qr-hover-mask {
  background: rgba(30, 77, 59, 0.85);
  color: #FFFFFF;
  padding: 10rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.zoom-icon {
  font-size: 24rpx;
}

.zoom-tip {
  font-size: 20rpx;
  font-weight: 500;
}

.btn-preview-big {
  margin-top: 20rpx;
  background: #EBF3EF;
  color: #2E6D56;
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 30rpx;
  border: 1px solid rgba(46, 109, 86, 0.3);
}

.sim-qr-icon {
  font-size: 52rpx;
}

.sim-qr-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #1E4D3B;
}

.sim-qr-sub {
  font-size: 22rpx;
  color: #7A8B82;
}

.pay-tips-box {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  padding: 20rpx;
  border-radius: 16rpx;
  margin-top: 24rpx;
}

.tip-line {
  font-size: 22rpx;
  color: #B45309;
  line-height: 1.5;
}

/* 凭证提交 */
.proof-form-section {
  margin-top: 36rpx;
  padding-top: 28rpx;
  border-top: 1px dashed rgba(0,0,0,0.1);
}

.form-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #2C3531;
  margin-bottom: 20rpx;
  display: block;
}

.upload-proof-box {
  margin-bottom: 20rpx;
}

.upload-trigger {
  background: #FFFFFF;
  border: 2rpx dashed #CBD5E1;
  border-radius: 20rpx;
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.upload-icon {
  font-size: 48rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #64748B;
}

.preview-proof-box {
  position: relative;
}

.proof-img {
  width: 100%;
  height: 320rpx;
  border-radius: 20rpx;
}

.btn-remove-proof {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: rgba(0, 0, 0, 0.65);
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
}

.remark-input-box {
  margin-bottom: 24rpx;
}

.remark-input {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
}

.btn-submit-proof {
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: 700;
  border-radius: 44rpx;
  padding: 18rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(16, 185, 129, 0.25);
}

.plan-name {
  font-size: 30rpx;
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
  font-size: 26rpx;
  color: #2E6D56;
  font-weight: bold;
}

.price-num {
  font-size: 52rpx;
  font-weight: 800;
  color: #2E6D56;
}

.price-unit {
  font-size: 22rpx;
  color: #7A8B82;
}

.plan-sub {
  font-size: 20rpx;
  color: #8C6D46;
  margin-top: 10rpx;
  display: block;
  font-weight: 500;
}

.plan-guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-top: 24rpx;
  padding-top: 16rpx;
  border-top: 1px dashed rgba(46, 109, 86, 0.15);
}

.guarantee-icon {
  font-size: 24rpx;
}

.guarantee-text {
  font-size: 20rpx;
  color: #7A8B82;
}

/* 底部按钮 */
.footer-spacer {
  height: 160rpx;
}

.fixed-bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20rpx 36rpx 40rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
  z-index: 90;
}

.pay-btn {
  background: var(--color-banner-gradient);
  color: #FFFFFF;
  border-radius: 48rpx;
  padding: 20rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(30, 77, 59, 0.25);
  border: none;
}

.pay-btn-text {
  font-size: 32rpx;
  font-weight: 700;
}

.pay-btn-sub {
  font-size: 20rpx;
  opacity: 0.8;
  margin-top: 2rpx;
}
</style>
