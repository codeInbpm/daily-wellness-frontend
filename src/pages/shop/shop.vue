<template>
  <view :class="['container', themeClass]">
    <!-- 1. 头部 Banner -->
    <view class="shop-header-card">
      <text class="shop-title">🛍️ 时令养生商城</text>
      <text class="shop-sub">严选草本茶包、滋补食材、艾灸贴与草本泡脚包 · 顺时而食</text>
    </view>

    <!-- 2. 分类标签 -->
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

    <!-- 3. 商品网格 (适配精致小巧加购按钮) -->
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
            <!-- 紧凑精致型加购按钮 -->
            <view class="add-cart-btn" @click.stop="addToCart(item)">
              <text class="add-cart-icon">🛒</text>
              <text class="add-cart-text">加购</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部垫高，防止挡住商品列表底部 -->
    <view class="bottom-space" v-if="cartList.length > 0"></view>

    <!-- 4. 底部固化购物车 Bar -->
    <view class="cart-floating-bar" v-if="cartList.length > 0" @click="toggleCartDrawer">
      <view class="cart-bar-left">
        <view class="cart-icon-box">
          <text class="cart-emoji">🛒</text>
          <view class="cart-badge">{{ totalCartCount }}</view>
        </view>
        <view class="cart-price-info">
          <text class="cart-total-label">合计：</text>
          <text class="cart-total-price">¥{{ totalCartPrice }}</text>
        </view>
      </view>

      <view class="cart-bar-right">
        <view class="btn-open-cart">查看购物车 / 结算 ❯</view>
      </view>
    </view>

    <!-- 5. 购物车管理抽屉 Modal -->
    <view v-if="showCartDrawer" class="cart-drawer-mask" @click="closeCartDrawer">
      <view class="cart-drawer-card" @click.stop>
        <view class="drawer-header">
          <view class="drawer-title-group">
            <text class="drawer-title">🛒 养生购物车</text>
            <text class="drawer-sub">共 {{ totalCartCount }} 件商品</text>
          </view>
          <text class="btn-clear-cart" @click="clearCart">🗑️ 清空购物车</text>
        </view>

        <scroll-view class="cart-items-scroll" scroll-y>
          <view v-for="(cItem, index) in cartList" :key="cItem.id" class="cart-item-row">
            <image :src="cItem.productImage || cItem.imageUrl" class="cart-item-img" mode="aspectFill"/>
            
            <view class="cart-item-info">
              <text class="cart-item-title">{{ cItem.productTitle || cItem.title }}</text>
              <text class="cart-item-spec">规格：{{ cItem.productSpec || cItem.spec }}</text>
              <text class="cart-item-price">¥{{ cItem.productPrice || cItem.price }}</text>
            </view>

            <!-- 增加 / 减少 / 删除 数量管理器 -->
            <view class="quantity-controller">
              <view class="qty-btn" @click="decreaseQty(cItem, index)">-</view>
              <text class="qty-num">{{ cItem.quantity }}</text>
              <view class="qty-btn" @click="increaseQty(cItem, index)">+</view>
              <view class="delete-cart-btn" @click="removeCartItem(cItem, index)" title="删除">🗑️</view>
            </view>
          </view>
        </scroll-view>

        <!-- 结算操作底栏 -->
        <view class="drawer-footer">
          <view class="drawer-total-box">
            <text class="d-total-label">应付总额：</text>
            <text class="d-total-price">¥{{ totalCartPrice }}</text>
          </view>
          <button class="btn-checkout" @click="handleCheckout">提交订单</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { 
  getShopProductsApi, 
  getCartListApi, 
  addToCartApi, 
  updateCartQuantityApi, 
  deleteCartItemApi,
  getAddressesApi,
  createMallOrderApi 
} from '../../api/shop.js'
import { getUserInfo } from '../../utils/auth.js'
import { setupThemeListener, getThemeClass } from '../../utils/theme.js'

export default {
  data() {
    return {
      selectedCategory: '全部',
      showCartDrawer: false,
      cartList: [],
      themeClass: getThemeClass(),
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
  computed: {
    totalCartCount() {
      return this.cartList.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalCartPrice() {
      const price = this.cartList.reduce((sum, item) => {
        const p = item.productPrice || item.price || 0
        return sum + (p * item.quantity)
      }, 0)
      return price.toFixed(1)
    }
  },
  mounted() {
    setupThemeListener(this)
  },
  onShow() {
    this.loadProducts()
    this.loadCart()
  },
  methods: {
    async loadProducts() {
      const res = await getShopProductsApi(this.selectedCategory)
      if (res && res.data) {
        this.products = res.data
      }
    },
    async loadCart() {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      const res = await getCartListApi(userId)
      if (res && res.data) {
        this.cartList = res.data
      }
    },
    selectCategory(catName) {
      this.selectedCategory = catName
      this.loadProducts()
    },

    // 加入购物车逻辑
    async addToCart(item) {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      
      uni.showLoading({ title: '正在加入...' })
      const res = await addToCartApi(item.id, 1, userId)
      uni.hideLoading()

      if (res && res.code === 200) {
        uni.showToast({ title: '已加入购物车', icon: 'success' })
        this.loadCart()
      }
    },

    async increaseQty(cItem, index) {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      const newQty = cItem.quantity + 1
      cItem.quantity = newQty
      await updateCartQuantityApi(cItem.id, newQty, userId)
    },
    async decreaseQty(cItem, index) {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      if (cItem.quantity > 1) {
        const newQty = cItem.quantity - 1
        cItem.quantity = newQty
        await updateCartQuantityApi(cItem.id, newQty, userId)
      } else {
        this.removeCartItem(cItem, index)
      }
    },
    async removeCartItem(cItem, index) {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      await deleteCartItemApi(cItem.id, userId)
      this.cartList.splice(index, 1)
      uni.showToast({ title: '已移除商品', icon: 'none' })
      if (this.cartList.length === 0) {
        this.showCartDrawer = false
      }
    },
    clearCart() {
      uni.showModal({
        title: '提示',
        content: '确定要清空购物车吗？',
        success: async (res) => {
          if (res.confirm) {
            for (const item of this.cartList) {
              await deleteCartItemApi(item.id)
            }
            this.cartList = []
            this.showCartDrawer = false
            uni.showToast({ title: '已清空购物车', icon: 'none' })
          }
        }
      })
    },
    toggleCartDrawer() {
      if (this.cartList.length === 0) {
        uni.showToast({ title: '购物车暂无商品，快去挑选吧~', icon: 'none' })
        return
      }
      this.showCartDrawer = !this.showCartDrawer
    },
    closeCartDrawer() {
      this.showCartDrawer = false
    },
    async handleCheckout() {
      if (this.cartList.length === 0) return

      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1

      uni.showLoading({ title: '获取收货地址...' })
      const addrRes = await getAddressesApi(userId)
      uni.hideLoading()

      let addressId = 1
      if (addrRes && addrRes.data && addrRes.data.length > 0) {
        addressId = addrRes.data[0].id
      }

      uni.showLoading({ title: '正在提交订单...' })
      const orderRes = await createMallOrderApi(addressId, '请尽快发货，谢谢！', userId)
      uni.hideLoading()

      if (orderRes && orderRes.code === 200) {
        uni.showToast({ title: '实物商品订单提交成功！', icon: 'success', duration: 2500 })
        this.cartList = []
        this.showCartDrawer = false
      } else {
        uni.showToast({ title: (orderRes && orderRes.msg) || '订单创建失败', icon: 'none' })
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
  position: relative;
}

.shop-header-card {
  background: var(--color-banner-gradient);
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
  transition: all 0.2s;
}

.cat-chip.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.cat-icon {
  font-size: 26rpx;
}

.cat-text {
  font-size: 26rpx;
  color: var(--color-text-main);
  font-weight: 500;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.card {
  background-color: var(--color-card-bg);
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
  height: 220rpx;
}

.product-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  font-size: 26rpx;
  font-weight: bold;
  color: var(--color-text-main);
  display: block;
  height: 38rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-desc {
  font-size: 20rpx;
  color: var(--color-text-sub);
  margin-top: 6rpx;
  line-height: 1.3;
  display: block;
  height: 52rpx;
  overflow: hidden;
}

.product-spec {
  font-size: 18rpx;
  color: var(--color-text-muted);
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
  font-size: 20rpx;
  color: #DC2626;
  font-weight: bold;
}

.price-num {
  font-size: 30rpx;
  color: #DC2626;
  font-weight: bold;
}

.original-price {
  font-size: 18rpx;
  color: #A3B1A9;
  text-decoration: line-through;
  margin-left: 6rpx;
}

/* 紧凑精致加购按钮 */
.add-cart-btn {
  background: var(--color-primary);
  color: #FFFFFF;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.15s;
}

.add-cart-btn:active {
  transform: scale(0.92);
}

.add-cart-icon {
  font-size: 20rpx;
}

.add-cart-text {
  font-size: 20rpx;
  font-weight: bold;
}

.bottom-space {
  height: 140rpx;
}

/* 4. 底部浮动购物车 Bar */
.cart-floating-bar {
  position: fixed;
  bottom: 24rpx;
  left: 32rpx;
  right: 32rpx;
  background: rgba(30, 40, 35, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 50rpx;
  padding: 16rpx 32rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.25);
  z-index: 100;
}

.cart-bar-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.cart-icon-box {
  position: relative;
  width: 68rpx;
  height: 68rpx;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-emoji {
  font-size: 32rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #DC2626;
  color: #FFFFFF;
  font-size: 18rpx;
  font-weight: bold;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
  border: 2rpx solid #FFFFFF;
}

.cart-price-info {
  display: flex;
  align-items: baseline;
}

.cart-total-label {
  font-size: 22rpx;
  color: #DDD;
}

.cart-total-price {
  font-size: 36rpx;
  color: #FFFFFF;
  font-weight: bold;
}

.btn-open-cart {
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: bold;
  padding: 12rpx 28rpx;
  border-radius: 30rpx;
}

/* 5. 购物车抽屉 Modal */
.cart-drawer-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.cart-drawer-card {
  background: #FFFFFF;
  border-radius: 36rpx 36rpx 0 0;
  padding: 40rpx 36rpx 50rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24rpx;
  border-bottom: 1px solid #F0F0F0;
}

.drawer-title {
  font-size: 34rpx;
  font-weight: bold;
  color: var(--color-text-main);
}

.drawer-sub {
  font-size: 22rpx;
  color: var(--color-text-sub);
  margin-left: 12rpx;
}

.btn-clear-cart {
  font-size: 22rpx;
  color: #999;
}

.cart-items-scroll {
  max-height: 50vh;
  margin-top: 16rpx;
}

.cart-item-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px dashed #F5F5F5;
  gap: 20rpx;
}

.cart-item-img {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
}

.cart-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cart-item-title {
  font-size: 26rpx;
  font-weight: bold;
  color: var(--color-text-main);
}

.cart-item-spec {
  font-size: 20rpx;
  color: var(--color-text-muted);
  margin-top: 4rpx;
}

.cart-item-price {
  font-size: 26rpx;
  color: #DC2626;
  font-weight: bold;
  margin-top: 6rpx;
}

.quantity-controller {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.qty-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 22rpx;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 26rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-num {
  font-size: 26rpx;
  font-weight: bold;
  color: var(--color-text-main);
  min-width: 32rpx;
  text-align: center;
}

.delete-cart-btn {
  font-size: 26rpx;
  padding: 8rpx;
  margin-left: 8rpx;
}

.drawer-footer {
  margin-top: 30rpx;
  padding-top: 20rpx;
  border-top: 1px solid #F0F0F0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-total-box {
  display: flex;
  align-items: baseline;
}

.d-total-label {
  font-size: 24rpx;
  color: var(--color-text-sub);
}

.d-total-price {
  font-size: 40rpx;
  color: #DC2626;
  font-weight: bold;
}

.btn-checkout {
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
  padding: 16rpx 44rpx;
  border-radius: 40rpx;
  border: none;
}
</style>
