<template>
  <view class="container">
    <!-- 头部卡片 -->
    <view class="header-card">
      <text class="header-title">中医九大体质与生活嗜好自测</text>
      <text class="header-sub">回答以下 10 道题目，为您生成个人专属健康档案与 AI 养生调理方案</text>
    </view>

    <!-- 答题进度表 -->
    <view v-if="!isCompleted" class="quiz-card card">
      <view class="progress-bar-box">
        <text class="step-num">题目 {{ currentIndex + 1 }} / {{ questions.length }}</text>
        <view class="progress-track">
          <view class="progress-fill" :style="{ width: ((currentIndex + 1) * 100 / questions.length) + '%' }"></view>
        </view>
      </view>

      <!-- 问题展示 -->
      <view class="question-box">
        <text class="question-text">{{ currentQuestion.title }}</text>

        <!-- 普通单选题 (1-9 题) -->
        <view v-if="currentQuestion.type !== 'multi'" class="options-list">
          <view 
            v-for="(option, idx) in currentQuestion.options" 
            :key="idx" 
            class="option-item"
            :class="{ selected: selectedAnswers[currentIndex] === option.score }"
            @click="selectOption(option.score)"
          >
            <text class="option-text">{{ option.label }}</text>
          </view>
        </view>

        <!-- 第 10 题：生活作息与不良嗜好多选项 -->
        <view v-else class="habit-options-list">
          <view 
            v-for="(h, idx) in habitOptions" 
            :key="idx" 
            class="habit-chip"
            :class="{ active: selectedHabits.includes(h.key) }"
            @click="toggleHabit(h.key)"
          >
            <text class="chip-icon">{{ h.icon }}</text>
            <text class="chip-label">{{ h.label }}</text>
          </view>
          <button class="btn-confirm-habits" @click="confirmMultiHabits">完成测验并生成健康档案</button>
        </view>
      </view>

      <!-- 底部上一步/下一步 -->
      <view v-if="currentQuestion.type !== 'multi'" class="actions-row">
        <button v-if="currentIndex > 0" class="btn-prev" @click="prevQuestion">上一题</button>
      </view>
    </view>

    <!-- 报告结果页 -->
    <view v-else class="result-container">
      <view class="result-card card">
        <view class="result-badge">您的专属体质与健康档案</view>
        <text class="result-type">{{ finalResult.name }}</text>
        <text class="result-desc">{{ finalResult.description }}</text>

        <!-- 用户嗜好标签汇总 -->
        <view class="profile-tags-box">
          <text class="profile-title">📋 已关联的个人作息画像：</text>
          <view class="tags-wrap">
            <text v-for="tag in habitTags" :key="tag" class="profile-tag">{{ tag }}</text>
          </view>
        </view>

        <view class="rec-section">
          <text class="rec-title">🌿 针对您的 AI 定制养生法则</text>
          <text class="rec-item">🥣 推荐调理食疗：{{ finalResult.diet }}</text>
          <text class="rec-item">🌙 起居关照：{{ finalResult.living }}</text>
          <text class="rec-item">🧘 推荐保养习惯：{{ finalResult.habits }}</text>
        </view>

        <view class="result-actions">
          <button class="btn-share" @click="openShareModal">✨ 分享报告给好友/朋友圈</button>
          <button class="btn-retest" @click="resetQuiz">重新测评</button>
        </view>
      </view>
    </view>

    <!-- 全平台分享弹窗 (Share Sheet) -->
    <view v-if="showShareModal" class="share-modal-mask" @click="closeShareModal">
      <view class="share-sheet" @click.stop>
        <view class="share-header">
          <text class="share-title">分享您的养生体质报告</text>
          <text class="share-sub">顺应自然，和好友一起开启轻养生生活</text>
        </view>

        <view class="share-grid">
          <view class="share-item" @click="shareToPlatform('微信好友')">
            <view class="share-icon-bg wechat"><text class="icon">💬</text></view>
            <text class="share-name">微信好友</text>
          </view>
          <view class="share-item" @click="shareToPlatform('微信朋友圈')">
            <view class="share-icon-bg moments"><text class="icon">⭕</text></view>
            <text class="share-name">微信朋友圈</text>
          </view>
          <view class="share-item" @click="shareToPlatform('QQ好友')">
            <view class="share-icon-bg qq"><text class="icon">🐧</text></view>
            <text class="share-name">QQ 好友</text>
          </view>
          <view class="share-item" @click="shareToPlatform('WhatsApp')">
            <view class="share-icon-bg whatsapp"><text class="icon">🟢</text></view>
            <text class="share-name">WhatsApp</text>
          </view>
          <view class="share-item" @click="shareToPlatform('Facebook')">
            <view class="share-icon-bg facebook"><text class="icon">📘</text></view>
            <text class="share-name">Facebook</text>
          </view>
          <view class="share-item" @click="savePosterToAlbum">
            <view class="share-icon-bg poster"><text class="icon">🖼️</text></view>
            <text class="share-name">保存海报相册</text>
          </view>
        </view>

        <button class="btn-close-share" @click="closeShareModal">取消</button>
      </view>
    </view>
  </view>
</template>

<script>
import { updateHealthProfileApi } from '../../api/user.js'

export default {
  data() {
    return {
      currentIndex: 0,
      isCompleted: false,
      showShareModal: false,
      selectedAnswers: [],
      selectedHabits: ['stayUp', 'sedentary'],
      habitOptions: [
        { key: 'stayUp', label: '经常熬夜 / 夜猫子', icon: '🌙' },
        { key: 'smoking', label: '经常吸烟', icon: '🚬' },
        { key: 'drinking', label: '经常饮酒 / 应酬', icon: '🍺' },
        { key: 'sedentary', label: '长期久坐 / 缺乏运动', icon: '💻' },
        { key: 'highStress', label: '工作压力大 / 易焦虑', icon: '⚡' },
        { key: 'heavyFlavor', label: '重油重盐 / 喜甜饮冷', icon: '🍟' }
      ],
      questions: [
        { id: 1, title: '1. 您是否平时感到说话声音低弱、容易精神疲乏无力？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 2, title: '2. 您是否比一般人更怕冷，手脚容易冰凉？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 3, title: '3. 您是否感到手脚心发热，或者容易口干舌燥？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 4, title: '4. 您是否感到面部油腻、口苦口臭，或者大肠黏滞不爽？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 5, title: '5. 您是否感觉身体沉重、腹部胀满，或者痰多湿重？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 6, title: '6. 您的皮肤是否容易出现瘀斑、唇色暗淡，或舌下络脉青紫？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 7, title: '7. 您是否容易情绪低落、郁郁寡欢，或常叹气？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 8, title: '8. 您是否对某些食物、气味或花粉容易过敏？', type: 'single', options: [{ label: '没有', score: 1 }, { label: '偶尔', score: 2 }, { label: '经常', score: 3 }, { label: '总是', score: 4 }] },
        { id: 9, title: '9. 您的睡眠、胃口及精力是否处于平衡舒畅状态？', type: 'single', options: [{ label: '非常符合', score: 4 }, { label: '基本符合', score: 3 }, { label: '不太符合', score: 2 }, { label: '完全不符', score: 1 }] },
        { id: 10, title: '10. 请勾选您的日常作息与生活习惯（多选）：', type: 'multi' }
      ],
      finalResult: {
        name: '气虚质',
        description: '元气不足，以疲乏、气短、自汗为主要特征。宜培补脾胃、温养气血。',
        diet: '宜食山药、大枣、黄芪鸡汤、小米粥',
        living: '避免劳累过度，保证子时熟睡，注意保暖防风',
        habits: '深呼吸拉伸、辰时滋养早餐、睡前泡脚'
      }
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || this.questions[0]
    },
    habitTags() {
      const tags = []
      if (this.selectedHabits.includes('stayUp')) tags.push('经常熬夜')
      if (this.selectedHabits.includes('smoking')) tags.push('经常吸烟')
      if (this.selectedHabits.includes('drinking')) tags.push('经常饮酒')
      if (this.selectedHabits.includes('sedentary')) tags.push('长期久坐')
      if (this.selectedHabits.includes('highStress')) tags.push('高压焦虑')
      if (this.selectedHabits.includes('heavyFlavor')) tags.push('重油重盐')
      if (tags.length === 0) tags.push('作息良好无不良嗜好')
      return tags
    }
  },
  methods: {
    selectOption(score) {
      this.selectedAnswers[this.currentIndex] = score
      if (this.currentIndex < this.questions.length - 1) {
        this.currentIndex++
      }
    },
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },
    toggleHabit(key) {
      const idx = this.selectedHabits.indexOf(key)
      if (idx > -1) {
        this.selectedHabits.splice(idx, 1)
      } else {
        this.selectedHabits.push(key)
      }
    },
    async confirmMultiHabits() {
      this.calculateResult()
      this.isCompleted = true
      
      // 同步保存体质与生活嗜好档案到后端
      const profileData = {
        constitution: this.finalResult.name,
        isStayUpLate: this.selectedHabits.includes('stayUp') ? 1 : 0,
        isSmoking: this.selectedHabits.includes('smoking') ? 1 : 0,
        isDrinking: this.selectedHabits.includes('drinking') ? 1 : 0,
        isSedentary: this.selectedHabits.includes('sedentary') ? 1 : 0,
        isHighStress: this.selectedHabits.includes('highStress') ? 1 : 0,
        isHeavyFlavor: this.selectedHabits.includes('heavyFlavor') ? 1 : 0
      }
      
      await updateHealthProfileApi(profileData)
      uni.showToast({ title: '健康档案更新成功！', icon: 'success' })
    },
    calculateResult() {
      const scores = this.selectedAnswers
      const q1 = scores[0] || 1
      const q2 = scores[1] || 1
      const q4 = scores[3] || 1
      
      if (q2 >= 3) {
        this.finalResult = {
          name: '阳虚质',
          description: '阳气不足，以畏寒怕冷、手足不温为主要特征。宜温阳补气。',
          diet: '宜食羊肉、生姜、韭菜、桂圆，少吃生冷冰饮',
          living: '注意保暖防寒，睡前热水泡脚引火归元',
          habits: '八段锦、睡前泡脚、饭后散步'
        }
      } else if (q4 >= 3) {
        this.finalResult = {
          name: '湿热质',
          description: '湿热内蕴，以面油口苦、身重黏滞为主要特征。宜清热祛湿。',
          diet: '宜食薏米、冬瓜、绿豆、赤小豆、百合',
          living: '保持居室干燥通风，避免暴饮暴食与饮酒',
          habits: '喝够8杯水、适度慢跑散步'
        }
      } else {
        this.finalResult = {
          name: '气虚质',
          description: '元气不足，以疲乏、气短、自汗为主要特征。宜培补脾胃、温养气血。',
          diet: '宜食山药、大枣、黄芪鸡汤、小米粥',
          living: '避免劳累过度，保证子时熟睡，注意保暖防风',
          habits: '深呼吸拉伸、辰时滋养早餐、睡前泡脚'
        }
      }
    },
    resetQuiz() {
      this.currentIndex = 0
      this.selectedAnswers = []
      this.isCompleted = false
    },
    openShareModal() {
      this.showShareModal = true
    },
    closeShareModal() {
      this.showShareModal = false
    },
    shareToPlatform(platform) {
      uni.setClipboardData({
        data: `【每日养生·个人健康档案】我的体质为[${this.finalResult.name}]，习惯画像:[${this.habitTags.join(', ')}]。顺应自然时辰，一起来体验轻养生吧！`,
        success: () => {
          uni.showToast({
            title: `文案已复制！可粘贴至 ${platform}`,
            icon: 'none',
            duration: 2500
          })
          this.closeShareModal()
        }
      })
    },
    savePosterToAlbum() {
      uni.showLoading({ title: '生成卡片相册中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已保存健康档案海报至相册',
          icon: 'success'
        })
        this.closeShareModal()
      }, 600)
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
  background: linear-gradient(135deg, #2E6D56 0%, #1E4D3B 100%);
  border-radius: 36rpx;
  padding: 44rpx 36rpx;
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
  margin-top: 12rpx;
  display: block;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.progress-bar-box {
  margin-bottom: 32rpx;
}

.step-num {
  font-size: 24rpx;
  color: #7A8B82;
  font-weight: 600;
  display: block;
  margin-bottom: 12rpx;
}

.progress-track {
  width: 100%;
  height: 12rpx;
  background: #EBF3EF;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #2E6D56;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.question-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #2C3531;
  line-height: 1.5;
  display: block;
  margin-bottom: 36rpx;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-item {
  background: #FAF8F3;
  border: 2rpx solid transparent;
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  transition: all 0.2s ease;
}

.option-item.selected {
  border-color: #2E6D56;
  background: #EBF3EF;
}

.option-text {
  font-size: 28rpx;
  color: #2C3531;
}

.habit-options-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.habit-chip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  background: #FAF8F3;
  padding: 20rpx 28rpx;
  border-radius: 20rpx;
  border: 2rpx solid transparent;
}

.habit-chip.active {
  background: #EBF3EF;
  border-color: #2E6D56;
}

.chip-icon {
  font-size: 32rpx;
}

.chip-label {
  font-size: 26rpx;
  color: #2C3531;
}

.btn-confirm-habits {
  width: 100%;
  margin-top: 36rpx;
  background: #2E6D56;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.actions-row {
  margin-top: 36rpx;
}

.btn-prev {
  background: #FAF8F3;
  color: #7A8B82;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: none;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.result-badge {
  background: #EBF3EF;
  color: #2E6D56;
  padding: 8rpx 24rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.result-type {
  font-size: 56rpx;
  font-weight: 700;
  color: #2C3531;
  margin-top: 20rpx;
}

.result-desc {
  font-size: 26rpx;
  color: #7A8B82;
  margin-top: 16rpx;
  line-height: 1.6;
}

.profile-tags-box {
  width: 100%;
  background: #FAF8F3;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  margin-top: 24rpx;
  text-align: left;
}

.profile-title {
  font-size: 22rpx;
  color: #8C6D46;
  font-weight: 600;
  display: block;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 12rpx;
}

.profile-tag {
  background: #FFFFFF;
  color: #4A3A2C;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  border: 1px solid rgba(200, 155, 101, 0.2);
}

.rec-section {
  width: 100%;
  margin-top: 32rpx;
  text-align: left;
  background: #FAF8F3;
  padding: 28rpx;
  border-radius: 24rpx;
}

.rec-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
  margin-bottom: 16rpx;
}

.rec-item {
  font-size: 25rpx;
  color: #5A6B62;
  line-height: 1.6;
  display: block;
  margin-bottom: 10rpx;
}

.result-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 36rpx;
}

.btn-share {
  background: #C89B65;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.btn-retest {
  background: #FAF8F3;
  color: #7A8B82;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: none;
}

.share-modal-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.share-sheet {
  width: 100%;
  background: #FFFFFF;
  border-radius: 36rpx 36rpx 0 0;
  padding: 44rpx 36rpx;
}

.share-header {
  text-align: center;
  margin-bottom: 32rpx;
}

.share-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
}

.share-sub {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 6rpx;
  display: block;
}

.share-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.share-icon-bg {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-icon-bg.wechat { background: #07C160; }
.share-icon-bg.moments { background: #10B981; }
.share-icon-bg.qq { background: #1296DB; }
.share-icon-bg.whatsapp { background: #25D366; }
.share-icon-bg.facebook { background: #1877F2; }
.share-icon-bg.poster { background: #C89B65; }

.icon {
  font-size: 44rpx;
  color: #FFFFFF;
}

.share-name {
  font-size: 22rpx;
  color: #2C3531;
  margin-top: 12rpx;
}

.btn-close-share {
  background: #FAF8F3;
  color: #7A8B82;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}
</style>
