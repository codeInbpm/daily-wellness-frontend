<template>
  <view class="container">
    <!-- 1. 顶部标语与添加按钮 -->
    <view class="header-section">
      <view class="header-text">
        <text class="header-tag">我的节律</text>
        <text class="main-title">习惯，应该像<text class="block-text">呼吸一样自然。</text></text>
        <text class="sub-title">选择几件愿意重复做的小事。它们不需要被完成得漂亮，只需要在今天出现。</text>
      </view>
      <button class="add-btn" @click="openAddModal">
        <text class="add-icon">+</text>
        <text>添加习惯</text>
      </button>
    </view>

    <!-- 2. 正在坚持列表卡片 -->
    <view class="card habit-manage-card">
      <view class="manage-header">
        <view>
          <text class="manage-title">正在坚持</text>
          <text class="manage-desc">{{ habits.length }} 个习惯陪伴你走过今天</text>
        </view>
        <view class="completed-badge">
          <text>{{ completedCount }} 已完成</text>
        </view>
      </view>

      <!-- 空习惯列表提示 -->
      <view v-if="habits.length === 0" class="empty-tip">
        <text class="empty-text">暂时还没有习惯，点击右上角“+ 添加习惯”开启你的养生节律吧～</text>
      </view>

      <view v-else class="habit-list">
        <view 
          v-for="item in habits" 
          :key="item.habitId" 
          class="habit-row"
          :class="{ 'checked-row': item.checked }"
        >
          <view class="row-left">
            <view class="badge-category" :class="getCategoryClass(item.category)">
              {{ item.category || '养' }}
            </view>
            <view class="row-info">
              <text class="row-name" :class="{ 'text-completed': item.checked }">{{ item.name }}</text>
              <text class="row-meta">{{ item.currentStreak }} 日连续 · 累计 {{ item.totalCheckins }} 天</text>
            </view>
          </view>
          
          <view class="row-actions">
            <!-- 打卡状态按钮 -->
            <view class="check-btn" :class="{ checked: item.checked }" @click.stop="toggleCheck(item)">
              <text v-if="item.checked" class="check-icon">✓</text>
            </view>
            <!-- 自定义习惯允许移除/删除 -->
            <view v-if="!item.isPreset" class="delete-btn" @click.stop="confirmDelete(item)" title="移除习惯">
              <text class="delete-icon">✕</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 3. 提示卡片 -->
    <view class="philosophy-card card">
      <view class="philo-header">
        <text class="philo-icon">光</text>
      </view>
      <text class="philo-title">不要追赶习惯，<text class="block-text">让它靠近你。</text></text>
      <text class="philo-desc">一个适合你的习惯，应该让生活变轻，而不是多一项待办。</text>

      <view class="philo-metrics">
        <view class="metric-item">
          <text class="metric-label">建议每日项目</text>
          <text class="metric-val">3 — 5 件</text>
        </view>
        <view class="metric-item">
          <text class="metric-label">最重要的指标</text>
          <text class="metric-val">愿意回来</text>
        </view>
      </view>
    </view>

    <!-- 4. 新增习惯弹窗 (包含 7 大分类挑选) -->
    <view v-if="showModal" class="modal-mask" @click="closeModal">
      <view class="modal-card" @click.stop>
        <text class="modal-title">创建我的养生习惯</text>
        
        <view class="form-group">
          <text class="form-label">习惯分类</text>
          <view class="cat-chips">
            <view 
              v-for="cat in categoryList" 
              :key="cat"
              class="cat-chip"
              :class="{ active: selectedCategory === cat }"
              @click="selectedCategory = cat"
            >
              <text>{{ cat }}</text>
            </view>
          </view>
        </view>

        <view class="form-group">
          <text class="form-label">习惯名称</text>
          <input 
            v-model="inputName" 
            class="form-input" 
            placeholder="例如：睡前泡脚15分钟"
          />
        </view>

        <view class="modal-actions">
          <button class="btn-cancel" @click="closeModal">取消</button>
          <button class="btn-submit" @click="submitAddHabit">确定添加</button>
        </view>
      </view>
    </view>

    <!-- 全局登录模态框 -->
    <login-modal />
  </view>
</template>

<script>
import { getTodayHabitsApi, checkInApi, addHabitApi, deleteHabitApi } from '../../api/habit.js'
import { checkLogin } from '../../utils/auth.js'
export default {
  data() {
    return {
      habits: [],
      completedCount: 0,
      showModal: false,
      inputName: '',
      selectedCategory: '养',
      categoryList: ['养', '水', '行', '息', '温', '食', '心']
    }
  },
  onShow() {
    this.loadHabits()
  },
  methods: {
    async loadHabits() {
      const res = await getTodayHabitsApi(1)
      if (res && res.data) {
        this.habits = res.data.habits || []
        this.completedCount = res.data.completedCount || 0
      }
    },
    async toggleCheck(item) {
      if (!checkLogin()) return
      item.checked = !item.checked
      if (item.checked) {
        this.completedCount++
        item.currentStreak++
      } else {
        this.completedCount = Math.max(0, this.completedCount - 1)
        item.currentStreak = Math.max(0, item.currentStreak - 1)
      }
      await checkInApi(1, item.habitId)
      uni.$emit('habit_status_changed')

      // 成功打卡时自动保持订阅提醒额度，无需手动反复开关
      if (item.checked) {
        uni.requestSubscribeMessage({
          tmplIds: ['K91dYUNJ6O195FwH596ocLpWpSAS29YM7TUvlCmQ0H8'],
          fail: () => {}
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
    },
    openAddModal() {
      if (!checkLogin()) return
      this.inputName = ''
      this.selectedCategory = '养'
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
    },
    async submitAddHabit() {
      if (!this.inputName || !this.inputName.trim()) {
        uni.showToast({ title: '请输入习惯名称', icon: 'none' })
        return
      }

      uni.showLoading({ title: '添加中...' })
      const res = await addHabitApi(1, this.inputName.trim(), this.selectedCategory)
      uni.hideLoading()

      if (res && res.code === 200) {
        uni.showToast({ title: '新增成功', icon: 'success' })
        this.closeModal()
        this.loadHabits()
      } else {
        uni.showToast({ title: res?.msg || '添加失败', icon: 'none' })
      }
    },
    confirmDelete(item) {
      uni.showModal({
        title: '提示',
        content: `确定要移除习惯“${item.name}”吗？`,
        confirmColor: '#DC2626',
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '移除中...' })
            const delRes = await deleteHabitApi(1, item.habitId)
            uni.hideLoading()

            if (delRes && delRes.code === 200) {
              uni.showToast({ title: '已移除该习惯', icon: 'success' })
              this.loadHabits()
            } else {
              uni.showToast({ title: '移除失败', icon: 'none' })
            }
          }
        }
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

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40rpx;
}

.header-tag {
  font-size: 24rpx;
  color: #2E6D56;
  font-weight: 500;
  display: block;
}

.main-title {
  font-size: 46rpx;
  font-weight: 600;
  color: #2C3531;
  line-height: 1.3;
  margin-top: 12rpx;
  display: block;
}

.block-text {
  display: block;
}

.sub-title {
  font-size: 26rpx;
  color: #7A8B82;
  margin-top: 16rpx;
  line-height: 1.6;
  max-width: 460rpx;
  display: block;
}

.add-btn {
  background-color: #2E6D56;
  color: #FFFFFF;
  border-radius: 40rpx;
  padding: 16rpx 28rpx;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8rpx;
  border: none;
  box-shadow: 0 4rpx 16rpx rgba(46, 109, 86, 0.2);
}

.add-icon {
  font-size: 32rpx;
}

.card {
  background-color: #FFFFFF;
  border-radius: 28rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.habit-manage-card {
  padding: 40rpx 32rpx;
}

.manage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
}

.manage-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
}

.manage-desc {
  font-size: 24rpx;
  color: #A3B1A9;
  margin-top: 6rpx;
  display: block;
}

.completed-badge {
  background-color: #EBF3EF;
  color: #2E6D56;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.empty-tip {
  padding: 60rpx 20rpx;
  text-align: center;
}

.empty-text {
  font-size: 26rpx;
  color: #A3B1A9;
}

.habit-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.habit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #FAF8F3;
  padding: 24rpx 24rpx;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  transition: all 0.25s ease;
}

.habit-row.checked-row {
  background-color: #F0F7F3;
  border-color: rgba(46, 109, 86, 0.15);
}

.row-left {
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

.row-info {
  display: flex;
  flex-direction: column;
}

.row-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #2C3531;
}

.row-name.text-completed {
  color: #7A8B82;
  text-decoration: line-through;
}

.row-meta {
  font-size: 22rpx;
  color: #7A8B82;
  margin-top: 4rpx;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

/* 勾选复选框 */
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
  background-color: #2E6D56;
  border-color: #2E6D56;
  transform: scale(1.08);
}

.check-icon {
  color: #FFFFFF;
  font-size: 30rpx;
  font-weight: bold;
}

/* 删除按钮 */
.delete-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background-color: rgba(220, 38, 38, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-icon {
  font-size: 22rpx;
  color: #DC2626;
  font-weight: bold;
}

/* 弹窗蒙层 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.modal-card {
  width: 100%;
  max-width: 580rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 44rpx 36rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #2C3531;
  display: block;
  margin-bottom: 32rpx;
  text-align: center;
}

.form-group {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 24rpx;
  color: #7A8B82;
  margin-bottom: 12rpx;
  display: block;
}

.cat-chips {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.cat-chip {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #F2EFEE;
  color: #555555;
  font-size: 26rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.cat-chip.active {
  background: #2E6D56;
  color: #FFFFFF;
  transform: scale(1.08);
}

.form-input {
  background: #FAF8F3;
  border: 1px solid #E6E2D8;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  font-size: 28rpx;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.btn-cancel {
  flex: 1;
  background: #FAF8F3;
  color: #7A8B82;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.btn-submit {
  flex: 1;
  background: #2E6D56;
  color: #FFFFFF;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
}

/* 哲学提示卡片 */
.philosophy-card {
  background-color: #F5EFE6;
  padding: 40rpx 36rpx;
  border: none;
  margin-top: 24rpx;
}

.philo-header {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #C79A5E;
}

.philo-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #4A3A2C;
  line-height: 1.35;
  margin-top: 28rpx;
  display: block;
}

.philo-desc {
  font-size: 26rpx;
  color: #7A6958;
  margin-top: 16rpx;
  display: block;
}

.philo-metrics {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 36rpx;
  padding-top: 24rpx;
  border-top: 1px dashed rgba(122, 105, 88, 0.2);
}

.metric-item {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
}

.metric-label {
  color: #9E8B78;
}

.metric-val {
  color: #4A3A2C;
  font-weight: 600;
}
</style>
