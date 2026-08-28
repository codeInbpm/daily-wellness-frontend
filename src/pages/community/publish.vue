<template>
  <view class="container">
    <view class="card pub-card">
      <textarea 
        class="pub-textarea" 
        v-model="content" 
        placeholder="分享你今天的养生餐食、练习心得或养生心得吧..."
        maxlength="500"
      />
      
      <!-- 关联打卡习惯选择 -->
      <view class="habit-picker-row">
        <text class="picker-label">🏷️ 关联打卡习惯：</text>
        <picker mode="selector" :range="habitOptions" @change="onHabitChange">
          <view class="picker-val">{{ selectedHabitName || '点击选择习惯 (可选)' }}</view>
        </picker>
      </view>

      <!-- 可见性/私密开关设置 -->
      <view class="privacy-switch-row">
        <view class="privacy-left">
          <text class="picker-label">🔒 设置为私密动态：</text>
          <text class="privacy-desc">仅自己可见，不公开发布至打卡圈广场</text>
        </view>
        <switch :checked="isPrivate === 1" @change="onPrivacyChange" color="#2E6D56"/>
      </view>

      <!-- 原生上传图片/视频 (对接 MinIO) -->
      <view class="media-upload-section">
        <text class="picker-label">📷 养生配图 / 视频 (上传至 MinIO)：</text>
        <view class="media-grid">
          <!-- 已上传图片列表 -->
          <view v-for="(img, idx) in imageList" :key="idx" class="media-item">
            <image class="preview-img" :src="img" mode="aspectFill" />
            <view class="delete-icon" @click="removeImage(idx)">✕</view>
          </view>

          <!-- 上传加号按钮 -->
          <view class="upload-btn-box" v-if="imageList.length < 9" @click="chooseMedia">
            <text class="plus-icon">+</text>
            <text class="upload-text">点击上传</text>
          </view>
        </view>
      </view>

      <button class="submit-btn" @click="handleSubmit">发布动态</button>
    </view>

    <!-- 全局登录模态框 -->
    <login-modal />
  </view>
</template>

<script>
import { createPostApi } from '../../api/community.js'
import { uploadFileApi } from '../../utils/request.js'
import { checkLogin, getUserInfo } from '../../utils/auth.js'
export default {
  data() {
    return {
      content: '',
      imageList: [],
      selectedHabitName: '',
      isPrivate: 0, // 0-公开 1-私密
      habitOptions: ['睡前泡脚 15 分钟', '喝够 8 杯水', '散步 30 分钟', '吃一顿滋养早餐', '22:30 前睡觉']
    }
  },
  mounted() {
    const isGlobalPrivate = uni.getStorageSync('global_private_mode')
    if (isGlobalPrivate) {
      this.isPrivate = 1
      uni.showToast({ title: '已开启私密模式，本次打卡默认仅自己可见', icon: 'none', duration: 2500 })
    }
  },
  methods: {
    onHabitChange(e) {
      const idx = e.detail.value
      this.selectedHabitName = this.habitOptions[idx]
    },
    onPrivacyChange(e) {
      this.isPrivate = e.detail.value ? 1 : 0
    },
    // 选择本地图片/视频并上传到 MinIO
    chooseMedia() {
      if (!checkLogin()) return
      uni.chooseImage({
        count: 9 - this.imageList.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePaths = res.tempFilePaths
          uni.showLoading({ title: '上传中...' })
          for (let path of tempFilePaths) {
            try {
              const uploadRes = await uploadFileApi(path)
              if (uploadRes && uploadRes.data && uploadRes.data.url) {
                this.imageList.push(uploadRes.data.url)
              }
            } catch (e) {
              console.error('上传失败', e)
            }
          }
          uni.hideLoading()
        }
      })
    },
    removeImage(idx) {
      this.imageList.splice(idx, 1)
    },
    async handleSubmit() {
      if (!checkLogin()) return
      if (!this.content.trim()) {
        uni.showToast({ title: '请输入动态内容', icon: 'none' })
        return
      }

      const userInfo = getUserInfo()
      const userId = (userInfo && userInfo.id) ? userInfo.id : 1
      const imagesJson = JSON.stringify(this.imageList)

      const res = await createPostApi({
        userId,
        content: this.content,
        images: imagesJson,
        habitName: this.selectedHabitName,
        isPrivate: this.isPrivate
      })

      if (res && res.code === 200) {
        uni.showToast({ title: this.isPrivate === 1 ? '私密发布成功' : '发布成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      } else {
        uni.showToast({ title: res.message || '发布失败', icon: 'none' })
      }
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

.pub-card {
  background: #FFFFFF;
  border-radius: 28rpx;
  padding: 32rpx;
}

.pub-textarea {
  width: 100%;
  height: 200rpx;
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

.habit-picker-row, .privacy-switch-row, .media-upload-section {
  margin-top: 28rpx;
  padding-top: 20rpx;
  border-top: 1px solid #F0F0F0;
}

.privacy-switch-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-label {
  font-size: 24rpx;
  color: #7A8B82;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: block;
}

.privacy-desc {
  font-size: 20rpx;
  color: #999;
  display: block;
}

.picker-val {
  font-size: 26rpx;
  color: #2E6D56;
  background: #EBF3EF;
  padding: 12rpx 20rpx;
  border-radius: 12rpx;
}

/* 媒体多图/视频上传网格 */
.media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 12rpx;
}

.media-item {
  position: relative;
  width: 180rpx;
  height: 180rpx;
}

.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
}

.delete-icon {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: rgba(0, 0, 0, 0.6);
  color: #FFFFFF;
  width: 36rpx;
  height: 36rpx;
  border-radius: 18rpx;
  text-align: center;
  line-height: 34rpx;
  font-size: 20rpx;
}

.upload-btn-box {
  width: 180rpx;
  height: 180rpx;
  background: #FAF8F3;
  border: 2rpx dashed #2E6D56;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.plus-icon {
  font-size: 44rpx;
  color: #2E6D56;
  line-height: 1;
}

.upload-text {
  font-size: 20rpx;
  color: #7A8B82;
  margin-top: 8rpx;
}

.submit-btn {
  background: #2E6D56;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 40rpx;
  margin-top: 40rpx;
}
</style>
