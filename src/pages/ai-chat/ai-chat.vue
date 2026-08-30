<template>
  <view class="container">
    <!-- 头部 AI 智伴名片 -->
    <view class="ai-header-card">
      <view class="header-left">
        <view class="avatar-box">
          <text class="avatar-icon">🤖</text>
        </view>
        <view class="header-info">
          <text class="ai-name">每日养生 AI 智伴</text>
          <text class="ai-status">🟢 结合体质与时辰多轮调理</text>
        </view>
      </view>
      <view class="history-btn" @click="openHistoryDrawer">
        <text class="btn-icon">📜</text>
        <text class="btn-text">历史咨询</text>
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

      <!-- AI 思考中/打字中指示 -->
      <view v-if="loading" class="message-item assistant">
        <view class="msg-avatar"><text>🤖</text></view>
        <view class="msg-bubble loading-bubble">
          <text class="loading-dots">AI 智伴推演中...</text>
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
        placeholder="咨询 AI 智伴（如：湿热体质怎么吃？）"
        confirm-type="send"
        @confirm="sendMessage"
      />
      <button class="btn-send" @click="sendMessage">发送</button>
    </view>

    <!-- 历史咨询记录抽屉弹窗 -->
    <view v-if="showHistoryModal" class="history-modal-mask" @click="closeHistoryDrawer">
      <view class="history-modal-card" @click.stop>
        <view class="history-header">
          <text class="history-title">📜 历史养生咨询归档</text>
          <text class="history-close" @click="closeHistoryDrawer">✕</text>
        </view>
        <scroll-view class="history-scroll" scroll-y>
          <view v-if="historyList.length === 0" class="empty-history">
            <text>暂无历史咨询记录</text>
          </view>
          <view 
            v-for="item in historyList" 
            :key="item.id" 
            class="history-item"
            @click="loadHistoryDetail(item)"
          >
            <view class="item-top">
              <text class="item-topic">❓ {{ item.topic }}</text>
              <text class="item-delete" @click.stop="deleteHistory(item.id)">🗑️</text>
            </view>
            <text class="item-reply">💡 {{ item.aiReply }}</text>
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
import { askAiConsultApi, getConsultHistoryApi, deleteConsultHistoryApi } from '../../api/consult.js'
import { getUserInfo } from '../../utils/auth.js'

export default {
  data() {
    return {
      inputMsg: '',
      loading: false,
      scrollTop: 9999,
      showHistoryModal: false,
      historyList: [],
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
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1

      const res = await askAiConsultApi(userText, userId)
      this.loading = false

      if (res && res.code === 200 && res.data) {
        const fullAnswer = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        
        // 模拟打字机流式渐进呈现
        const assistantMsg = { role: 'assistant', content: '' }
        this.messageList.push(assistantMsg)
        
        let charIndex = 0
        const timer = setInterval(() => {
          if (charIndex < fullAnswer.length) {
            assistantMsg.content += fullAnswer.charAt(charIndex)
            charIndex++
            this.scrollToBottom()
          } else {
            clearInterval(timer)
          }
        }, 30)
      } else {
        this.messageList.push({
          role: 'assistant',
          content: '【养生AI智伴】：顺应自然时辰是养生的智慧。当前时刻宜放慢呼吸，小口补充温水，让身心回到当下平衡状态。'
        })
      }
      this.scrollToBottom()
    },
    async openHistoryDrawer() {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      uni.showLoading({ title: '加载历史记录...' })
      const res = await getConsultHistoryApi(userId, 1, 20)
      uni.hideLoading()
      if (res && res.data && res.data.records) {
        this.historyList = res.data.records
      }
      this.showHistoryModal = true
    },
    closeHistoryDrawer() {
      this.showHistoryModal = false
    },
    loadHistoryDetail(item) {
      this.messageList.push({ role: 'user', content: item.topic })
      this.messageList.push({ role: 'assistant', content: item.aiReply })
      this.closeHistoryDrawer()
      this.scrollToBottom()
    },
    async deleteHistory(id) {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      const res = await deleteConsultHistoryApi(id, userId)
      if (res && res.code === 200) {
        this.historyList = this.historyList.filter(h => h.id !== id)
        uni.showToast({ title: '记录已删除', icon: 'success' })
      }
    },
    formatTime(timeStr) {
      if (!timeStr) return ''
      return timeStr.replace('T', ' ').substring(0, 16)
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
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #1E4D3B 0%, #2E6D56 100%);
  padding: 32rpx 36rpx;
  color: #FFFFFF;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
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

.history-btn {
  background: rgba(255,255,255,0.18);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
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

/* 历史咨询弹窗 */
.history-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.history-modal-card {
  width: 100%;
  max-height: 70vh;
  background: #FFFFFF;
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
  padding: 36rpx;
  box-sizing: border-box;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.history-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2C3531;
}

.history-close {
  font-size: 32rpx;
  color: #999999;
  padding: 8rpx;
}

.history-scroll {
  max-height: 55vh;
}

.empty-history {
  text-align: center;
  padding: 60rpx 0;
  color: #999999;
  font-size: 26rpx;
}

.history-item {
  background: #FAF8F3;
  padding: 24rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-topic {
  font-size: 28rpx;
  font-weight: bold;
  color: #2E6D56;
}

.item-delete {
  font-size: 28rpx;
}

.item-reply {
  font-size: 26rpx;
  color: #555555;
  margin-top: 12rpx;
  display: block;
  line-height: 1.5;
}

.item-time {
  font-size: 20rpx;
  color: #AAAAAA;
  margin-top: 12rpx;
  display: block;
  text-align: right;
}
</style>
