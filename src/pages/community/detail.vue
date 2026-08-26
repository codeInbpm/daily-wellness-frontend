<template>
  <view class="container">
    <view class="post-detail-card" v-if="post">
      <!-- 发布者信息 -->
      <view class="user-row">
        <image class="avatar" :src="post.userAvatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ post.userNickname }}</text>
          <text class="post-time">{{ formatDate(post.createdAt) }}</text>
        </view>
        <text class="habit-tag" v-if="post.habitName"># {{ post.habitName }}</text>
      </view>

      <text class="post-content">{{ post.content }}</text>

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

      <view class="detail-actions">
        <button class="like-btn" :class="{ liked: post.isLiked }" @click="handleLike">
          {{ post.isLiked ? '❤️ 已赞' : '🤍 点赞' }} ({{ post.likeCount || 0 }})
        </button>
      </view>
    </view>

    <!-- 评论列表 -->
    <view class="comments-section">
      <view class="sec-title">💬 评论交流 ({{ commentList.length }})</view>

      <view v-for="c in commentList" :key="c.id" class="comment-item">
        <image class="c-avatar" :src="c.userAvatar" mode="aspectFill" />
        <view class="c-body">
          <view class="c-header">
            <text class="c-nickname">{{ c.userNickname }}</text>
            <text class="c-time">{{ formatDate(c.createdAt) }}</text>
          </view>
          <text class="c-content">{{ c.content }}</text>
        </view>
      </view>

      <view class="empty-text" v-if="commentList.length === 0">抢首沙发发表第一条回复吧~</view>
    </view>

    <!-- 底部输入框 -->
    <view class="input-bar">
      <input class="comment-input" v-model="newComment" placeholder="发表温情回复..." />
      <button class="send-btn" @click="sendComment">发送</button>
    </view>
  </view>
</template>

<script>
import { getPostCommentsApi, addPostCommentApi, toggleLikePostApi, getPostListApi } from '../../api/community.js'

export default {
  data() {
    return {
      postId: null,
      post: null,
      commentList: [],
      newComment: ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.postId = options.id
      this.loadData()
    }
  },
  methods: {
    async loadData() {
      // 加载评论
      const res = await getPostCommentsApi(this.postId)
      if (res && res.data) {
        this.commentList = res.data
      }

      // 获取当前动态信息
      const listRes = await getPostListApi(1, 1, 50)
      if (listRes && listRes.data && listRes.data.records) {
        this.post = listRes.data.records.find(item => item.id == this.postId)
      }
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
    async handleLike() {
      if (!this.post) return
      const res = await toggleLikePostApi(this.post.id, 1)
      if (res && res.code === 200) {
        this.post.isLiked = res.data
        if (res.data) this.post.likeCount += 1
        else this.post.likeCount = Math.max(0, this.post.likeCount - 1)
      }
    },
    async sendComment() {
      if (!this.newComment.trim()) return
      const res = await addPostCommentApi(this.postId, {
        userId: 1,
        content: this.newComment
      })
      if (res && res.code === 200) {
        this.newComment = ''
        uni.showToast({ title: '评论成功', icon: 'none' })
        this.loadData()
      }
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
  padding-bottom: 120rpx;
  background-color: #F7F5F0;
  min-height: 100vh;
}

.post-detail-card {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
  margin-bottom: 28rpx;
}

.user-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 26rpx;
  font-weight: bold;
  color: #2C3531;
  display: block;
}

.post-time {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.habit-tag {
  background: #EBF3EF;
  color: #2E6D56;
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 12rpx;
  font-weight: bold;
}

.post-content {
  font-size: 28rpx;
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

.detail-actions {
  margin-top: 24rpx;
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  background: #FAF8F3;
  color: #555;
  font-size: 22rpx;
  border-radius: 30rpx;
  padding: 0 24rpx;
}

.like-btn.liked {
  background: #FDE8E8;
  color: #E57373;
}

.comments-section {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
}

.sec-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2C3531;
  margin-bottom: 20rpx;
}

.comment-item {
  display: flex;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1px solid #F5F5F5;
}

.c-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
}

.c-body {
  flex: 1;
}

.c-header {
  display: flex;
  justify-content: space-between;
}

.c-nickname {
  font-size: 24rpx;
  font-weight: bold;
  color: #555;
}

.c-time {
  font-size: 20rpx;
  color: #AAA;
}

.c-content {
  font-size: 25rpx;
  color: #333;
  margin-top: 8rpx;
  display: block;
}

.empty-text {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 40rpx 0;
}

.input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  padding: 16rpx 32rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0,0,0,0.05);
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.comment-input {
  flex: 1;
  background: #F7F5F0;
  border-radius: 30rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
}

.send-btn {
  background: #2E6D56;
  color: #FFFFFF;
  font-size: 24rpx;
  border-radius: 30rpx;
  padding: 0 32rpx;
  height: 60rpx;
  line-height: 60rpx;
}
</style>
