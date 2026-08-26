<template>
  <view class="container">
    <!-- 头部搜索与宣导 -->
    <view class="header-card">
      <text class="header-title">🍲 食材药膳百科</text>
      <text class="header-sub">药食同源 · 查找适合您体质的黄金搭配与食用禁忌</text>

      <!-- 搜索框 -->
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword" 
          class="search-input" 
          placeholder="搜索食材（如：百合、山药、祛湿、助眠）"
          confirm-type="search"
          @confirm="handleSearch"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 功效分类横向滚动切换 -->
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

    <!-- 食材列表 -->
    <view class="food-list">
      <view v-for="food in foodList" :key="food.id" class="food-card card">
        <view class="food-header">
          <view class="food-title-group">
            <text class="food-icon">{{ food.icon || '🌿' }}</text>
            <text class="food-name">{{ food.name }}</text>
            <text class="category-badge">{{ food.category }}</text>
          </view>
          <view class="ask-ai-btn" @click="askAiAboutFood(food)">🤖 问AI禁忌</view>
        </view>

        <!-- 性味与归经 -->
        <view class="meta-row">
          <text class="meta-item">☯️ {{ food.nature }}</text>
          <text class="meta-item">🫀 {{ food.meridians }}</text>
        </view>

        <!-- 适宜体质 -->
        <view class="constitution-row">
          <text class="tag-label">适宜体质：</text>
          <text class="constitution-tag">{{ food.suitableConstitution }}</text>
        </view>

        <!-- 核心功效 -->
        <text class="effects-text">“{{ food.effects }}”</text>

        <!-- 黄金搭配 -->
        <view class="matches-box">
          <text class="box-title">✨ 黄金搭配与食疗方：</text>
          <text class="box-content">{{ food.bestMatches }}</text>
        </view>

        <!-- 食用禁忌 -->
        <view class="taboo-box">
          <text class="taboo-title">⚠️ 食用禁忌：</text>
          <text class="taboo-content">{{ food.taboo }}</text>
        </view>
      </view>

      <view v-if="foodList.length === 0" class="empty-state">
        <text class="empty-text">未找到相关食材，可以尝试搜索其他名称。</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getHerbalFoodListApi } from '../../api/food.js'

export default {
  data() {
    return {
      searchKeyword: '',
      selectedCategory: '全部',
      categories: [
        { name: '全部', icon: '🍃' },
        { name: '祛湿', icon: '💧' },
        { name: '润肺', icon: '🫁' },
        { name: '助眠', icon: '😴' },
        { name: '健脾', icon: '🍵' },
        { name: '补气', icon: '⚡' }
      ],
      foodList: []
    }
  },
  onShow() {
    this.loadFoodList()
  },
  methods: {
    async loadFoodList() {
      const res = await getHerbalFoodListApi(this.selectedCategory, '', this.searchKeyword)
      if (res && res.data) {
        this.foodList = res.data
      }
    },
    selectCategory(catName) {
      this.selectedCategory = catName
      this.loadFoodList()
    },
    handleSearch() {
      this.loadFoodList()
    },
    clearSearch() {
      this.searchKeyword = ''
      this.loadFoodList()
    },
    askAiAboutFood(food) {
      uni.navigateTo({
        url: `/pages/ai-chat/ai-chat?query=${encodeURIComponent('请问针对我的体质，食用[' + food.name + ']有什么搭配与禁忌吗？')}`
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

.header-card {
  background: linear-gradient(135deg, #1E4D3B 0%, #2E6D56 100%);
  border-radius: 36rpx;
  padding: 40rpx 36rpx;
  color: #FFFFFF;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.header-sub {
  font-size: 24rpx;
  opacity: 0.85;
  margin-top: 10rpx;
  display: block;
}

.search-box {
  margin-top: 28rpx;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 40rpx;
  padding: 12rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.search-icon {
  font-size: 30rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
  color: #FFFFFF;
}

.clear-icon {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.7);
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
  transition: all 0.2s ease;
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

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
  margin-bottom: 24rpx;
}

.food-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-title-group {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.food-icon {
  font-size: 40rpx;
}

.food-name {
  font-size: 34rpx;
  font-weight: bold;
  color: #2C3531;
}

.category-badge {
  background: #EBF3EF;
  color: #2E6D56;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

.ask-ai-btn {
  background: #FAF4EB;
  color: #8C6D46;
  font-size: 20rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-weight: 600;
}

.meta-row {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #7A8B82;
}

.constitution-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
}

.tag-label {
  font-size: 22rpx;
  color: #8C6D46;
  font-weight: 600;
}

.constitution-tag {
  font-size: 22rpx;
  color: #4A3A2C;
  background: #FAF8F3;
  padding: 2rpx 14rpx;
  border-radius: 10rpx;
}

.effects-text {
  font-size: 26rpx;
  color: #2C3531;
  line-height: 1.6;
  margin-top: 16rpx;
  display: block;
}

.matches-box {
  background: #F0F7F3;
  border-left: 6rpx solid #2E6D56;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 20rpx;
}

.box-title {
  font-size: 22rpx;
  color: #2E6D56;
  font-weight: bold;
  display: block;
}

.box-content {
  font-size: 24rpx;
  color: #2C3531;
  line-height: 1.5;
  margin-top: 6rpx;
  display: block;
}

.taboo-box {
  background: #FEF2F2;
  border-left: 6rpx solid #DC2626;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-top: 16rpx;
}

.taboo-title {
  font-size: 22rpx;
  color: #DC2626;
  font-weight: bold;
  display: block;
}

.taboo-content {
  font-size: 24rpx;
  color: #991B1B;
  line-height: 1.5;
  margin-top: 6rpx;
  display: block;
}

.empty-state {
  padding: 60rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #A3B1A9;
}
</style>
