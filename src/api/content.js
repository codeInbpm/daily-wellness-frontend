import { request } from '../utils/request.js'

// 丰富的新中式禅意养生语录池（支持海报一键换一言）
export const WELLNESS_QUOTES = [
  "把呼吸放慢，让身体跟上你。",
  "法于阴阳，和于术数，食饮有节，起居有常。",
  "不治已病治未病，不治已乱治未乱。",
  "顺应自然，心定则气和。",
  "心宽一寸，病退三分；身安即是心安。",
  "四季更迭有常，养生贵在知节。",
  "不必一次改变全部。今天，给自己留一点真实的时间。",
  "日出而作，日入而息，养护身心阳气。",
  "饭后百步走，安能胜补药；平心静气，百病自消。",
  "极简养生，从喝好一杯温开水开始。",
  "养生非一日之功，乃点滴日常之积。"
]

/**
 * 随机获取一句养生名言
 */
export function getRandomWellnessQuote(currentQuote) {
  const filtered = WELLNESS_QUOTES.filter(q => q !== currentQuote)
  const idx = Math.floor(Math.random() * filtered.length)
  return filtered[idx] || WELLNESS_QUOTES[0]
}

/**
 * 获取今日灵感短短句/贴士
 */
export function getTodayQuoteApi() {
  return request('/content/today-quote', {
    method: 'GET'
  })
}

/**
 * 获取当前子午流注十二时辰作息提示
 */
export function getCurrentOrganClockApi() {
  return request('/content/organ-clock/current', {
    method: 'GET'
  })
}

/**
 * 获取当前节气
 */
export function getCurrentSolarTermApi() {
  return request('/content/solar-term/current', {
    method: 'GET'
  })
}

/**
 * 获取 24 节气列表
 */
export function getSolarTermListApi() {
  return request('/content/solar-term/list', {
    method: 'GET'
  })
}
