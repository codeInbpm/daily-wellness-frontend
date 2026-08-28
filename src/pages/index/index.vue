<template>
  <view :class="['container', themeClass]">
    <!-- 1. 顶部深绿问候 Banner 卡片 -->
    <view class="banner-card">
      <view class="banner-header">
        <text class="banner-date">{{ currentDateStr }}</text>
      </view>
      <text class="banner-title">{{ greeting }}，今天也要<text class="block-text">{{ greetingSub }}</text></text>
      <text class="banner-sub">不必一次改变全部。今天，给自己留一点真实的时间。</text>

      <view class="banner-footer">
        <view class="tags-group">
          <view class="pill-tag interactive" @click="goToCalendar">
            <text class="pill-icon">🔥</text>
            <text class="pill-text">连续 {{ maxStreak }} 天 ›</text>
          </view>
          <view class="pill-tag interactive" @click="scrollToCheckinSection">
            <text class="pill-icon">🎯</text>
            <text class="pill-text">完成 {{ completedCount }}/{{ totalCount }} ›</text>
          </view>
        </view>
        <view class="poster-btn" @click="openPoster">
          <text class="poster-btn-icon">✨</text>
          <text>生成今日海报</text>
        </view>
      </view>
    </view>

    <!-- 2. 子午流注 · 当时养生作息卡片 -->
    <view class="organ-clock-card card">
      <view class="clock-header">
        <view class="clock-title-group">
          <text class="clock-tag">☯️ 子午流注 · 当时养生</text>
          <view class="clock-name-box">
            <text class="clock-name">{{ organClock.name }}</text>
            <text class="clock-time">({{ organClock.timeRange }})</text>
            <text class="clock-organ-badge">{{ organClock.organ }}</text>
          </view>
        </view>
        <switch :checked="clockRemindEnabled" @change="toggleClockRemind" :color="switchColor"/>
      </view>

      <text class="clock-advice">“{{ organClock.advice }}”</text>

      <view class="clock-footer">
        <text class="clock-tip-label">💡 推荐此时辰行动：{{ organClock.recommendHabit }}</text>
      </view>
    </view>

    <!-- 3. 中部打卡列表与今日提示卡片 -->
    <view class="main-grid">
      <!-- 打卡列表区 (带有锚点 css 选择器 checkin-section) -->
      <view class="checkin-section card">
        <view class="section-header">
          <view>
            <text class="section-sub">每日打卡</text>
            <text class="section-title">给今天一个小小的回应</text>
            <text class="section-desc">轻触复选框或点击“📷 记心得”上传图片视频。</text>
          </view>
          <!-- 环形/百分比进度 -->
          <view class="progress-ring">
            <text class="progress-num">{{ progressPercent }}%</text>
          </view>
        </view>

        <view class="habit-list">
          <view 
            v-for="item in habits" 
            :key="item.habitId" 
            class="habit-item"
            :class="{ 'is-checked': item.checked }"
          >
            <view class="habit-left" @click.stop="toggleCheckIn(item)">
              <view class="badge-category" :class="getCategoryClass(item.category)">
                {{ item.category || '养' }}
              </view>
              <view class="habit-info">
                <text class="habit-name" :class="{ 'text-completed': item.checked }">{{ item.name }}</text>
                <text class="habit-streak">{{ item.currentStreak }} 日连续 · {{ item.checked ? '已打卡' : '未完成' }}</text>
              </view>
            </view>

            <view class="habit-right-actions">
              <!-- 富媒体打卡心得按钮 -->
              <view class="media-btn" @click.stop="openMediaModal(item)" title="富媒体打卡">
                <text class="media-btn-icon">📷</text>
              </view>
              <!-- 快速复选框 -->
              <view class="check-btn" :class="{ checked: item.checked }" @click.stop="toggleCheckIn(item)">
                <text v-if="item.checked" class="check-icon">✓</text>
              </view>
            </view>
          </view>
        </view>

        <view class="manage-link" @click="goToHabitManage">
          <text>管理我的习惯</text>
          <text class="arrow">→</text>
        </view>
      </view>

      <!-- 今日提示卡片 -->
      <view class="tip-card card">
        <view class="tip-header">
          <text class="tip-icon">☀️</text>
          <text class="tip-tag">今日提示 · 呼吸法</text>
        </view>
        <text class="tip-title">把呼吸放慢，<text class="block-text">让身体跟上你。</text></text>
        <text class="tip-content">在下一个任务开始前，先做三次完整深长地呼吸。没有特别的目标，只是把注意力收回到身心里。</text>
        <view class="tip-footer">
          <text class="time-cost">⏱️ 需要 1 分钟</text>
        </view>
      </view>
    </view>

    <!-- 4. 底部数据概览 3 列卡片 -->
    <view class="stats-grid">
      <view class="stat-card card" @click="scrollToCheckinSection">
        <text class="stat-label">今日状态 🌿</text>
        <text class="stat-main">{{ progressPercent === 100 ? '已圆满' : '正在进行' }}</text>
        <text class="stat-sub">每一次完成都算数</text>
      </view>
      <view class="stat-card card" @click="scrollToCheckinSection">
        <text class="stat-label">今日完成 🗸</text>
        <text class="stat-main">{{ completedCount }} 次</text>
        <text class="stat-sub">点击查看详情</text>
      </view>
      <view class="stat-card card" @click="goToCalendar">
        <text class="stat-label">最长连续 🔥</text>
        <text class="stat-main">{{ maxStreak }} 天</text>
        <text class="stat-sub">点击查看足迹日历</text>
      </view>
    </view>

    <!-- 免责提示 -->
    <view class="disclaimer-bar">
      <text>* 本小程序养生习惯提示仅供日常生活参考，不构成医疗诊断或治疗建议。</text>
    </view>

    <!-- 5. 富媒体打卡与心得弹窗 -->
    <view v-if="showMediaModal" class="media-modal-mask" @click="closeMediaModal">
      <view class="media-modal-card" @click.stop>
        <view class="modal-header">
          <text class="modal-title">养生打卡记 · {{ activeMediaHabit.name }}</text>
          <text class="modal-sub">记录当下的养生体验与感悟</text>
        </view>

        <view class="media-form">
          <view class="upload-section">
            <text class="form-label">上传图片 / 视频凭证</text>
            <view class="upload-box">
              <view v-if="!uploadedMediaUrl" class="upload-trigger" @click="chooseMediaFile">
                <text class="upload-icon">📷 / 🎥</text>
                <text class="upload-tip">点击拍摄或选择照片/视频</text>
              </view>
              <view v-else class="upload-preview">
                <image v-if="uploadedMediaType === 'image'" :src="uploadedMediaUrl" class="preview-img" mode="aspectFill"/>
                <view v-else-if="uploadedMediaType === 'video'" class="preview-video-box">
                  <text class="video-icon">🎥 视频打卡卡片</text>
                </view>
                <view class="btn-remove-media" @click="removeMedia">✕ 移除</view>
              </view>
            </view>
          </view>

          <view class="remark-section">
            <text class="form-label">养生心得小记</text>
            <textarea 
              v-model="inputRemark" 
              class="remark-input" 
              placeholder="例如：练习八段锦15分钟，身心发热，特别有精神！"
              maxlength="200"
            />
          </view>
        </view>

        <view class="modal-actions">
          <button class="btn-cancel" @click="closeMediaModal">取消</button>
          <button class="btn-submit-checkin" @click="submitMediaCheckIn">完成打卡记录</button>
        </view>
      </view>
    </view>

    <!-- 6. 今日养生海报生成弹窗蒙层 -->
    <view v-if="showPosterModal" class="poster-modal-mask" @click="closePoster">
      <view class="poster-modal-content" @click.stop>
        <view class="poster-card-body">
          <view class="poster-top-bar">
            <view class="poster-app-info">
              <text class="poster-app-title">每日养生 · A Daily Ritual</text>
              <text class="poster-vip-tag" v-if="isVipUser">👑 VIP 尊享成就</text>
            </view>
            <text class="poster-date">{{ currentDateStr }}</text>
          </view>
          
          <view class="poster-hero">
            <text class="poster-solar">处暑 · 暑气渐退，宜祛湿防秋燥</text>
            <view class="quote-header-row">
              <view class="quote-text-group">
                <text class="poster-quote">“{{ posterQuote }}”</text>
                <text class="poster-quote-source" v-if="posterQuoteSource">—— {{ posterQuoteSource }}</text>
              </view>
              <view class="refresh-quote-btn" @click="refreshPosterQuote" title="换一言">
                <text class="refresh-icon">🎲</text>
                <text class="refresh-text">换一言</text>
              </view>
            </view>
          </view>

          <view class="poster-stats">
            <view class="poster-stat-item">
              <text class="poster-stat-num">{{ completedCount }}/{{ totalCount }}</text>
              <text class="poster-stat-label">今日完成习惯</text>
            </view>
            <view class="poster-stat-divider"></view>
            <view class="poster-stat-item">
              <text class="poster-stat-num">{{ maxStreak }} 天</text>
              <text class="poster-stat-label">连续养生坚持</text>
            </view>
          </view>

          <view class="poster-footer">
            <view class="poster-qr-sim">
              <text class="qr-icon">⛩️</text>
            </view>
            <view class="poster-footer-text">
              <text class="footer-p1">长按识别小程序</text>
              <text class="footer-p2">顺应自然的禅意生活法</text>
            </view>
          </view>
        </view>

        <!-- 海报交互按钮区 -->
        <view class="poster-actions-row">
          <button class="btn-action-item btn-share" open-type="share" @click="shareToFriends">
            <text class="btn-act-icon">📤</text>
            <text>分享好友</text>
          </button>
          <button class="btn-action-item btn-save" @click="savePoster">
            <text class="btn-act-icon">💾</text>
            <text>保存到相册</text>
          </button>
          <button class="btn-action-item btn-close" @click="closePoster">
            <text class="btn-act-icon">✕</text>
            <text>关闭</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 全局登录模态框 -->
    <login-modal />
  </view>
</template>

<script>
import { getTodayHabitsApi, checkInApi } from '../../api/habit.js'
import { uploadFileApi, deleteFileApi } from '../../api/common.js'
import { getCurrentOrganClockApi, getRandomQuoteApi } from '../../api/content.js'
import { getUserInfo } from '../../utils/auth.js'
import { setupThemeListener, getThemeClass, getSwitchColor } from '../../utils/theme.js'
import loginModal from '../../components/login-modal/login-modal.vue'

export default {
  components: {
    loginModal
  },
  data() {
    return {
      currentDateStr: '8月25日 · 星期二',
      greeting: '早上好',
      greetingSub: '照顾好自己。',
      completedCount: 0,
      totalCount: 5,
      progressPercent: 0,
      maxStreak: 0,
      habits: [],
      showPosterModal: false,
      showMediaModal: false,
      activeMediaHabit: {},
      inputRemark: '',
      uploadedMediaUrl: '',
      uploadedMediaType: 'none',
      clockRemindEnabled: true,
      themeClass: getThemeClass(),
      switchColor: getSwitchColor(),
      posterQuote: '法于阴阳，和于术数，食饮有节，起居有常。',
      posterQuoteSource: '《黄帝内经·素问》',
      organClock: {
        name: '未时',
        timeRange: '13:00 - 15:00',
        organ: '小肠经当令',
        advice: '小肠分清浊，补充水分。小肠吸收养分，宜多喝温水促进吸收。',
        recommendHabit: '喝够8杯水'
      }
    }
  },
  computed: {
    isVipUser() {
      const u = getUserInfo()
      return u && (u.isVip || (u.vipExpireTime && new Date(u.vipExpireTime) > new Date()))
    }
  },
  mounted() {
    setupThemeListener(this)
  },
  onShow() {
    this.updateDateStr()
    this.loadTodayData()
    this.loadOrganClock()
  },
  onShareAppMessage() {
    return {
      title: `我已经在「每日养生」坚持打卡 ${this.maxStreak} 天，邀请你一起顺时而食！`,
      path: '/pages/index/index'
    }
  },
  methods: {
    // 点击【连续X天】胶囊 Tag 跳转至足迹与日历
    goToCalendar() {
      uni.switchTab({
        url: '/pages/knowledge/knowledge',
        fail: () => {
          uni.navigateTo({ url: '/pages/knowledge/knowledge' })
        }
      })
      uni.showToast({ title: '已为您切换至打卡足迹与日历', icon: 'none' })
    },
    // 点击【完成X/Y】胶囊 Tag 平滑定位至打卡列表
    scrollToCheckinSection() {
      uni.pageScrollTo({
        selector: '.checkin-section',
        duration: 300
      })
      uni.showToast({ title: '已为您定位至今日打卡列表', icon: 'none' })
    },
    // 调用后端 API 实时拉取《黄帝内经》/中医名家/民间谚语权威名句
    async refreshPosterQuote() {
      try {
        const res = await getRandomQuoteApi()
        if (res && res.data && res.data.content) {
          this.posterQuote = res.data.content
          this.posterQuoteSource = res.data.source || res.data.category || ''
          uni.showToast({ title: '已在线拉取中医名家典籍金句', icon: 'none' })
        }
      } catch (e) {
        console.error('动态拉取名言失败', e)
      }
    },
    updateDateStr() {
      const now = new Date()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const hour = now.getHours()
      const weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      const week = weekArr[now.getDay()]
      this.currentDateStr = `${month}月${day}日 · ${week}`

      if (hour >= 5 && hour < 11) {
        this.greeting = '早上好'
        this.greetingSub = '照顾好自己。'
      } else if (hour >= 11 && hour < 18) {
        this.greeting = '下午好'
        this.greetingSub = '让步履慢下来。'
      } else {
        this.greeting = '夜深了'
        this.greetingSub = '卸下一天的疲惫。'
      }
    },
    async loadOrganClock() {
      const res = await getCurrentOrganClockApi()
      if (res && res.data) {
        this.organClock = res.data
      }
    },
    toggleClockRemind(e) {
      this.clockRemindEnabled = e.detail.value
      uni.showToast({
        title: this.clockRemindEnabled ? `已开启${this.organClock.name}作息提醒` : '已关闭时辰提醒',
        icon: 'none'
      })
    },
    async loadTodayData() {
      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      const res = await getTodayHabitsApi(userId)
      if (res && res.data) {
        this.habits = res.data.habits || []
        this.completedCount = res.data.completedCount || 0
        this.totalCount = res.data.totalCount || (this.habits.length > 0 ? this.habits.length : 5)
        this.progressPercent = res.data.progressPercent || 0

        if (this.habits.length > 0) {
          const streaks = this.habits.map(h => h.currentStreak || 0)
          this.maxStreak = Math.max(...streaks)
        } else {
          this.maxStreak = 0
        }
      }
    },
    async toggleCheckIn(item) {
      if (!checkLogin()) return

      item.checked = !item.checked
      if (item.checked) {
        this.completedCount++
        item.currentStreak++
      } else {
        this.completedCount = Math.max(0, this.completedCount - 1)
        item.currentStreak = Math.max(0, item.currentStreak - 1)
      }
      this.progressPercent = this.totalCount > 0 ? Math.round((this.completedCount * 100) / this.totalCount) : 0
      
      const streaks = this.habits.map(h => h.currentStreak || 0)
      this.maxStreak = streaks.length > 0 ? Math.max(...streaks) : 0

      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      const res = await checkInApi(userId, item.habitId)
      if (res && res.data && res.data.currentStreak !== undefined) {
        item.currentStreak = res.data.currentStreak
      }
    },
    openMediaModal(item) {
      this.activeMediaHabit = item
      this.inputRemark = item.remark || ''
      this.uploadedMediaUrl = item.mediaUrl || ''
      this.uploadedMediaType = item.mediaType || 'none'
      this.showMediaModal = true
    },
    closeMediaModal() {
      this.showMediaModal = false
    },
    chooseMediaFile() {
      uni.showActionSheet({
        itemList: ['📷 拍照 / 从相册选择照片', '🎥 录制 / 选择短视频'],
        success: (res) => {
          if (res.tapIndex === 0) {
            uni.chooseImage({
              count: 1,
              success: async (imgRes) => {
                const tempPath = imgRes.tempFilePaths[0]
                uni.showLoading({ title: '上传图片中...' })
                const upRes = await uploadFileApi(tempPath)
                uni.hideLoading()
                this.uploadedMediaUrl = (upRes && upRes.data && upRes.data.url) ? upRes.data.url : tempPath
                this.uploadedMediaType = 'image'
              }
            })
          } else if (res.tapIndex === 1) {
            uni.chooseVideo({
              count: 1,
              success: async (vidRes) => {
                const tempPath = vidRes.tempFilePath
                uni.showLoading({ title: '上传视频中...' })
                const upRes = await uploadFileApi(tempPath)
                uni.hideLoading()
                this.uploadedMediaUrl = (upRes && upRes.data && upRes.data.url) ? upRes.data.url : tempPath
                this.uploadedMediaType = 'video'
              }
            })
          }
        }
      })
    },
    async removeMedia() {
      if (this.uploadedMediaUrl && this.uploadedMediaUrl.startsWith('http')) {
        uni.showLoading({ title: '正在清理存储...' })
        await deleteFileApi(this.uploadedMediaUrl)
        uni.hideLoading()
        uni.showToast({ title: '已从 MinIO 存储桶中删除', icon: 'success' })
      }
      this.uploadedMediaUrl = ''
      this.uploadedMediaType = 'none'
    },
    async submitMediaCheckIn() {
      if (!this.inputRemark && !this.uploadedMediaUrl) {
        uni.showToast({ title: '请填写心得或上传照片/视频', icon: 'none' })
        return
      }

      const u = getUserInfo()
      const userId = (u && u.id) ? u.id : 1
      uni.showLoading({ title: '正在提交打卡...' })
      const res = await checkInApi(
        userId, 
        this.activeMediaHabit.habitId, 
        this.inputRemark, 
        this.uploadedMediaUrl, 
        this.uploadedMediaType
      )
      uni.hideLoading()

      if (res && res.code === 200) {
        this.activeMediaHabit.checked = true
        this.activeMediaHabit.remark = this.inputRemark
        this.activeMediaHabit.mediaUrl = this.uploadedMediaUrl
        this.activeMediaHabit.mediaType = this.uploadedMediaType
        
        uni.showToast({ title: '富媒体打卡成功！', icon: 'success' })
        this.closeMediaModal()
        this.loadTodayData()
      } else {
        uni.showToast({ title: '打卡失败', icon: 'none' })
      }
    },
    getCategoryClass(category) {
      if (category === '水') return 'shui'
      if (category === '行') return 'xing'
      if (category === '息') return 'xi'
      if (category === '温') return 'wen'
      return 'yang'
    },
    goToHabitManage() {
      uni.switchTab({ url: '/pages/habit/habit' })
    },
    async openPoster() {
      await this.refreshPosterQuote()
      this.showPosterModal = true
    },
    closePoster() {
      this.showPosterModal = false
    },

    // 微信保存至手机相册（带完整授权申请逻辑）
    savePoster() {
      // #ifdef MP-WEIXIN
      uni.authorize({
        scope: 'scope.writePhotosAlbum',
        success: () => {
          this.doSavePosterToPhotosAlbum()
        },
        fail: () => {
          uni.showModal({
            title: '授权相册写入权限',
            content: '「每日养生」需要获得您的相册写入授权，才能将生成的成就海报保存至手机相册。',
            confirmText: '去授权',
            success: (mRes) => {
              if (mRes.confirm) {
                uni.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting['scope.writePhotosAlbum']) {
                      this.doSavePosterToPhotosAlbum()
                    } else {
                      uni.showToast({ title: '未获得相册权限，无法保存', icon: 'none' })
                    }
                  }
                })
              }
            }
          })
        }
      })
      // #endif

      // #ifndef MP-WEIXIN
      this.doSavePosterToPhotosAlbum()
      // #endif
    },
    doSavePosterToPhotosAlbum() {
      uni.showLoading({ title: '海报导出中...' })
      setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
          title: '已保存至手机相册！',
          icon: 'success',
          duration: 2500
        })
        this.showPosterModal = false
      }, 800)
    },
    shareToFriends() {
      uni.showToast({
        title: '点击右上角“•••”即可分享海报给微信好友',
        icon: 'none',
        duration: 3000
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

/* 顶部 Banner 卡片 */
.banner-card {
  background: var(--color-banner-gradient);
  border-radius: 36rpx;
  padding: 48rpx 40rpx;
  color: #FFFFFF;
  margin-bottom: 24rpx;
  box-shadow: 0 12rpx 32rpx rgba(30, 77, 59, 0.15);
}

.banner-date {
  font-size: 26rpx;
  opacity: 0.85;
  letter-spacing: 2rpx;
}

.banner-title {
  font-size: 44rpx;
  font-weight: 600;
  line-height: 1.35;
  margin-top: 24rpx;
  display: block;
}

.block-text {
  display: block;
}

.banner-sub {
  font-size: 26rpx;
  opacity: 0.8;
  margin-top: 16rpx;
  display: block;
}

.banner-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40rpx;
}

.tags-group {
  display: flex;
  gap: 16rpx;
}

.pill-tag {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.2s ease;
}

.pill-tag.interactive:active {
  background: rgba(255, 255, 255, 0.35);
  transform: scale(0.96);
}

.poster-btn {
  background: #FFFFFF;
  color: #1E4D3B;
  padding: 14rpx 28rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

/* 子午流注当时养生卡片 */
.organ-clock-card {
  background: linear-gradient(135deg, #FAF4EB 0%, #F5EFE6 100%);
  border-radius: 28rpx;
  padding: 32rpx 36rpx;
  margin-bottom: 24rpx;
  border: 1px solid rgba(200, 155, 101, 0.15);
}

.clock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clock-tag {
  font-size: 22rpx;
  color: #8C6D46;
  font-weight: 600;
  display: block;
}

.clock-name-box {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
  margin-top: 6rpx;
}

.clock-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #4A3A2C;
}

.clock-time {
  font-size: 22rpx;
  color: #9E8B78;
}

.clock-organ-badge {
  background-color: rgba(140, 109, 70, 0.12);
  color: #8C6D46;
  padding: 4rpx 16rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: bold;
}

.clock-advice {
  font-size: 26rpx;
  color: #5C4939;
  line-height: 1.6;
  margin-top: 16rpx;
  display: block;
}

.clock-footer {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 1px dashed rgba(140, 109, 70, 0.2);
}

.clock-tip-label {
  font-size: 22rpx;
  color: #8C6D46;
  font-weight: 600;
}

/* 主网格与其他样式保留 */
.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.main-grid {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.section-sub {
  font-size: 24rpx;
  color: #7A8B82;
  display: block;
}

.section-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
  margin-top: 4rpx;
}

.section-desc {
  font-size: 24rpx;
  color: #A3B1A9;
  display: block;
  margin-top: 6rpx;
}

.progress-ring {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  border: 6rpx solid var(--color-primary-light);
  border-top-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-num {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--color-primary);
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-card-secondary);
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  transition: all 0.25s ease;
  border: 2rpx solid transparent;
}

.habit-item.is-checked {
  background-color: var(--color-primary-light);
  border-color: rgba(46, 109, 86, 0.15);
}

.habit-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.badge-category {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 24rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-category.shui { background: #E0F2FE; color: #0284C7; }
.badge-category.xing { background: #FEF3C7; color: #D97706; }
.badge-category.xi { background: #F3E8FF; color: #9333EA; }
.badge-category.wen { background: #FEE2E2; color: #DC2626; }

.habit-info {
  display: flex;
  flex-direction: column;
}

.habit-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--color-text-main);
  transition: color 0.2s;
}

.habit-name.text-completed {
  color: var(--color-text-sub);
  text-decoration: line-through;
}

.habit-streak {
  font-size: 22rpx;
  color: var(--color-text-sub);
  margin-top: 4rpx;
}

.habit-right-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.media-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background-color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-btn-icon {
  font-size: 26rpx;
}

.check-btn {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  border: 4rpx solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #FFFFFF;
}

.check-btn.checked {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.08);
}

.check-icon {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
}

.manage-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #2E6D56;
  font-weight: 500;
  margin-top: 28rpx;
  padding-top: 20rpx;
  border-top: 1px dashed rgba(46, 109, 86, 0.15);
}

.media-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 36rpx;
}

.media-modal-card {
  width: 100%;
  max-width: 600rpx;
  background: #FFFFFF;
  border-radius: 36rpx;
  padding: 44rpx 36rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.modal-header {
  text-align: center;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
}

.modal-sub {
  font-size: 24rpx;
  color: #7A8B82;
  margin-top: 6rpx;
  display: block;
}

.form-label {
  font-size: 24rpx;
  color: #7A8B82;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}

.upload-box {
  background: #FAF8F3;
  border: 2rpx dashed #CBD5E1;
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160rpx;
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-icon {
  font-size: 40rpx;
}

.upload-tip {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 8rpx;
}

.upload-preview {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-img {
  width: 100%;
  height: 200rpx;
  border-radius: 16rpx;
}

.preview-video-box {
  background: #1E4D3B;
  color: #FFFFFF;
  padding: 20rpx 40rpx;
  border-radius: 16rpx;
}

.btn-remove-media {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #DC2626;
}

.remark-input {
  width: 100%;
  height: 140rpx;
  background: #FAF8F3;
  border: 1px solid #E6E2D8;
  border-radius: 20rpx;
  padding: 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
}

.btn-cancel {
  flex: 1;
  background: #FAF8F3;
  color: #7A8B82;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-submit-checkin {
  flex: 1;
  background: #2E6D56;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

.tip-card {
  background-color: #F5EFE6;
  border-radius: 28rpx;
  padding: 36rpx;
  border: none;
}

.tip-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.tip-tag {
  font-size: 24rpx;
  color: #8C6D46;
  font-weight: 600;
}

.tip-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #4A3A2C;
  line-height: 1.4;
  margin-top: 24rpx;
  display: block;
}

.tip-content {
  font-size: 26rpx;
  color: #7A6958;
  margin-top: 16rpx;
  line-height: 1.6;
  display: block;
}

.tip-footer {
  margin-top: 28rpx;
}

.time-cost {
  font-size: 24rpx;
  color: #9E8B78;
}

.stats-grid {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.stat-card {
  flex: 1;
  padding: 24rpx 20rpx;
  margin-bottom: 0;
}

.stat-label {
  font-size: 22rpx;
  color: #7A8B82;
  display: block;
}

.stat-main {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C3531;
  margin-top: 8rpx;
  display: block;
}

.stat-sub {
  font-size: 20rpx;
  color: #A3B1A9;
  margin-top: 4rpx;
  display: block;
}

.disclaimer-bar {
  text-align: center;
  margin-top: 40rpx;
  padding-bottom: 30rpx;
}

.disclaimer-bar text {
  font-size: 20rpx;
  color: #B5C2BA;
}

.poster-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.poster-modal-content {
  width: 100%;
  max-width: 620rpx;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.poster-card-body {
  background: linear-gradient(160deg, #1E4D3B 0%, #112F24 100%);
  border-radius: 36rpx;
  padding: 48rpx 40rpx;
  color: #FFFFFF;
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.poster-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 24rpx;
}

.poster-app-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.poster-app-title {
  font-size: 24rpx;
  letter-spacing: 2rpx;
  opacity: 0.9;
}

.poster-vip-tag {
  background: #FFD700;
  color: #4A3A2C;
  font-size: 18rpx;
  font-weight: bold;
  padding: 2rpx 10rpx;
  border-radius: 10rpx;
}

.poster-date {
  font-size: 22rpx;
  opacity: 0.7;
}

.poster-hero {
  margin: 40rpx 0;
}

.poster-solar {
  font-size: 24rpx;
  color: #C89B65;
  display: block;
  letter-spacing: 2rpx;
}

.poster-quote {
  font-size: 38rpx;
  font-weight: 600;
  line-height: 1.5;
  margin-top: 16rpx;
  display: block;
  color: #F7F5F0;
}

.poster-stats {
  display: flex;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 24rpx;
  padding: 24rpx;
  align-items: center;
}

.poster-stat-item {
  flex: 1;
  text-align: center;
}

.poster-stat-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  display: block;
}

.poster-stat-label {
  font-size: 20rpx;
  opacity: 0.7;
  margin-top: 4rpx;
  display: block;
}

.poster-stat-divider {
  width: 2rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.15);
}

.poster-footer {
  margin-top: 40rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding-top: 24rpx;
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
}

.poster-qr-sim {
  width: 72rpx;
  height: 72rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-icon {
  font-size: 40rpx;
}

.poster-footer-text {
  display: flex;
  flex-direction: column;
}

.footer-p1 {
  font-size: 24rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.footer-p2 {
  font-size: 20rpx;
  opacity: 0.7;
  margin-top: 4rpx;
}

.quote-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
  gap: 16rpx;
}

.quote-text-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.poster-quote {
  font-size: 32rpx;
  line-height: 1.4;
  font-weight: 500;
}

.poster-quote-source {
  font-size: 22rpx;
  opacity: 0.8;
  margin-top: 8rpx;
  font-style: italic;
}

.refresh-quote-btn {
  background: rgba(255, 255, 255, 0.2);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.refresh-quote-btn:active {
  background: rgba(255, 255, 255, 0.35);
}

.refresh-icon {
  font-size: 22rpx;
}

.refresh-text {
  font-size: 20rpx;
  color: #FFFFFF;
}

.poster-actions-row {
  display: flex;
  gap: 16rpx;
}

.btn-action-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: bold;
  border: none;
}

.btn-share {
  background: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
}

.btn-save {
  background: #C89B65;
  color: #FFFFFF;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.15);
}

.btn-close {
  background: rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  max-width: 140rpx;
}
</style>
