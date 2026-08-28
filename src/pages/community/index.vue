<template>
  <view :class="['container', themeClass]">
    <!-- 头部引导 Banner -->
    <view class="header-card">
      <view class="header-info">
        <text class="header-title">🍃 养生打卡圈</text>
        <text class="header-sub">分享每日养生餐与调理心得，交流互助</text>
      </view>
      <button class="pub-btn" @click="goToPublish">✍️ 发布打卡</button>
    </view>

    <!-- 关联习惯主题滚动筛选 Filter -->
    <scroll-view class="habit-filter-scroll" scroll-x>
      <view 
        v-for="habit in filterHabitOptions" 
        :key="habit"
        class="filter-chip"
        :class="{ active: selectedHabitFilter === habit }"
        @click="changeHabitFilter(habit)"
      >
        <text>{{ habit }}</text>
      </view>
    </scroll-view>

    <!-- 社区动态列表 -->
    <view class="post-list">
      <view v-for="post in postList" :key="post.id" class="post-card">
        <!-- 用户信息与操作按钮 -->
        <view class="user-row">
          <image class="avatar" :src="post.userAvatar" mode="aspectFill" />
          <view class="user-info">
            <view class="name-line">
              <text class="nickname">{{ post.userNickname }}</text>
              <text class="private-badge" v-if="post.isPrivate === 1">🔒 仅自己可见</text>
            </view>
            <text class="post-time">{{ formatDate(post.createdAt) }}</text>
          </view>

          <!-- 习惯标签 -->
          <text class="habit-tag" v-if="post.habitName"># {{ post.habitName }}</text>

          <!-- 如果是本人发布的动态，显示更多管理操作（设为私密 / 删除） -->
          <view class="more-opt-btn" v-if="post.userId === currentUserId" @click="showPostManageSheet(post)">
            •••
          </view>
        </view>

        <!-- 动态正文 -->
        <text class="post-content">{{ post.content }}</text>

        <!-- 配图预览 (九宫格) -->
        <view class="image-grid" v-if="parseImages(post.images).length > 0">
          <image 
            v-for="(img, idx) in parseImages(post.images)" 
            :key="idx" 
            class="grid-img" 
            :src="img" 
            mode="aspectFill"
            @click="previewImage(parseImages(post.images), idx)"
          />
        </view>

        <!-- 底部点赞与评论互动栏 -->
        <view class="post-footer">
          <view class="action-item" @click="handleLike(post)">
            <text class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</text>
            <text class="action-count" :class="{ liked: post.isLiked }">{{ post.likeCount || 0 }}</text>
          </view>
          <view class="action-item" @click="goToDetail(post)">
            <text class="action-icon">💬</text>
            <text class="action-count">{{ post.commentCount || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-box" v-if="postList.length === 0">
      <text class="empty-text">该习惯主题下暂无动态，快去发布第一条打卡吧~</text>
    </view>
  </view>
</template>

<script>
import { getPostListApi, toggleLikePostApi, deletePostApi, togglePrivacyApi } from '../../api/community.js'
import { setupThemeListener, getThemeClass } from '../../utils/theme.js'

export default {
  data() {
    return {
      currentUserId: 1, // 当前登录用户ID
      selectedHabitFilter: '全部',
      filterHabitOptions: ['全部', '睡前泡脚 15 分钟', '喝够 8 杯水', '散步 30 分钟', '吃一顿滋养早餐', '22:30 前睡觉'],
      postList: [],
      themeClass: getThemeClass()
    }
  },
  mounted() {
    setupThemeListener(this)
  },
  onShow() {
    this.loadPosts()
  },
  methods: {
    async loadPosts() {
      const habitParam = this.selectedHabitFilter === '全部' ? '' : this.selectedHabitFilter
      const res = await getPostListApi(this.currentUserId, habitParam, 1, 30)
      if (res && res.data && res.data.records) {
        this.postList = res.data.records
      } else {
        this.postList = []
      }
    },
    changeHabitFilter(habit) {
      this.selectedHabitFilter = habit
      this.loadPosts()
    },
    parseImages(jsonStr) {
      if (!jsonStr) return []
      try {
        return JSON.parse(jsonStr)
      } catch (e) {
        return []
      }
    },
    previewImage(urls, currentIdx) {
      uni.previewImage({ urls, current: currentIdx })
    },
    async handleLike(post) {
      const res = await toggleLikePostApi(post.id, this.currentUserId)
      if (res && res.code === 200) {
        post.isLiked = res.data
        if (res.data) {
          post.likeCount += 1
          uni.showToast({ title: '点赞成功', icon: 'none' })
        } else {
          post.likeCount = Math.max(0, post.likeCount - 1)
        }
      }
    },
    // 管理自己发布的动态（删除 / 切换私密状态）
    showPostManageSheet(post) {
      const privacyText = post.isPrivate === 1 ? '设为公开' : '设为私密'
      uni.showActionSheet({
        itemList: [privacyText, '🗑️ 删除该动态'],
        itemColor: '#2C3531',
        success: async (res) => {
          if (res.tapIndex === 0) {
            // 切换私密状态
            const targetPrivate = post.isPrivate === 1 ? 0 : 1
            const pRes = await togglePrivacyApi(post.id, targetPrivate, this.currentUserId)
            if (pRes && pRes.code === 200) {
              post.isPrivate = targetPrivate
              uni.showToast({ title: targetPrivate === 1 ? '已设为私密' : '已设为公开', icon: 'success' })
            }
          } else if (res.tapIndex === 1) {
            // 二次确认删除
            uni.showModal({
              title: '确认删除',
              content: '确定要删除这条养生打卡动态吗？',
              success: async (mRes) => {
                if (mRes.confirm) {
                  const dRes = await deletePostApi(post.id, this.currentUserId)
                  if (dRes && dRes.code === 200) {
                    uni.showToast({ title: '已删除动态', icon: 'success' })
                    this.loadPosts()
                  }
                }
              }
            })
          }
        }
      })
    },
    goToDetail(post) {
      uni.navigateTo({ url: `/pages/community/detail?id=${post.id}` })
    },
    goToPublish() {
      uni.navigateTo({ url: '/pages/community/publish' })
    },
    formatDate(dateStr) {
      if (!dateStr) return '刚刚'
      return dateStr.substring(0, 16).replace('T', ' ')
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
  background: var(--color-banner-gradient);
  border-radius: 28rpx;
  padding: 32rpx;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  display: block;
}

.header-sub {
  font-size: 22rpx;
  opacity: 0.85;
  margin-top: 4rpx;
  display: block;
}

.pub-btn {
  background: #C89B65;
  color: #FFFFFF;
  font-size: 24rpx;
  padding: 0 24rpx;
  height: 60rpx;
  line-height: 60rpx;
  border-radius: 30rpx;
  font-weight: bold;
}

/* 习惯筛选滚动横条 */
.habit-filter-scroll {
  white-space: nowrap;
  width: 100%;
  margin-bottom: 24rpx;
}

.filter-chip {
  display: inline-block;
  padding: 10rpx 28rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  margin-right: 16rpx;
  font-size: 24rpx;
  color: #5A6B62;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
}

.filter-chip.active {
  background: var(--color-primary);
  color: #FFFFFF;
  font-weight: bold;
}

.post-card {
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(46, 74, 59, 0.05);
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  position: relative;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
}

.user-info {
  flex: 1;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.nickname {
  font-size: 26rpx;
  font-weight: bold;
  color: #2C3531;
}

.private-badge {
  background: #FFF3E0;
  color: #E65100;
  font-size: 18rpx;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.post-time {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.habit-tag {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

.more-opt-btn {
  font-size: 32rpx;
  color: #999;
  padding: 0 12rpx;
}

.post-content {
  font-size: 26rpx;
  color: #444;
  line-height: 1.6;
  margin-top: 20rpx;
  display: block;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 20rpx;
}

.grid-img {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
}

.post-footer {
  display: flex;
  gap: 40rpx;
  margin-top: 24rpx;
  padding-top: 16rpx;
  border-top: 1px solid #F5F5F5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.action-icon {
  font-size: 28rpx;
}

.action-count {
  font-size: 22rpx;
  color: #7A8B82;
}

.action-count.liked {
  color: #E57373;
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
