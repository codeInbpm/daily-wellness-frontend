/**
 * 「每日养生」全系统皮肤主题响应工具
 */

export const THEME_CONFIGS = {
  default: {
    code: 'default',
    name: '竹青 (默认)',
    switchColor: '#2E6D56',
    tabColor: '#2E6D56'
  },
  warm_apricot: {
    code: 'warm_apricot',
    name: '暖杏 (VIP尊享)',
    switchColor: '#C89B65',
    tabColor: '#C89B65'
  },
  twilight_purple: {
    code: 'twilight_purple',
    name: '暮山紫 (VIP尊享)',
    switchColor: '#6B5B95',
    tabColor: '#6B5B95'
  },
  pine_teal: {
    code: 'pine_teal',
    name: '松柏绿 (VIP尊享)',
    switchColor: '#1A4334',
    tabColor: '#1A4334'
  }
}

/**
 * 获取当前设备保存的主题 class 名称
 */
export function getThemeClass() {
  const code = uni.getStorageSync('user_theme_code') || 'default'
  return `theme-${code}`
}

/**
 * 获取当前主题的 Switch 控件高亮颜色
 */
export function getSwitchColor() {
  const code = uni.getStorageSync('user_theme_code') || 'default'
  return THEME_CONFIGS[code] ? THEME_CONFIGS[code].switchColor : '#2E6D56'
}

/**
 * 页面挂载主题监听器
 */
export function setupThemeListener(vm) {
  if (!vm) return
  vm.themeClass = getThemeClass()
  vm.switchColor = getSwitchColor()

  const onThemeChanged = (newCode) => {
    vm.themeClass = `theme-${newCode}`
    vm.switchColor = THEME_CONFIGS[newCode] ? THEME_CONFIGS[newCode].switchColor : '#2E6D56'
  }

  uni.$on('theme_changed', onThemeChanged)
  return onThemeChanged
}
