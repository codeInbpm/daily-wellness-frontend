<template>
  <view class="container">
    <!-- 日历头部 -->
    <view class="card calendar-card">
      <view class="cal-header">
        <view class="month-selector">
          <text class="arrow-btn" @click="changeMonth(-1)">‹</text>
          <text class="cal-month-title">{{ currentYear }}年 {{ currentMonth }}月</text>
          <text class="arrow-btn" @click="changeMonth(1)">›</text>
        </view>
        <view class="cal-summary-tag">
          <text>本月已坚持 {{ checkedDays.length }} 天</text>
        </view>
      </view>

      <!-- 星期表头 -->
      <view class="week-row">
        <text v-for="w in weeks" :key="w" class="week-cell">{{ w }}</text>
      </view>

      <!-- 日历日期网格 -->
      <view class="days-grid">
        <view 
          v-for="(day, idx) in calendarDays" 
          :key="idx" 
          class="day-cell"
          :class="{ 
            'is-checked': day.isChecked, 
            'is-today': day.isToday,
            'is-other-month': day.isOtherMonth,
            'is-selected': day.fullDate === selectedFullDate
          }"
          @click="selectDay(day)"
        >
          <text class="day-num">{{ day.dayNum }}</text>
          <view v-if="day.isChecked && !day.isOtherMonth" class="check-dot"></view>
        </view>
      </view>
    </view>

    <!-- 选中日期打卡记录明细卡片 (含照片/视频/心得画廊) -->
    <view class="card detail-card">
      <view class="detail-header">
        <text class="detail-date">{{ selectedDateStr }} 打卡画廊与小记</text>
      </view>

      <view v-if="dayDetailList.length > 0" class="checked-detail-list">
        <view v-for="(item, index) in dayDetailList" :key="index" class="detail-item">
          <view class="item-main-row">
            <view class="item-left">
              <view class="badge-category" :class="getCategoryClass(item.category)">
                {{ item.category || '养' }}
              </view>
              <view class="item-text">
                <text class="item-title">{{ item.name }}</text>
                <text class="item-time">{{ item.checkInTime }} 完成打卡</text>
              </view>
            </view>
          </view>

          <!-- 养生心得感悟 -->
          <view v-if="item.remark" class="remark-box">
            <text class="remark-text">“{{ item.remark }}”</text>
          </view>

          <!-- 打卡照片 / 视频凭证 preview -->
          <view v-if="item.mediaUrl" class="media-preview-box">
            <image 
              v-if="item.mediaType === 'image'" 
              :src="item.mediaUrl" 
              class="media-img" 
              mode="aspectFill"
              @click="previewImage(item.mediaUrl)"
            />
            <view v-else-if="item.mediaType === 'video'" class="media-video-tag">
              <text>🎥 包含八段锦/太极打卡短视频凭证</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-text">该日期暂无打卡记录。顺其自然，今天也是值得照顾的一天。</text>
        <!-- 如果是过去的 1~2 天，引导 VIP 补打卡 -->
        <view v-if="canMakeUp" class="makeup-guide-box" @click="openMakeUpModal">
          <text class="makeup-icon">👑</text>
          <text class="makeup-text">VIP 特权：点击补打 {{ selectedDateStr }} 的记录，保护连续成就</text>
        </view>
      </view>
    </view>

    <!-- VIP 补打卡选择弹窗 -->
    <view v-if="showMakeUpModal" class="modal-mask" @click="showMakeUpModal = false">
      <view class="modal-card" @click.stop>
        <view class="modal-title">VIP 专属补打卡 · {{ selectedDateStr }}</view>
        <view class="modal-sub">选择您要补打卡的养生习惯：</view>
        
        <view class="makeup-habit-list">
          <view 
            v-for="h in userHabits" 
            :key="h.habitId" 
            class="makeup-habit-item"
            :class="{ selected: selectedHabitId === h.habitId }"
            @click="selectedHabitId = h.habitId"
          >
            <text class="m-name">{{ h.name }}</text>
            <text class="m-tag">{{ h.category }}</text>
          </view>
        </view>

        <view class="modal-actions">
          <button class="btn-cancel" @click="showMakeUpModal = false">取消</button>
          <button class="btn-confirm" @click="submitMakeUp">完成补打卡</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getCalendarRecordsApi, getDayCheckInDetailApi, getTodayHabitsApi, makeUpCheckInApi } from '../../api/habit.js'
import { getUserInfoApi } from '../../api/auth.js'
import { getUserInfo, checkLogin, checkUserIsVip, saveAuthData, getToken } from '../../utils/auth.js'

export default {
  data() {
    return {
      currentYear: 2026,
      currentMonth: 8,
      weeks: ['日', '一', '二', '三', '四', '五', '六'],
      checkedDays: [2, 5, 8, 9, 12, 15, 18, 20, 22, 24, 25],
      selectedFullDate: '2026-08-25',
      selectedDateStr: '8月25日',
      calendarDays: [],
      dayDetailList: [],
      showMakeUpModal: false,
      userHabits: [],
      selectedHabitId: null
    }
  },
  computed: {
    canMakeUp() {
      if (!this.selectedFullDate) return false
      const target = new Date(this.selectedFullDate)
      const now = new Date()
      // 清除时分秒
      target.setHours(0,0,0,0)
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24))
      return diffDays >= 1 && diffDays <= 2
    }
  },
  mounted() {
    const now = new Date()
    this.currentYear = now.getFullYear()
    this.currentMonth = now.getMonth() + 1
    const m = this.currentMonth < 10 ? '0' + this.currentMonth : this.currentMonth
    const d = now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
    this.selectedFullDate = `${this.currentYear}-${m}-${d}`
    this.selectedDateStr = `${this.currentMonth}月${now.getDate()}日`
    
    this.loadMonthData()
    this.loadUserHabits()
  },
  methods: {
    async loadUserHabits() {
      const u = getUserInfo()
      const userId = u ? u.id : 1
      const res = await getTodayHabitsApi(userId)
      if (res && res.data && res.data.habits) {
        this.userHabits = res.data.habits
        if (this.userHabits.length > 0) {
          this.selectedHabitId = this.userHabits[0].habitId
        }
      }
    },
    // 补打卡入口：带网络层实时核验 VIP
    async openMakeUpModal() {
      if (!checkLogin()) return

      let u = getUserInfo()
      const userId = u ? u.id : 1

      uni.showLoading({ title: '核验 VIP 权益...' })
      try {
        const res = await getUserInfoApi(userId)
        if (res && res.data) {
          u = res.data
          saveAuthData(getToken(), u) // 实时刷新本地 Storage 缓存
        }
      } catch (e) {
        console.error('拉取最新用户信息失败，使用本地缓存核验', e)
      }
      uni.hideLoading()

      // 判断 VIP 有效性
      const isVip = checkUserIsVip(u)
      if (!isVip) {
        uni.showModal({
          title: 'VIP 专属补打卡',
          content: '补打卡权益为 VIP 会员专享，可保护连续成就不中断。是否去了解开通 VIP？',
          confirmText: '去开通',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/vip/vip' })
            }
          }
        })
        return
      }

      this.showMakeUpModal = true
    },
    async submitMakeUp() {
      if (!this.selectedHabitId) {
        uni.showToast({ title: '请选择要补打卡的习惯', icon: 'none' })
        return
      }

      const u = getUserInfo()
      const userId = u ? u.id : 1

      uni.showLoading({ title: '提交补打卡...' })
      try {
        const res = await makeUpCheckInApi(userId, this.selectedHabitId, this.selectedFullDate, '补打卡成功记录')
        uni.hideLoading()
        if (res && res.code === 200) {
          uni.showToast({ title: '🎉 补打卡成功！连续天数已保留', icon: 'success' })
          this.showMakeUpModal = false
          this.loadMonthData()
        } else {
          uni.showToast({ title: res?.msg || '补打卡失败', icon: 'none' })
        }
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '请求失败', icon: 'none' })
      }
    },
    async loadMonthData() {
      const monthStr = `${this.currentYear}-${this.currentMonth < 10 ? '0' + this.currentMonth : this.currentMonth}`
      const u = getUserInfo()
      const userId = u ? u.id : 1
      const res = await getCalendarRecordsApi(userId, monthStr)
      if (res && res.data) {
        this.checkedDays = res.data.map(d => {
          const parts = d.split('-')
          return parseInt(parts[2], 10)
        })
      }
      this.generateCalendar()
      this.loadDayDetail(this.selectedFullDate)
    },
    changeMonth(delta) {
      let m = this.currentMonth + delta
      let y = this.currentYear
      if (m > 12) {
        m = 1
        y++
      } else if (m < 1) {
        m = 12
        y--
      }
      this.currentYear = y
      this.currentMonth = m
      
      const mStr = m < 10 ? '0' + m : m
      this.selectedFullDate = `${y}-${mStr}-01`
      this.selectedDateStr = `${m}月1日`
      
      this.loadMonthData()
    },
    generateCalendar() {
      const days = []
      const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1).getDay()
      const totalDays = new Date(this.currentYear, this.currentMonth, 0).getDate()
      const now = new Date()
      const isCurrentMonthReal = now.getFullYear() === this.currentYear && (now.getMonth() + 1) === this.currentMonth

      for (let i = 0; i < firstDay; i++) {
        days.push({ dayNum: '', isToday: false, isChecked: false, isOtherMonth: true, fullDate: '' })
      }

      for (let i = 1; i <= totalDays; i++) {
        const mStr = this.currentMonth < 10 ? '0' + this.currentMonth : this.currentMonth
        const dStr = i < 10 ? '0' + i : i
        const fullDate = `${this.currentYear}-${mStr}-${dStr}`
        
        days.push({
          dayNum: i,
          isToday: isCurrentMonthReal && i === now.getDate(),
          isChecked: this.checkedDays.includes(i),
          isOtherMonth: false,
          fullDate: fullDate
        })
      }

      this.calendarDays = days
    },
    async selectDay(day) {
      if (day.isOtherMonth || !day.dayNum) return
      this.selectedFullDate = day.fullDate
      this.selectedDateStr = `${this.currentMonth}月${day.dayNum}日`
      this.loadDayDetail(day.fullDate)
    },
    async loadDayDetail(fullDate) {
      const u = getUserInfo()
      const userId = u ? u.id : 1
      const res = await getDayCheckInDetailApi(userId, fullDate)
      if (res && res.data) {
        this.dayDetailList = res.data
      } else {
        this.dayDetailList = []
      }
    },
    previewImage(url) {
      if (url) {
        uni.previewImage({
          urls: [url]
        })
      }
    },
    getCategoryClass(cat) {
      if (cat === '水') return 'shui'
      if (cat === '行') return 'xing'
      if (cat === '息') return 'xi'
      if (cat === '温') return 'wen'
      if (cat === '食') return 'shi'
      if (cat === '心') return 'xin'
      return 'yang'
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

.calendar-card {
  padding: 36rpx 28rpx;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.cal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28rpx;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.arrow-btn {
  font-size: 40rpx;
  color: #2E6D56;
  font-weight: bold;
  padding: 0 12rpx;
}

.cal-month-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2C3531;
}

.cal-summary-tag {
  background-color: #EBF3EF;
  color: #2E6D56;
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 20rpx;
}

.week-cell {
  font-size: 24rpx;
  color: #A3B1A9;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12rpx;
  text-align: center;
}

.day-cell {
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.day-cell.is-other-month {
  opacity: 0;
  pointer-events: none;
}

.day-cell.is-today {
  border: 2rpx solid #2E6D56;
  font-weight: 700;
}

.day-cell.is-checked {
  background-color: #EBF3EF;
}

.day-cell.is-selected {
  box-shadow: 0 0 0 4rpx #2E6D56;
}

.day-num {
  font-size: 26rpx;
  color: #2C3531;
}

.check-dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background-color: #2E6D56;
  margin-top: 4rpx;
}

.detail-card {
  padding: 32rpx;
  margin-top: 24rpx;
}

.detail-header {
  font-size: 30rpx;
  font-weight: 600;
  color: #2C3531;
  margin-bottom: 24rpx;
}

.checked-detail-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  background-color: #FAF8F3;
  padding: 24rpx;
  border-radius: 24rpx;
}

.item-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.badge-category {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #E8F0EB;
  color: #2E6D56;
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
.badge-category.shi { background: #DCFCE7; color: #16A34A; }
.badge-category.xin { background: #FCE7F3; color: #DB2777; }

.item-text {
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
}

.item-time {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 2rpx;
}

.remark-box {
  background: #FFFFFF;
  padding: 16rpx 20rpx;
  border-radius: 16rpx;
  border-left: 4rpx solid #2E6D56;
}

.remark-text {
  font-size: 24rpx;
  color: #4A3A2C;
  font-style: italic;
}

.media-preview-box {
  width: 100%;
}

.media-img {
  width: 100%;
  height: 220rpx;
  border-radius: 16rpx;
}

.media-video-tag {
  background: #1E4D3B;
  color: #FFFFFF;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
}

.empty-state {
  padding: 30rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 24rpx;
  color: #A3B1A9;
}

.makeup-guide-box {
  margin-top: 20rpx;
  background-color: #EBF3EF;
  border: 1px dashed #2E6D56;
  padding: 20rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.makeup-icon {
  font-size: 28rpx;
}

.makeup-text {
  font-size: 24rpx;
  color: #2E6D56;
  font-weight: 600;
}

/* 补打卡 Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 40rpx;
}

.modal-card {
  width: 100%;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 36rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #2C3531;
}

.modal-sub {
  font-size: 24rpx;
  color: #7A8B82;
  margin-top: 8rpx;
  margin-bottom: 24rpx;
}

.makeup-habit-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  max-height: 400rpx;
  overflow-y: auto;
}

.makeup-habit-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAF8F3;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  border: 2rpx solid transparent;
}

.makeup-habit-item.selected {
  border-color: #2E6D56;
  background-color: #EBF3EF;
}

.m-name {
  font-size: 28rpx;
  color: #2C3531;
  font-weight: 600;
}

.m-tag {
  font-size: 22rpx;
  color: #2E6D56;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 32rpx;
}

.btn-cancel {
  flex: 1;
  background: #F1F5F9;
  color: #64748B;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-confirm {
  flex: 1;
  background: #2E6D56;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}
</style>
