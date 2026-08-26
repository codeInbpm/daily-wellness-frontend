<template>
  <view class="container">
    <!-- 头部 Banner -->
    <view class="shop-header-card">
      <text class="shop-title">🛍️ 时令养生商城</text>
      <text class="shop-sub">严选草本茶包、滋补食材、艾灸贴与草本泡脚包 · 顺时而食</text>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-scroll" scroll-x>
      <view 
        v-for="cat in categories" 
        :key="cat.name" 
        class="cat-chip"
        :class="{ active: selectedCategory === cat.name }"
        @click="selectCategory(cat.name)"
      >
        <text class="cat-icon">{{ cat.icon }}</text>
        <text class="cat-text">{{ cat.name }}</text>
      </view>
    </scroll-view>

    <!-- 商品网格 -->
    <view class="product-grid">
      <view v-for="item in products" :key="item.id" class="product-card card">
        <image :src="item.imageUrl" class="product-img" mode="aspectFill"/>
        <view class="product-info">
          <text class="product-title">{{ item.title }}</text>
          <text class="product-desc">{{ item.description }}</text>
          <text class="product-spec">规格：{{ item.spec }}</text>

          <view class="product-footer">
            <view class="price-box">
              <text class="price-symbol">¥</text>
              <text class="price-num">{{ item.price }}</text>
              <text v-if="item.originalPrice" class="original-price">¥{{ item.originalPrice }}</text>
            </view>
            <button class="btn-buy" @click="buyProduct(item)">立即加购</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 模拟购买确认弹窗 -->
    <view v-if="showBuyModal" class="buy-modal-mask" @click="closeBuyModal">
      <view class="buy-modal-card" @click.stop>
        <text class="modal-title">订单结算确认</text>
        <text class="modal-name">{{ activeProduct.title }}</text>
        <text class="modal-price">结算金额：¥{{ activeProduct.price }}</text>
        <text class="modal-tip">🛡️ 7天无理由退换 · 全国包邮发货</text>

        <view class="modal-actions">
          <button class="btn-cancel" @click="closeBuyModal">取消</button>
          <button class="btn-pay" @click="confirmPay">微信支付下单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getShopProductsApi } from '../../api/shop.js'

export default {
  data() {
    return {
      selectedCategory: '全部',
      showBuyModal: false,
      activeProduct: {},
      categories: [
        { name: '全部', icon: '🎁' },
        { name: '养生茶包', icon: '🍵' },
        { name: '滋补食材', icon: '🥣' },
        { name: '艾灸贴', icon: '🔥' },
        { name: '泡脚包', icon: '🦶' }
      ],
      products: []
    }
  },
  onShow() {
    this.loadProducts()
  },
  methods: {
    async loadProducts() {
      const res = await getShopProductsApi(this.selectedCategory)
      if (res && res.data) {
        this.products = res.data
      }
    },
    selectCategory(catName) {
      this.selectedCategory = catName
      this.loadProducts()
    },
    buyProduct(item) {
      this.activeProduct = item
      this.showBuyModal = true
    },
    closeBuyModal() {
      this.showBuyModal = false
    },
    confirmPay() {
      uni.showLoading({ title: '发起微信支付...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({ title: '下单成功！我们将尽快发货', icon: 'success' })
        this.showBuyModal = false
      }, 800)
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

.shop-header-card {
  background: linear-gradient(135deg, #1E4D3B 0%, #2E6D56 100%);
  border-radius: 36rpx;
  padding: 40rpx 36rpx;
  color: #FFFFFF;
  margin-bottom: 24rpx;
}

.shop-title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.shop-sub {
  font-size: 24rpx;
  opacity: 0.85;
  margin-top: 10rpx;
  display: block;
}

.category-scroll {
  white-space: nowrap;
  width: 100%;
  margin-bottom: 24rpx;
}

.cat-chip {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 32rpx;
  background: #FFFFFF;
  border-radius: 30rpx;
  margin-right: 16rpx;
  border: 2rpx solid transparent;
}

.cat-chip.active {
  background: #EBF3EF;
  border-color: #2E6D56;
}

.cat-icon {
  font-size: 26rpx;
}

.cat-text {
  font-size: 26rpx;
  color: #2C3531;
  font-weight: 500;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.product-card {
  display: flex;
  flex-direction: column;
}

.product-img {
  width: 100%;
  height: 240rpx;
}

.product-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C3531;
  display: block;
}

.product-desc {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 8rpx;
  line-height: 1.4;
  display: block;
}

.product-spec {
  font-size: 20rpx;
  color: #A3B1A9;
  margin-top: 6rpx;
  display: block;
}

.product-footer {
  margin-top: auto;
  padding-top: 16rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-box {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 22rpx;
  color: #DC2626;
  font-weight: bold;
}

.price-num {
  font-size: 32rpx;
  color: #DC2626;
  font-weight: bold;
}

.original-price {
  font-size: 20rpx;
  color: #A3B1A9;
  text-decoration: line-through;
  margin-left: 8rpx;
}

.btn-buy {
  background: #2E6D56;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 24rpx;
  border: none;
  font-weight: 600;
}

.buy-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.buy-modal-card {
  width: 100%;
  max-width: 560rpx;
  background: #FFFFFF;
  border-radius: 36rpx;
  padding: 40rpx 36rpx;
  text-align: center;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2C3531;
  display: block;
}

.modal-name {
  font-size: 28rpx;
  color: #2E6D56;
  margin-top: 16rpx;
  display: block;
  font-weight: 600;
}

.modal-price {
  font-size: 36rpx;
  color: #DC2626;
  font-weight: bold;
  margin-top: 12rpx;
  display: block;
}

.modal-tip {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 16rpx;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 36rpx;
}

.btn-cancel {
  flex: 1;
  background: #FAF8F3;
  color: #7A8B82;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-pay {
  flex: 1;
  background: #2E6D56;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}
</style>
