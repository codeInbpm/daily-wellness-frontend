<template>
  <view :class="['container', themeClass]">
    <!-- 顶层主功能 3 分栏 Tabs (节气与流注 | 养生辟谣干货 | 药膳百科) -->
    <view class="top-nav-tabs">
      <view class="tab-item" :class="{ active: currentTab === 0 }" @click="currentTab = 0">
        <text class="tab-title">☯️ 节气流注</text>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 1 }" @click="currentTab = 1">
        <text class="tab-title">💡 干货与辟谣</text>
      </view>
      <view class="tab-item" @click="goToFoodEncyclopedia">
        <text class="tab-title">🍲 药膳百科</text>
      </view>
    </view>

    <!-- 极简养生圈入口 Banner -->
    <view class="community-banner" @click="goToCommunity">
      <view class="banner-left">
        <text class="banner-title">🍃 养生社区 / 打卡圈</text>
        <text class="banner-sub">看看大家今天都坚持了哪些养生习惯与药膳餐</text>
      </view>
      <view class="banner-btn">去逛逛 ❯</view>
    </view>

    <!-- Tab 0: 节气与子午流注 -->
    <view v-if="currentTab === 0">
      <!-- 1. 当前/选中节气大卡片 -->
      <view class="solar-card">
        <view class="solar-badge">节气养生</view>
        <text class="solar-name">{{ solarTerm.name }}</text>
        <text class="solar-date">{{ solarTerm.monthDay }}</text>

        <view class="climates-box">
          <text class="climates-text">{{ solarTerm.threeClimates }}</text>
        </view>

        <view class="advice-grid">
          <view class="advice-item">
            <text class="advice-label">🍵 饮食建议</text>
            <text class="advice-val">{{ solarTerm.dietAdvice }}</text>
          </view>
          <view class="advice-item">
            <text class="advice-label">🌙 起居建议</text>
            <text class="advice-val">{{ solarTerm.livingAdvice }}</text>
          </view>
          <view class="advice-item">
            <text class="advice-label">🏃 运动建议</text>
            <text class="advice-val">{{ solarTerm.exerciseAdvice }}</text>
          </view>
        </view>
      </view>

      <!-- 2. 二十四节气图谱横向滑动 -->
      <view class="section-title-bar">
        <text class="sec-title">二十四节气图谱 (点击可切换)</text>
      </view>

      <scroll-view class="solar-scroll" scroll-x>
        <view 
          v-for="term in solarTerms" 
          :key="term.id" 
          class="solar-chip card"
          :class="{ active: term.name === solarTerm.name }"
          @click="selectSolarTerm(term)"
        >
          <text class="chip-name">{{ term.name }}</text>
          <text class="chip-date">{{ term.monthDay }}</text>
        </view>
      </scroll-view>

      <!-- 3. 十二时辰子午流注 AI 智能养生卡片 -->
      <view class="card organ-clock-section">
        <view class="clock-sec-header">
          <view class="title-row">
            <text class="sec-title">☯️ 子午流注 · 当时养生解说</text>
            <text class="now-badge">实时已高亮当下时辰</text>
          </view>
          <text class="sec-sub-text">基于您的体质与生活嗜好，AI 智能匹配的养生指导</text>
        </view>

        <scroll-view class="clock-scroll" scroll-x :scroll-left="scrollLeftOffset">
          <view 
            v-for="c in clockList" 
            :key="c.name" 
            class="clock-chip"
            :class="{ active: activeClock.name === c.name }"
            @click="selectClock(c)"
          >
            <text class="chip-clock-name">{{ c.name }}</text>
            <text class="chip-clock-organ">{{ c.organ }}</text>
          </view>
        </scroll-view>

        <view class="clock-detail-box">
          <view class="detail-top">
            <text class="detail-name">{{ activeClock.name }} · {{ activeClock.organ }}</text>
            <text class="detail-time">对应时间：{{ activeClock.timeRange }}</text>
          </view>
          
          <view class="ai-advice-wrapper">
            <view class="ai-title-bar">
              <text class="ai-tag">✨ AI 专属保养推演：</text>
              <view class="ai-chat-btn" @click="goToAiChat">🤖 问 AI 智伴</view>
            </view>
            <text class="detail-advice">{{ activeClock.advice }}</text>
          </view>

          <view class="detail-rec">
            <text class="rec-tag">💡 推荐此时辰行动：{{ activeClock.recommendHabit }}</text>
          </view>
        </view>
      </view>

      <!-- 4. 每日养生科普美文卡片 -->
      <view class="card article-card">
        <view class="article-tag">
          <text>每日一言</text>
          <text class="read-time">{{ knowledge.readTimeMinutes || 1 }} 分钟小读</text>
        </view>
        <text class="article-title">{{ knowledge.title }}</text>
        <view class="quote-box">
          <text class="quote-text">“{{ knowledge.quote }}”</text>
        </view>
        <text class="article-body">{{ knowledge.content }}</text>

        <view class="article-footer">
          <text class="disclaimer">* 本小贴士仅供生活养生参考，不构成医疗诊断或治疗建议。</text>
        </view>
      </view>
    </view>

    <!-- Tab 1: 养生干货与辟谣列表 -->
    <view v-if="currentTab === 1">
      <!-- 媒体形式筛选 Tabs (全部形式 | 🖼️ 短图文 | 🎬 小视频) -->
      <view class="media-type-segment">
        <view class="segment-item" :class="{ active: activeMediaType === '' }" @click="changeMediaType('')">
          <text>全部形式</text>
        </view>
        <view class="segment-item" :class="{ active: activeMediaType === '1' }" @click="changeMediaType('1')">
          <text>🖼️ 短图文</text>
        </view>
        <view class="segment-item" :class="{ active: activeMediaType === '2' }" @click="changeMediaType('2')">
          <text>🎬 小视频</text>
        </view>
      </view>

      <!-- 细分主题分类 -->
      <scroll-view class="category-scroll" scroll-x>
        <view 
          v-for="cat in articleCategories" 
          :key="cat" 
          class="cat-chip"
          :class="{ active: activeCategory === cat }"
          @click="changeCategory(cat)"
        >
          <text>{{ cat }}</text>
        </view>
      </scroll-view>

      <!-- 文章列表 -->
      <view class="article-list">
        <view 
          v-for="item in articleList" 
          :key="item.id" 
          class="card article-item-card"
          @click="goToArticleDetail(item)"
        >
          <!-- 封面图与小视频播放角标 -->
          <view class="cover-wrapper" v-if="item.coverUrl">
            <image class="cover-img" :src="item.coverUrl" mode="aspectFill"></image>
            <view class="play-badge" v-if="item.mediaType === 2">
              <text class="play-icon">▶</text>
              <text class="play-text">视频科普</text>
            </view>
          </view>

          <!-- 辟谣标牌 vs 干货标牌 -->
          <view class="article-header">
            <text class="type-badge" :class="item.type === 2 ? 'rumor' : (item.mediaType === 2 ? 'video' : 'dry')">
              {{ item.type === 2 ? '🚫 养生辟谣' : (item.mediaType === 2 ? '🎬 养生视频' : '💡 养生干货') }}
            </text>
            <text class="vip-tag" v-if="item.isVipOnly">👑 VIP专享</text>
            <text class="cat-label">{{ item.categoryName }}</text>
          </view>

          <text class="art-item-title">{{ item.title }}</text>
          <text class="art-item-summary" v-if="item.summary && item.type !== 2">{{ item.summary }}</text>

          <!-- 辟谣对比特色简框 -->
          <view class="rumor-box" v-if="item.type === 2">
            <view class="rumor-row">
              <text class="rumor-tag-red">❌ 误区陷阱：</text>
              <text class="rumor-text-red">{{ item.summary }}</text>
            </view>
            <view class="rumor-row truth" v-if="item.rumorTruth">
              <text class="rumor-tag-green">✅ 医师真解：</text>
              <text class="rumor-text-green">{{ item.rumorTruth }}</text>
            </view>
          </view>

          <view class="art-item-footer">
            <text class="foot-info">👁️ {{ item.viewCount || 0 }}  👍 {{ item.likeCount || 0 }}</text>
            <text class="read-more-btn">{{ item.mediaType === 2 ? '观看视频 ❯' : '阅读全文 ❯' }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-box" v-if="articleList.length === 0">
        <text class="empty-text">暂无相关科普与辟谣内容~</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getTodayQuoteApi, getCurrentSolarTermApi, getCurrentOrganClockApi } from '../../api/content.js'
import { getArticlesApi } from '../../api/article.js'
import { setupThemeListener, getThemeClass } from '../../utils/theme.js'

export default {
  data() {
    return {
      currentTab: 0, // 0: 节气流注, 1: 干货与辟谣
      scrollLeftOffset: 0,
      activeCategory: '全部',
      activeMediaType: '',
      themeClass: getThemeClass(),
      articleCategories: ['全部', '养生辟谣', '中医科普', '白领亚健康调理', '办公室保健'],
      articleList: [],
      solarTerm: {
        name: '处暑',
        monthDay: '8月22-24日',
        threeClimates: '一候鹰乃祭鸟；二候天地始肃；三候禾乃登',
        dietAdvice: '宜吃百合、银耳、鸭肉，少食辛辣',
        livingAdvice: '早睡早起，午休20分钟补充精力',
        exerciseAdvice: '避免大汗淋漓，推荐太极、散步'
      },
      knowledge: {
        title: '慢下来的呼吸法则',
        quote: '把呼吸放慢，让身体跟上你。',
        content: '在下一个任务开始前，先做三次完整深长地呼吸。没有特别的目标，只是把注意力收回到身心里。吸气时感受腹部轻轻起伏，呼气时释放肩颈累积的紧张感。让忙碌了一整天的气血重新沉降安定下来。',
        readTimeMinutes: 1
      },
      activeClock: {
        name: '未时',
        timeRange: '13:00 - 15:00',
        organ: '小肠经当令',
        advice: '未时小肠分清浊，补充水分。由于您平时常有熬夜习惯，未时小肠吸收养分，宜多饮温开水，促进体内代谢。',
        recommendHabit: '喝够8杯水'
      },
      clockList: [
        { name: '子时', hour: 23, timeRange: '23:00 - 01:00', organ: '胆经当令', advice: '子时大睡，养胆育气。由于您常有熬夜习惯，今晚请务必22:30前关灯安睡，养护肝胆阳气。', recommendHabit: '22:30前强制关灯' },
        { name: '丑时', hour: 1, timeRange: '01:00 - 03:00', organ: '肝经当令', advice: '丑时肝经血归，熟睡排毒。宜保持深沉睡眠，帮助肝脏解毒疏泄。', recommendHabit: '熟睡安养肝血' },
        { name: '寅时', hour: 3, timeRange: '03:00 - 05:00', organ: '肺经当令', advice: '寅时肺朝百脉，深睡息养。鉴于吸烟习惯，寅时肺经肃降排毒最剧烈，宜保持熟睡。', recommendHabit: '晨起深呼吸拉伸' },
        { name: '卯时', hour: 5, timeRange: '05:00 - 07:00', organ: '大肠经当令', advice: '卯时大肠清渣，晨起饮水。体质偏湿热宜晨起慢饮300ml温开水通畅肠胃。', recommendHabit: '早起（7点前）饮水' },
        { name: '辰时', hour: 7, timeRange: '07:00 - 09:00', organ: '胃经当令', advice: '辰时吃早餐，营养化气血。气虚体质辰时胃经最旺，宜享用温热山药粥。', recommendHabit: '吃一顿滋养早餐' },
        { name: '巳时', hour: 9, timeRange: '09:00 - 11:00', organ: '脾经当令', advice: '巳时脾主运化，动脑专注。针对久坐作息，每隔45分钟宜起身站立伸展。', recommendHabit: '每小时起身拉伸' },
        { name: '午时', hour: 11, timeRange: '11:00 - 13:00', organ: '心经当令', advice: '午时小憩，养心养阳。针对高压状态，午饭后宜闭目静卧20分钟滋养心气。', recommendHabit: '午时静卧小憩20分钟' },
        { name: '未时', hour: 13, timeRange: '13:00 - 15:00', organ: '小肠经当令', advice: '未时小肠分清浊，补充水分。小肠吸收养分，宜小口多次饮用温开水。', recommendHabit: '喝够8杯水' },
        { name: '申时', hour: 15, timeRange: '15:00 - 17:00', organ: '膀胱经当令', advice: '申时饮水，多动走气。针对长期久坐，申时宜练习八段锦或散步30分钟。', recommendHabit: '散步30分钟 / 八段锦' },
        { name: '酉时', hour: 17, timeRange: '17:00 - 19:00', organ: '肾经当令', advice: '酉时肾藏精气，晚餐宜清淡。针对阳虚体质，晚餐宜吃温热食材，七分饱。', recommendHabit: '饭后散步10分钟' },
        { name: '戌时', hour: 19, timeRange: '19:00 - 21:00', organ: '心包经当令', advice: '戌时心包护心，静心放松。宜放下手机阅读或听柔和音乐，保持心情舒畅。', recommendHabit: '记录一件心安小事' },
        { name: '亥时', hour: 21, timeRange: '21:00 - 23:00', organ: '三焦经当令', advice: '亥时三焦通百脉，睡前泡脚安神。针对熬夜习惯，宜用40℃温热水泡脚15分钟。', recommendHabit: '睡前泡脚15分钟' }
      ],
      solarTerms: [
        { id: 1, name: '立春', monthDay: '2月3-5日', threeClimates: '一候东风解冻；二候蛰虫始振；三候鱼陟负冰', dietAdvice: '少酸多甘，适量食用春笋、韭菜、山药', livingAdvice: '夜卧早起，披发缓行，舒展身心', exerciseAdvice: '宜进行慢跑、散步等温和户外运动' },
        { id: 2, name: '雨水', monthDay: '2月18-20日', threeClimates: '一候獭祭鱼；二候鸿雁来；三候草木萌动', dietAdvice: '省酸增甘，养脾胃阳气', livingAdvice: '注意下厚上薄，防倒春寒', exerciseAdvice: '散步、太极，保持心情舒畅' },
        { id: 14, name: '处暑', monthDay: '8月22-24日', threeClimates: '一候鹰乃祭鸟；二候天地始肃；三候禾乃登', dietAdvice: '宜吃百合、银耳、鸭肉，少食辛辣', livingAdvice: '早睡早起，午休20分钟补充精力', exerciseAdvice: '避免大汗淋漓，推荐太极、散步' },
        { id: 15, name: '白露', monthDay: '9月7-9日', threeClimates: '一候鸿雁来；二候玄鸟归；三候群鸟养羞', dietAdvice: '宜食龙眼、大枣、芝麻润燥', livingAdvice: '早晚加衣，切勿赤脚，睡前温水泡脚', exerciseAdvice: '晨起散步，适度慢跑' }
      ]
    }
  },
  mounted() {
    setupThemeListener(this)
  },
  onShow() {
    this.autoSelectCurrentClock()
    this.loadContent()
    this.loadArticles()
  },
  methods: {
    autoSelectCurrentClock() {
      const currentHour = new Date().getHours()
      let foundIndex = 0
      if (currentHour >= 23 || currentHour < 1) foundIndex = 0
      else if (currentHour >= 1 && currentHour < 3) foundIndex = 1
      else if (currentHour >= 3 && currentHour < 5) foundIndex = 2
      else if (currentHour >= 5 && currentHour < 7) foundIndex = 3
      else if (currentHour >= 7 && currentHour < 9) foundIndex = 4
      else if (currentHour >= 9 && currentHour < 11) foundIndex = 5
      else if (currentHour >= 11 && currentHour < 13) foundIndex = 6
      else if (currentHour >= 13 && currentHour < 15) foundIndex = 7
      else if (currentHour >= 15 && currentHour < 17) foundIndex = 8
      else if (currentHour >= 17 && currentHour < 19) foundIndex = 9
      else if (currentHour >= 19 && currentHour < 21) foundIndex = 10
      else foundIndex = 11

      this.activeClock = this.clockList[foundIndex]
      this.scrollLeftOffset = Math.max(0, (foundIndex - 1) * 70)
    },
    async loadContent() {
      const stRes = await getCurrentSolarTermApi()
      if (stRes && stRes.data) this.solarTerm = stRes.data

      const knRes = await getTodayQuoteApi()
      if (knRes && knRes.data) this.knowledge = knRes.data

      const clockRes = await getCurrentOrganClockApi()
      if (clockRes && clockRes.data) {
        this.activeClock = clockRes.data
      }
    },
    async loadArticles() {
      const res = await getArticlesApi('', this.activeCategory, this.activeMediaType, 1, 10)
      if (res && res.data && res.data.records) {
        this.articleList = res.data.records
      }
    },
    changeCategory(cat) {
      this.activeCategory = cat
      this.loadArticles()
    },
    changeMediaType(type) {
      this.activeMediaType = type
      this.loadArticles()
    },
    selectSolarTerm(term) {
      this.solarTerm = term
    },
    selectClock(c) {
      this.activeClock = c
    },
    goToAiChat() {
      uni.navigateTo({ url: '/pages/ai-chat/ai-chat' })
    },
    goToFoodEncyclopedia() {
      uni.navigateTo({ url: '/pages/herbal-food/herbal-food' })
    },
    goToCommunity() {
      uni.navigateTo({ url: '/pages/community/index' })
    },
    goToArticleDetail(item) {
      uni.navigateTo({ url: `/pages/article/detail?id=${item.id}` })
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

.top-nav-tabs {
  display: flex;
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 8rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  border-radius: 22rpx;
  transition: all 0.2s ease;
}

.tab-item.active {
  background: var(--color-primary);
}

.tab-item.active .tab-title {
  color: #FFFFFF;
  font-weight: bold;
}

.tab-title {
  font-size: 24rpx;
  color: #7A8B82;
}

/* 社区 Banner */
.community-banner {
  background: linear-gradient(135deg, #FAF4EB 0%, #F5EBE0 100%);
  border: 1px solid rgba(200, 155, 101, 0.3);
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  margin-bottom: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #4A3A2C;
  display: block;
}

.banner-sub {
  font-size: 22rpx;
  color: #8C6D46;
  margin-top: 4rpx;
  display: block;
}

.banner-btn {
  background: #C89B65;
  color: #FFFFFF;
  font-size: 22rpx;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-weight: bold;
}

.solar-card {
  background: var(--color-banner-gradient);
  border-radius: 36rpx;
  padding: 44rpx 36rpx;
  color: #FFFFFF;
  margin-bottom: 28rpx;
  position: relative;
  box-shadow: 0 12rpx 32rpx rgba(30, 77, 59, 0.15);
}

.solar-badge {
  position: absolute;
  top: 36rpx;
  right: 36rpx;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
}

.solar-name {
  font-size: 52rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
}

.solar-date {
  font-size: 24rpx;
  opacity: 0.85;
  margin-left: 16rpx;
}

.climates-box {
  margin-top: 16rpx;
  background: rgba(0, 0, 0, 0.12);
  padding: 14rpx 24rpx;
  border-radius: 16rpx;
}

.climates-text {
  font-size: 24rpx;
  opacity: 0.9;
}

.advice-grid {
  margin-top: 32rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.advice-item {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.advice-label {
  font-size: 24rpx;
  opacity: 0.85;
  font-weight: 600;
}

.advice-val {
  font-size: 26rpx;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.section-title-bar {
  margin-top: 32rpx;
  margin-bottom: 16rpx;
}

.sec-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #2C3531;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.now-badge {
  background: #EBF3EF;
  color: #2E6D56;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

.sec-sub-text {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 4rpx;
  display: block;
}

.solar-scroll {
  white-space: nowrap;
  width: 100%;
  padding-bottom: 12rpx;
}

.solar-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 36rpx;
  margin-right: 16rpx;
  margin-bottom: 0;
  transition: all 0.25s ease;
}

.solar-chip.active {
  border: 2rpx solid var(--color-primary);
  background-color: var(--color-primary-light);
  transform: scale(1.04);
}

.chip-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
}

.chip-date {
  font-size: 20rpx;
  color: #7A8B82;
  margin-top: 4rpx;
}

/* 子午流注 */
.organ-clock-section {
  margin-top: 28rpx;
}

.clock-scroll {
  white-space: nowrap;
  width: 100%;
  margin-top: 24rpx;
}

.clock-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 28rpx;
  background: #FAF8F3;
  border-radius: 20rpx;
  margin-right: 16rpx;
  border: 2rpx solid transparent;
  transition: all 0.2s ease;
}

.clock-chip.active {
  border-color: #C89B65;
  background: #FAF4EB;
  transform: scale(1.05);
}

.chip-clock-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #4A3A2C;
}

.chip-clock-organ {
  font-size: 20rpx;
  color: #8C6D46;
  margin-top: 4rpx;
}

.clock-detail-box {
  background: #FAF4EB;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-top: 24rpx;
  border: 1px solid rgba(200, 155, 101, 0.2);
}

.detail-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.detail-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #4A3A2C;
}

.detail-time {
  font-size: 22rpx;
  color: #8C6D46;
}

.ai-advice-wrapper {
  margin-top: 16rpx;
}

.ai-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-chat-btn {
  background: #2E6D56;
  color: #FFFFFF;
  font-size: 20rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 10rpx rgba(46, 109, 86, 0.2);
}

.ai-tag {
  font-size: 22rpx;
  color: #C89B65;
  font-weight: bold;
  display: block;
}

.detail-advice {
  font-size: 26rpx;
  color: #5C4939;
  line-height: 1.6;
  margin-top: 6rpx;
  display: block;
}

.detail-rec {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px dashed rgba(140, 109, 70, 0.2);
}

.rec-tag {
  font-size: 22rpx;
  color: #8C6D46;
  font-weight: 600;
}

.article-card {
  padding: 36rpx;
  margin-top: 28rpx;
}

.article-tag {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #2E6D56;
  font-weight: 600;
}

.read-time {
  color: #A3B1A9;
}

.article-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #2C3531;
  margin-top: 16rpx;
  display: block;
}

.quote-box {
  background-color: #FAF8F3;
  border-left: 6rpx solid #2E6D56;
  padding: 20rpx;
  margin-top: 20rpx;
  border-radius: 8rpx;
}

.quote-text {
  font-size: 28rpx;
  color: #4A3A2C;
  font-style: italic;
}

.article-body {
  font-size: 26rpx;
  color: #5A6B62;
  line-height: 1.7;
  margin-top: 24rpx;
  display: block;
  white-space: pre-line;
}

.article-footer {
  margin-top: 32rpx;
  padding-top: 20rpx;
  border-top: 1px dashed rgba(0,0,0,0.08);
}

.disclaimer {
  font-size: 20rpx;
  color: #A3B1A9;
}

/* 干货辟谣列表样式 */
.category-scroll {
  white-space: nowrap;
  width: 100%;
  margin-bottom: 24rpx;
}

.cat-chip {
  display: inline-block;
  padding: 12rpx 32rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  margin-right: 16rpx;
  font-size: 24rpx;
  color: #5A6B62;
}

.cat-chip.active {
  background: var(--color-primary);
  color: #FFFFFF;
  font-weight: bold;
}

.article-item-card {
  margin-bottom: 24rpx;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.type-badge {
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 10rpx;
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

.vip-tag {
  background: #FFF3E0;
  color: #E65100;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
  font-weight: bold;
}

.cat-label {
  font-size: 22rpx;
  color: #7A8B82;
}

.art-item-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2C3531;
  line-height: 1.4;
  display: block;
}

.art-item-summary {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
  display: block;
}

.rumor-box {
  background: #FFF8F8;
  border: 1px dashed #FFCDD2;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-top: 16rpx;
}

.rumor-truth-preview {
  font-size: 22rpx;
  color: #C62828;
  line-height: 1.5;
  display: block;
}

.art-item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px solid #F0F0F0;
}

.foot-info {
  font-size: 22rpx;
  color: #999;
}

.read-more-btn {
  font-size: 22rpx;
  color: #2E6D56;
  font-weight: bold;
}

.empty-box {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}
</style>
