<template>
  <view class="container">
    <view class="card article-detail-card" v-if="article">
      <!-- 标签与分类 -->
      <view class="header-tags">
        <text class="type-badge" :class="article.type === 2 ? 'rumor' : (article.mediaType === 2 ? 'video' : 'dry')">
          {{ article.type === 2 ? '🚫 养生辟谣' : (article.mediaType === 2 ? '🎬 养生视频' : '💡 养生干货') }}
        </text>
        <text class="cat-label">{{ article.categoryName }}</text>
      </view>

      <text class="article-title">{{ article.title }}</text>

      <view class="meta-row">
        <text class="meta-text">👁️ 浏览 {{ article.viewCount || 1 }} 次</text>
        <text class="meta-text">📅 发布时间：{{ formatDate(article.createdAt) }}</text>
      </view>

      <!-- 媒体层：如果是视频类型，显示视频播放组件 -->
      <view class="media-container" v-if="article.mediaType === 2 && article.videoUrl">
        <video 
          class="video-player"
          :src="article.videoUrl"
          :poster="article.coverUrl"
          controls
          autoplay
          show-fullscreen-btn
          show-play-btn
        ></video>
      </view>

      <!-- 媒体层：如果是短图文且有封面图 -->
      <view class="image-container" v-else-if="article.coverUrl">
        <image class="detail-cover-img" :src="article.coverUrl" mode="aspectFill"></image>
      </view>

      <!-- 辟谣专用双色对比框 -->
      <view class="rumor-full-box" v-if="article.type === 2">
        <view class="rumor-section">
          <view class="rumor-title">❌ 常见误区陷阱</view>
          <text class="rumor-content">{{ article.summary }}</text>
        </view>
        
        <view class="truth-section">
          <view class="truth-title">✅ 中医师解说真知</view>
          <text class="truth-content">{{ article.rumorTruth }}</text>
        </view>
      </view>

      <!-- 文章正文 -->
      <view class="article-body">
        <text class="body-text">{{ article.content }}</text>
      </view>

      <!-- 免责声明与底部点赞 -->
      <view class="disclaimer-bar">
        <text class="disclaimer-text">* 本文科普内容仅供日常养生保健参考，不替代任何临床医疗诊断与处方。</text>
      </view>

      <view class="action-bar">
        <button class="like-btn" :class="{ liked: isLiked }" @click="handleLike">
          👍 {{ isLiked ? '已赞' : '点赞赞赏' }} ({{ article.likeCount || 0 }})
        </button>
      </view>
    </view>

    <!-- 关联推荐列表 -->
    <view class="recommend-section" v-if="recommendList.length > 0">
      <view class="rec-header">
        <text class="rec-title">💡 推荐更多养生干货与辟谣</text>
      </view>
      <view class="rec-list">
        <view 
          v-for="item in recommendList" 
          :key="item.id" 
          class="card rec-item-card"
          @click="goToDetail(item.id)"
        >
          <image class="rec-cover" :src="item.coverUrl" mode="aspectFill" v-if="item.coverUrl"></image>
          <view class="rec-info">
            <text class="rec-item-title">{{ item.title }}</text>
            <view class="rec-meta">
              <text class="rec-badge" :class="item.type === 2 ? 'rumor' : 'dry'">
                {{ item.type === 2 ? '辟谣' : '干货' }}
              </text>
              <text class="rec-views">👁️ {{ item.viewCount || 0 }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getArticleDetailApi, getRecommendArticlesApi, likeArticleApi } from '../../api/article.js'

export default {
  data() {
    return {
      articleId: null,
      article: null,
      recommendList: [],
      isLiked: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.articleId = options.id
      this.loadDetail()
      this.loadRecommends()
    }
  },
  methods: {
    async loadDetail() {
      const res = await getArticleDetailApi(this.articleId)
      if (res && res.data) {
        this.article = res.data
      }
    },
    async loadRecommends() {
      const res = await getRecommendArticlesApi(this.articleId)
      if (res && res.data) {
        this.recommendList = res.data
      }
    },
    async handleLike() {
      if (this.isLiked) return
      const res = await likeArticleApi(this.articleId)
      if (res && res.data) {
        this.isLiked = true
        this.article.likeCount += 1
        uni.showToast({ title: '点赞成功', icon: 'none' })
      }
    },
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/article/detail?id=${id}`
      })
    },
    formatDate(dateStr) {
      if (!dateStr) return '最新发布'
      return dateStr.substring(0, 10)
    }
  }
}
</script>

<style scoped>
.container {
  padding: 32rpx;
  background-color: #F7F5F0;
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.article-detail-card {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.header-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.type-badge {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

.type-badge.rumor {
  background: #FDE8E8;
  color: #E57373;
}

.type-badge.dry {
  background: #E8F5E9;
  color: #4CAF50;
}

.type-badge.video {
  background: #E3F2FD;
  color: #1E88E5;
}

.cat-label {
  font-size: 24rpx;
  color: #7A8B82;
}

.article-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #2C3531;
  margin-top: 20rpx;
  line-height: 1.4;
  display: block;
}

.meta-row {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;
  margin-bottom: 28rpx;
}

.meta-text {
  font-size: 22rpx;
  color: #999;
}

.media-container {
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 28rpx;
  background: #000;
}

.video-player {
  width: 100%;
  height: 400rpx;
  display: block;
}

.image-container {
  width: 100%;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 28rpx;
}

.detail-cover-img {
  width: 100%;
  height: 380rpx;
  display: block;
}

.rumor-full-box {
  background: #FFF8F8;
  border: 1px solid #FFCDD2;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 32rpx;
}

.rumor-section {
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px dashed #FFCDD2;
}

.rumor-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #D32F2F;
  margin-bottom: 8rpx;
}

.rumor-content {
  font-size: 26rpx;
  color: #555;
  line-height: 1.6;
  display: block;
}

.truth-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #2E6D56;
  margin-bottom: 8rpx;
}

.truth-content {
  font-size: 26rpx;
  color: #2E6D56;
  line-height: 1.6;
  display: block;
}

.article-body {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
}

.body-text {
  white-space: pre-line;
}

.disclaimer-bar {
  margin-top: 36rpx;
  padding: 16rpx;
  background: #F9F9F9;
  border-radius: 12rpx;
}

.disclaimer-text {
  font-size: 20rpx;
  color: #AAA;
  line-height: 1.5;
  display: block;
}

.action-bar {
  margin-top: 40rpx;
  display: flex;
  justify-content: center;
}

.like-btn {
  background: #EBF3EF;
  color: #2E6D56;
  border: 1px solid #2E6D56;
  border-radius: 40rpx;
  font-size: 28rpx;
  padding: 0 54rpx;
  height: 80rpx;
  line-height: 80rpx;
}

.like-btn.liked {
  background: #2E6D56;
  color: #FFFFFF;
}

/* 推荐区域 */
.recommend-section {
  margin-top: 40rpx;
}

.rec-header {
  margin-bottom: 20rpx;
}

.rec-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2C3531;
}

.rec-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.rec-item-card {
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  align-items: center;
}

.rec-cover {
  width: 140rpx;
  height: 110rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.rec-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.rec-item-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.rec-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.rec-badge {
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 6rpx;
  font-weight: bold;
}

.rec-badge.rumor {
  background: #FDE8E8;
  color: #E57373;
}

.rec-badge.dry {
  background: #E8F5E9;
  color: #4CAF50;
}

.rec-views {
  font-size: 20rpx;
  color: #999;
}
</style>
