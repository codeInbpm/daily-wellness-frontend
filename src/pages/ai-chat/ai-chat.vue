<template>
  <view class="container">
    <!-- 头部 AI 智伴名片 -->
    <view class="ai-header-card">
      <view class="avatar-box">
        <text class="avatar-icon">🤖</text>
      </view>
      <view class="header-info">
        <text class="ai-name">每日养生 AI 智伴</text>
        <text class="ai-status">🟢 结合您的体质与当下时辰在线调理</text>
      </view>
    </view>

    <!-- 对话消息列表 -->
    <scroll-view class="chat-list" scroll-y :scroll-top="scrollTop">
      <view v-for="(msg, idx) in messageList" :key="idx" class="message-item" :class="msg.role">
        <view class="msg-avatar">
          <text>{{ msg.role === 'assistant' ? '🤖' : '👤' }}</text>
        </view>
        <view class="msg-bubble">
          <text class="msg-text">{{ msg.content }}</text>
        </view>
      </view>

      <!-- AI 思考中指示 -->
      <view v-if="loading" class="message-item assistant">
        <view class="msg-avatar"><text>🤖</text></view>
        <view class="msg-bubble loading-bubble">
          <text class="loading-dots">AI 智伴思考中...</text>
        </view>
      </view>
    </scroll-view>

    <!-- 快捷提示词 Chip 滚动条 -->
    <scroll-view class="chips-scroll" scroll-x>
      <view 
        v-for="(chip, idx) in quickChips" 
        :key="idx" 
        class="quick-chip"
        @click="sendQuickMsg(chip)"
      >
        <text>{{ chip }}</text>
      </view>
    </scroll-view>

    <!-- 底部输入框与发送按钮 -->
    <view class="input-bar">
      <input 
        v-model="inputMsg" 
        class="chat-input" 
        placeholder="咨询 AI 智伴（如：熬夜后怎么调理？）"
        confirm-type="send"
        @confirm="sendMessage"
      />
      <button class="btn-send" @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script>
import { chatWithAiApi } from '../../api/ai.js'

export default {
  data() {
    return {
      inputMsg: '',
      loading: false,
      scrollTop: 9999,
      sessionId: 'session_' + Date.now(),
      quickChips: [
        '🌱 湿热体质平时吃什么？',
        '🌙 经常熬夜怎么护肝补水？',
        '🍵 午时心经当令怎么保养？',
        '🧘 顺应时辰推荐一个习惯'
      ],
      messageList: [
        {
          role: 'assistant',
          content: '您好！我是您的【每日养生 AI 智伴】。已关联您的体质档案与当前时辰循行。请问今天有什么想调理或关照的养生困惑？'
        }
      ]
    }
  },
  methods: {
    sendQuickMsg(text) {
      this.inputMsg = text
      this.sendMessage()
    },
    async sendMessage() {
      if (!this.inputMsg.trim() || this.loading) return
      
      const userText = this.inputMsg.trim()
      this.messageList.push({
        role: 'user',
        content: userText
      })
      this.inputMsg = ''
      this.scrollToBottom()

      this.loading = true
      const res = await chatWithAiApi(userText, this.sessionId)
      this.loading = false

      if (res && res.data) {
        this.messageList.push({
          role: 'assistant',
          content: typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        })
      } else {
        this.messageList.push({
          role: 'assistant',
          content: '【养生AI智伴】：顺应自然时辰是养生的智慧，现在正是照顾身体的好时机。请放慢呼吸，补充一杯温水。'
        })
      }
      this.scrollToBottom()
    },
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.scrollTop + 500
      })
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #F7F5F0;
}

.ai-header-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: linear-gradient(135deg, #1E4D3B 0%, #2E6D56 100%);
  padding: 32rpx 36rpx;
  color: #FFFFFF;
}

.avatar-box {
  width: 76rpx;
  height: 76rpx;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-icon {
  font-size: 40rpx;
}

.ai-name {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
}

.ai-status {
  font-size: 22rpx;
  opacity: 0.85;
  margin-top: 4rpx;
  display: block;
}

.chat-list {
  flex: 1;
  padding: 32rpx;
  box-sizing: border-box;
}

.message-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.message-item.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #EBF3EF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.msg-bubble {
  max-width: 70%;
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  background: #FFFFFF;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.04);
}

.message-item.user .msg-bubble {
  background: #2E6D56;
  color: #FFFFFF;
}

.msg-text {
  font-size: 28rpx;
  line-height: 1.6;
}

.loading-dots {
  font-size: 24rpx;
  color: #7A8B82;
}

.chips-scroll {
  white-space: nowrap;
  padding: 12rpx 24rpx;
  background: #FAF8F3;
}

.quick-chip {
  display: inline-block;
  background: #FFFFFF;
  border: 1px solid rgba(46, 109, 86, 0.2);
  color: #2E6D56;
  font-size: 24rpx;
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  margin-right: 16rpx;
}

.input-bar {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 24rpx 36rpx 24rpx;
  background: #FFFFFF;
  border-top: 1px solid rgba(0,0,0,0.06);
}

.chat-input {
  flex: 1;
  height: 76rpx;
  background: #FAF8F3;
  border-radius: 38rpx;
  padding: 0 32rpx;
  font-size: 26rpx;
}

.btn-send {
  background: #2E6D56;
  color: #FFFFFF;
  border-radius: 38rpx;
  font-size: 26rpx;
  font-weight: 600;
  padding: 0 32rpx;
  line-height: 76rpx;
  border: none;
}
</style>
