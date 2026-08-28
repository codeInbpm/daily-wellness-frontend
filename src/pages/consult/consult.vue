<template>
  <view :class="['container', themeClass]">
    <!-- 头部 Banner -->
    <view class="consult-header-card">
      <text class="consult-title">🤖 AI 养生智伴 1V1 咨询</text>
      <text class="consult-sub">基于您的【体质分类 × 作息嗜好 × 子午流注】实时推演生活调理方案</text>
    </view>

    <!-- 1V1 体质复核专属对话入口 -->
    <view class="direct-chat-card card" @click="goToAiChat('')">
      <view class="direct-chat-left">
        <text class="chat-icon">💬</text>
        <view class="direct-text-group">
          <text class="chat-main-title">发起 1V1 AI 智能体质复核</text>
          <text class="chat-sub-title">结合您的健康档案进行 150 字内的针对性调理建议</text>
        </view>
      </view>
      <view class="btn-start">立即对话 ›</view>
    </view>

    <!-- 热门咨询方向与专题指南 -->
    <view class="section-title-box">
      <text class="section-title">💡 热门体质与生活方式咨询专题</text>
    </view>

    <view class="topics-list">
      <view v-for="topic in topics" :key="topic.id" class="topic-card card" @click="goToAiChat(topic.prompt)">
        <view class="topic-header">
          <text class="topic-title">{{ topic.title }}</text>
          <text class="topic-tag">{{ topic.tag }}</text>
        </view>
        <text class="topic-desc">{{ topic.desc }}</text>
        <view class="topic-action-row">
          <text class="prompt-hint">一键问AI: "{{ topic.prompt }}"</text>
          <text class="action-btn">咨询智伴 ›</text>
        </view>
      </view>
    </view>

    <!-- 免责温馨提示 -->
    <view class="disclaimer-box">
      <text class="disclaimer-text">💡 提示：本系统 AI 建议仅供日常轻养生与生活习惯参考，非医疗诊疗行为。如有器质性身体不适请前往正规医疗机构。</text>
    </view>
  </view>
</template>

<script>
import { getConsultTopicsApi } from '../../api/consult.js'
import { setupThemeListener, getThemeClass } from '../../utils/theme.js'

export default {
  data() {
    return {
      topics: [],
      themeClass: getThemeClass()
    }
  },
  mounted() {
    setupThemeListener(this)
  },
  onShow() {
    this.loadTopics()
  },
  methods: {
    async loadTopics() {
      const res = await getConsultTopicsApi()
      if (res && res.data) {
        this.topics = res.data
      }
    },
    goToAiChat(prompt) {
      uni.navigateTo({
        url: `/pages/ai-chat/ai-chat?query=${encodeURIComponent(prompt || '')}`
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

.consult-header-card {
  background: var(--color-banner-gradient);
  border-radius: 36rpx;
  padding: 40rpx 36rpx;
  color: #FFFFFF;
  margin-bottom: 24rpx;
}

.consult-title {
  font-size: 40rpx;
  font-weight: bold;
  display: block;
}

.consult-sub {
  font-size: 24rpx;
  opacity: 0.85;
  margin-top: 10rpx;
  display: block;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
  margin-bottom: 24rpx;
}

.direct-chat-card {
  background: linear-gradient(135deg, #EBF3EF 0%, #FFFFFF 100%);
  border: 1px solid rgba(46, 109, 86, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.direct-chat-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.chat-icon {
  font-size: 48rpx;
}

.direct-text-group {
  display: flex;
  flex-direction: column;
}

.chat-main-title {
  font-size: 30rpx;
  font-weight: bold;
  color: var(--color-primary);
}

.chat-sub-title {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 4rpx;
}

.btn-start {
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 600;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
}

.section-title-box {
  margin-top: 12rpx;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C3531;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #2C3531;
}

.topic-tag {
  background: #FAF4EB;
  color: #8C6D46;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

.topic-desc {
  font-size: 24rpx;
  color: #7A8B82;
  line-height: 1.5;
  margin-top: 12rpx;
  display: block;
}

.topic-action-row {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px dashed rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prompt-hint {
  font-size: 22rpx;
  color: var(--color-primary);
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 16rpx;
}

.action-btn {
  font-size: 24rpx;
  color: var(--color-primary);
  font-weight: bold;
}

.disclaimer-box {
  padding: 24rpx;
  text-align: center;
}

.disclaimer-text {
  font-size: 22rpx;
  color: #A3B1A9;
  line-height: 1.4;
}
</style>
