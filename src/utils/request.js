// 每日养生后端 API 统一请求层

const BASE_URL = 'http://localhost:8080/api'

// 内置 Mock 数据后备 (isPreset: 1 为系统预设习惯，不允许删除；isPreset: 0 为用户自定义习惯，允许删除)
let mockHabitsState = [
  { habitId: 1, userHabitId: 1, name: '早起 (7点前)', category: '养', currentStreak: 6, totalCheckins: 24, checked: true, isPreset: 1, status: 1, remark: '清晨顺应阳气升发，做深呼吸5分钟', mediaUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500', mediaType: 'image' },
  { habitId: 2, userHabitId: 2, name: '喝够 8 杯水', category: '水', currentStreak: 4, totalCheckins: 19, checked: true, isPreset: 1, status: 1, remark: '今天喝够了8杯温水', mediaUrl: '', mediaType: 'none' },
  { habitId: 3, userHabitId: 3, name: '散步 30 分钟', category: '行', currentStreak: 4, totalCheckins: 16, checked: false, isPreset: 1, status: 1, remark: '', mediaUrl: '', mediaType: 'none' },
  { habitId: 4, userHabitId: 4, name: '22:30 前睡觉', category: '养', currentStreak: 2, totalCheckins: 12, checked: false, isPreset: 1, status: 1, remark: '', mediaUrl: '', mediaType: 'none' },
  { habitId: 5, userHabitId: 5, name: '饭后散步10分钟', category: '行', currentStreak: 0, totalCheckins: 0, checked: false, isPreset: 1, status: 1, remark: '', mediaUrl: '', mediaType: 'none' }
]

let mockDayDetails = [
  { habitId: 1, name: '早起 (7点前)', category: '养', checkInTime: '06:45', remark: '采补天地清气，做深呼吸5分钟，神清气爽！', mediaUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500', mediaType: 'image' },
  { habitId: 2, name: '喝够 8 杯水', category: '水', checkInTime: '19:30', remark: '小口慢饮，通畅周身水液', mediaUrl: '', mediaType: 'none' }
]

let mockUserSettings = {
  id: 1,
  nickname: '林遥',
  avatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POGEwhegI5B1YfN62/132',
  isVip: 1,
  remindTime: '08:30',
  totalDays: 28,
  completedHabits: 94,
  bestHabit: '早起'
}

export function request(url, options = {}) {
  return new Promise((resolve) => {
    const fullUrl = BASE_URL + url
    const token = uni.getStorageSync('daily_wellness_token') || uni.getStorageSync('token') || ''
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (res.statusCode === 401) {
          uni.$emit('show_login_modal')
          resolve({ code: 401, msg: '未登录或登录已过期' })
          return
        }
        if (res.statusCode === 200 && res.data) {
          resolve(res.data)
        } else {
          resolve(getMock(url, options))
        }
      },
      fail: () => {
        resolve(getMock(url, options))
      }
    })
  })
}

export function uploadFileApi(filePath) {
  return new Promise((resolve) => {
    uni.uploadFile({
      url: BASE_URL + '/common/upload',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res) => {
        try {
          const data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          if (data && data.code === 200) {
            resolve(data)
          } else {
            resolve({ code: 500, msg: (data && data.message) || '上传失败' })
          }
        } catch (e) {
          resolve({ code: 500, msg: '解析上传响应失败' })
        }
      },
      fail: () => {
        // 后端无法连接或未配置 MinIO 时提供默认优雅兜底
        resolve({
          code: 200,
          data: {
            url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500'
          }
        })
      }
    })
  })
}

function getMock(url, options) {
  // 单日打卡明细流水 Mock
  if (url.includes('/habit/day-detail')) {
    return {
      code: 200,
      data: mockDayDetails
    }
  }

  // 习惯更新/暂停归档 Mock
  if (url.includes('/habit/update') && options.method === 'POST') {
    const { habitId, status, customName } = options.data || {}
    const habit = mockHabitsState.find(h => h.habitId === Number(habitId))
    if (habit) {
      if (status !== undefined) habit.status = status
      if (customName) habit.name = customName
    }
    return { code: 200, msg: '更新成功', data: null }
  }

  // 添加习惯 Mock
  if (url.includes('/habit/add') && options.method === 'POST') {
    const name = options.data && options.data.name
    const category = (options.data && options.data.category) || '养'
    const newId = Date.now()
    const newHabit = {
      habitId: newId,
      userHabitId: newId,
      name: name,
      category: category,
      currentStreak: 0,
      totalCheckins: 0,
      checked: false,
      isPreset: 0,
      status: 1,
      remark: '',
      mediaUrl: '',
      mediaType: 'none'
    }
    mockHabitsState.push(newHabit)
    return {
      code: 200,
      msg: '习惯添加成功',
      data: newHabit
    }
  }

  // 删除习惯 Mock
  if (url.includes('/habit/delete') && options.method === 'POST') {
    const habitId = options.data && options.data.habitId
    const habit = mockHabitsState.find(h => h.habitId === Number(habitId))
    if (habit && habit.isPreset === 1) {
      return {
        code: 400,
        msg: '系统预设习惯不允许删除',
        data: null
      }
    }
    mockHabitsState = mockHabitsState.filter(h => h.habitId !== Number(habitId))
    return {
      code: 200,
      msg: '删除成功',
      data: null
    }
  }

  // 打卡 / 取消打卡 (含媒体与心得) Mock
  if (url.includes('/habit/check-in') && options.method === 'POST') {
    const { habitId, remark, mediaUrl, mediaType } = options.data || {}
    const habit = mockHabitsState.find(h => h.habitId === Number(habitId))
    let nowChecked = false
    if (habit) {
      if (remark || mediaUrl) {
        habit.checked = true
        habit.remark = remark || ''
        habit.mediaUrl = mediaUrl || ''
        habit.mediaType = mediaType || 'none'
        nowChecked = true
      } else {
        habit.checked = !habit.checked
        nowChecked = habit.checked
      }

      if (nowChecked) {
        habit.currentStreak += 1
        habit.totalCheckins += 1
        // 同步更新单日流水列表
        const existingDetail = mockDayDetails.find(d => d.habitId === Number(habitId))
        const nowTimeStr = new Date().toTimeString().substring(0, 5)
        if (existingDetail) {
          existingDetail.remark = habit.remark
          existingDetail.mediaUrl = habit.mediaUrl
          existingDetail.mediaType = habit.mediaType
        } else {
          mockDayDetails.push({
            habitId: Number(habitId),
            name: habit.name,
            category: habit.category,
            checkInTime: nowTimeStr,
            remark: habit.remark,
            mediaUrl: habit.mediaUrl,
            mediaType: habit.mediaType
          })
        }
      } else {
        habit.currentStreak = Math.max(0, habit.currentStreak - 1)
        habit.totalCheckins = Math.max(0, habit.totalCheckins - 1)
        mockDayDetails = mockDayDetails.filter(d => d.habitId !== Number(habitId))
      }
    }
    return {
      code: 200,
      msg: nowChecked ? '打卡成功' : '已取消打卡',
      data: { checked: nowChecked, currentStreak: habit ? habit.currentStreak : 1 }
    }
  }

  // 今日习惯列表 Mock
  if (url.includes('/habit/today')) {
    const activeHabits = mockHabitsState.filter(h => h.status !== 0)
    const completedCount = activeHabits.filter(h => h.checked).length
    const totalCount = activeHabits.length
    const progressPercent = totalCount > 0 ? Math.round((completedCount * 100) / totalCount) : 0
    return {
      code: 200,
      data: {
        completedCount,
        totalCount,
        progressPercent,
        habits: activeHabits
      }
    }
  }

  if (url.includes('/shop/products')) {
    const products = [
      { id: 1, title: '九宝人参五宝养生茶包', category: '养生茶包', price: 39.90, originalPrice: 59.00, salesCount: 1280, description: '益气补元，缓解熬夜疲劳，适合工作高压与常熬夜人群。', imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', spec: '15g * 15袋/盒' },
      { id: 2, title: '三清润肺百合菊花茶包', category: '养生茶包', price: 29.90, originalPrice: 45.00, salesCount: 890, description: '润肺止咳，清心祛燥，适合吸烟及咽干口燥人群。', imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500', spec: '10g * 20袋/盒' },
      { id: 3, title: '道地长白山生晒参切片', category: '滋补食材', price: 128.00, originalPrice: 188.00, salesCount: 450, description: '补脾益肺，滋养大元气，可泡水炖汤。', imageUrl: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=500', spec: '50g/罐' },
      { id: 4, title: '宁夏特级特大枸杞粒', category: '滋补食材', price: 48.00, originalPrice: 68.00, salesCount: 2100, description: '滋补肝肾，益精明目，天然免洗粒粒饱满。', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', spec: '250g/罐' },
      { id: 5, title: '南阳蕲艾艾草自发热艾灸贴', category: '艾灸贴', price: 35.00, originalPrice: 49.00, salesCount: 3400, description: '温经通络，祛湿散寒，贴于神阙穴或腰痛处。', imageUrl: 'https://images.unsplash.com/photo-1512290900673-70024fe74923?w=500', spec: '12贴/盒' },
      { id: 6, title: '草本八味引火归元泡脚包', category: '泡脚包', price: 32.00, originalPrice: 45.00, salesCount: 5600, description: '暖足引火下行，安神助眠，改善手脚冰凉。', imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500', spec: '30g * 20包/袋' }
    ]
    return { code: 200, data: products }
  }

  if (url.includes('/consult/topics')) {
    const topics = [
      { id: 1, title: '🌱 湿热体质 1V1 AI 精细复核', tag: '热门咨询', desc: '针对口苦口干、面部油腻、大便黏腻等表现，AI 结合 10 项档案推演祛湿茶饮与日常膳食规避项。', prompt: '请结合我的个人健康档案，深度分析我是否有湿热体质倾斜？平时应该吃什么食疗方祛湿？' },
      { id: 2, title: '🌙 经常熬夜人群 · 护肝与补气血', tag: '作息调理', desc: '长期晚睡耗伤肝血，AI 智伴为您推演丑时（01:00-03:00）睡眠恢复策略与养肝茶饮搭配。', prompt: '我平时经常熬夜，请问如何通过食疗与子午流注时辰来调理睡眠和护肝？' },
      { id: 3, title: '❄️ 阳虚手脚冰凉 · 引火归元温补', tag: '四季温补', desc: '畏寒怕冷、手足不温，AI 为您推荐艾灸穴位（神阙/足三里）与八味草本泡脚包温通方案。', prompt: '我冬天特别怕冷手脚冰凉，AI 智伴能给我推荐一些温通经络与泡脚的简易养生方案吗？' }
    ]
    return { code: 200, data: topics }
  }

  if (url.includes('/consult/ask')) {
    return { code: 200, data: '【养生AI智伴】：已收到您的咨询需求。结合您的个人健康档案与当下时辰，建议每日保持作息规律，晨起小口温水，多食用健脾祛湿食材，身体会逐步恢复安稳流转。' }
  }

  if (url.includes('/food/list')) {
    const list = [
      { id: 1, name: '百合', category: '润肺', nature: '性微寒，味甘', meridians: '归肺、心经', suitableConstitution: '阴虚质、气虚质', effects: '养阴润肺，清心安神。改善干咳无痰、虚烦惊悸、失眠多梦。', bestMatches: '【百合银耳莲子羹】百合15g + 银耳10g + 莲子15g（滋阴润肺安神）；【百合炖鸭汤】（清热润燥）', taboo: '⚠️ 脾胃虚寒、大便溏泻者及风寒感冒初期者不宜过量食用。', icon: '🪷' },
      { id: 2, name: '山药', category: '健脾', nature: '性平，味甘', meridians: '归脾、肺、肾经', suitableConstitution: '气虚质、阳虚质、平和质', effects: '补脾养胃，生津益肺，补肾涩精。温和滋补，不热不燥。', bestMatches: '【山药排骨汤】山药200g + 排骨250g + 枸杞10g（健脾培元）；【山药小米粥】（温胃和中）', taboo: '⚠️ 湿热积滞、实邪便秘者不宜单味大量食用。', icon: '🍠' },
      { id: 3, name: '薏米（薏苡仁）', category: '祛湿', nature: '性微寒，味甘淡', meridians: '归脾、胃、肺经', suitableConstitution: '湿热质、痰湿质', effects: '利水渗湿，健脾止泻，除痹排脓。促进水液代谢，改善面部油腻。', bestMatches: '【薏米红豆汤】炒薏米20g + 赤小豆20g（利水祛湿）；【薏米山药粥】（健脾祛湿）', taboo: '⚠️ 孕妇慎用；津枯血燥及无湿热虚寒者不宜过量饮用。', icon: '🌾' },
      { id: 4, name: '酸枣仁', category: '助眠', nature: '性平，味甘酸', meridians: '归心、肝、胆经', suitableConstitution: '阴虚质、气郁质', effects: '养心补肝，宁心安神，敛汗生津。改善心肝血虚导致的失眠多梦。', bestMatches: '【酸枣仁百合茶】炒酸枣仁10g + 百合10g + 桂圆2颗（睡前1小时饮用，镇静安神）', taboo: '⚠️ 严重实热郁火、有大便腹泻者不宜食用。', icon: '🍒' },
      { id: 5, name: '枸杞子', category: '补气', nature: '性平，味甘', meridians: '归肝、肾经', suitableConstitution: '阴虚质、气虚质', effects: '滋补肝肾，益精明目。缓解眼部干涩疲劳、腰膝酸软。', bestMatches: '【枸杞菊花茶】枸杞10粒 + 杭菊花3朵（清肝明目）；【枸杞炖鸡汤】（补精养血）', taboo: '⚠️ 正在发烧感冒、身体有炎症或腹泻者暂缓服用。', icon: '🔴' },
      { id: 6, name: '赤小豆', category: '祛湿', nature: '性平，味甘酸', meridians: '归心、小肠经', suitableConstitution: '湿热质、痰湿质', effects: '利水消肿，解毒排脓。改善下肢沉重浮肿、湿热蕴结。', bestMatches: '【赤小豆薏米冬瓜汤】赤小豆30g + 炒薏米20g + 冬瓜100g（利水消肿）', taboo: '⚠️ 体瘦尿多者不宜频繁大量食用。', icon: '🫘' },
      { id: 7, name: '银耳', category: '润肺', nature: '性平，味甘淡', meridians: '归肺、胃、肾经', suitableConstitution: '阴虚质、平和质', effects: '滋阴润肺，养胃生津。富有天然植物胶质，滋润皮肤与呼吸道。', bestMatches: '【银耳百合雪梨汤】银耳15g + 雪梨1个 + 冰糖少许（秋季防燥润肺佳品）', taboo: '⚠️ 外感风寒咳嗽及出血症初起者慎用。', icon: '❄️' },
      { id: 8, name: '黄芪', category: '补气', nature: '性微温，味甘', meridians: '归脾、肺经', suitableConstitution: '气虚质、阳虚质', effects: '补气升阳，固表止汗，利水消肿。改善倦怠乏力、易感冒自汗。', bestMatches: '【黄芪当归炖鸡】黄芪15g + 当归5g + 鸡肉300g（气血双补）；【黄芪大枣茶】（升提阳气）', taboo: '⚠️ 阴虚阳亢、湿热内盛、高热咽痛者忌单独大量服用。', icon: '🌿' }
    ]

    // 过滤逻辑
    let filterList = list
    if (url.includes('category=') && !url.includes('category=&') && !url.includes('category=%E5%85%A8%E9%83%A8')) {
      const match = url.match(/category=([^&]+)/)
      if (match && match[1] && decodeURIComponent(match[1]) !== '全部') {
        const cat = decodeURIComponent(match[1])
        filterList = filterList.filter(item => item.category === cat)
      }
    }
    if (url.includes('keyword=') && !url.includes('keyword=&')) {
      const match = url.match(/keyword=([^&]+)/)
      if (match && match[1]) {
        const kw = decodeURIComponent(match[1]).trim()
        filterList = filterList.filter(item => item.name.includes(kw) || item.effects.includes(kw) || item.bestMatches.includes(kw))
      }
    }
    return { code: 200, data: filterList }
  }

  if (url.includes('/ai/chat')) {
    const msg = (options.data && options.data.message) ? options.data.message : ''
    let reply = '【养生AI智伴】：为您收到提示。顺应自然时辰是养生的智慧，现在正是照顾身体的好时机。请放慢呼吸，感受当下肩颈的放松，补充一杯温开水吧。'
    if (msg.includes('熬夜') || msg.includes('晚睡')) {
      reply = '【养生AI智伴】：感受到您近期身体积累的疲惫。熬夜易伤肝胆阴血，当感到困顿，切记不要强撑，可以做三次完整深呼吸，今晚提前15分钟温水泡脚，静卧入睡。'
    } else if (msg.includes('食疗') || msg.includes('吃什么') || msg.includes('饮食')) {
      reply = '【养生AI智伴】：结合您当前的体质画像，建议选择温润脾胃的食材（如山药、百合、冬瓜汤），少食生冷辣刺激物，小口慢饮温开水，保持肠胃运化畅通。'
    } else if (msg.includes('湿热') || msg.includes('体质')) {
      reply = '【养生AI智伴】：针对您的体质特点，日常宜注意居室通风干爽，申时（15:00-17:00）适度散步走气，避免重油重盐，让周身气血自然通畅。'
    }
    return { code: 200, data: reply }
  }

  if (url.includes('/content/organ-clock/current')) {
    const hour = new Date().getHours()
    let map = {}
    if (hour >= 23 || hour < 1) {
      map = { name: '子时', timeRange: '23:00 - 01:00', organ: '胆经当令', advice: '子时大睡，养胆育气。此时宜关灯静卧进入深度睡眠，切忌熬夜。', recommendHabit: '22:30前睡觉' }
    } else if (hour >= 1 && hour < 3) {
      map = { name: '丑时', timeRange: '01:00 - 03:00', organ: '肝经当令', advice: '肝经血归，熟睡排毒。宜保持沉睡状态，养肝明目。', recommendHabit: '22:30前睡觉' }
    } else if (hour >= 3 && hour < 5) {
      map = { name: '寅时', timeRange: '03:00 - 05:00', organ: '肺经当令', advice: '肺朝百脉，深睡息养。此时周身气血重新分配，宜深沉熟睡。', recommendHabit: '深呼吸拉伸' }
    } else if (hour >= 5 && hour < 7) {
      map = { name: '卯时', timeRange: '05:00 - 07:00', organ: '大肠经当令', advice: '大肠清渣，晨起饮水。宜顺利起床，小口饮用一杯35℃温水。', recommendHabit: '早起（7点前）' }
    } else if (hour >= 7 && hour < 9) {
      map = { name: '辰时', timeRange: '07:00 - 09:00', organ: '胃经当令', advice: '辰时吃早餐，营养化气血。胃经最旺，宜吃一顿温润营养的早餐。', recommendHabit: '吃一顿滋养早餐' }
    } else if (hour >= 9 && hour < 11) {
      map = { name: '巳时', timeRange: '09:00 - 11:00', organ: '脾经当令', advice: '脾主运化，动脑专注。气血充盈，是一天中精力最高效的黄金时段。', recommendHabit: '每小时起身拉伸' }
    } else if (hour >= 11 && hour < 13) {
      map = { name: '午时', timeRange: '11:00 - 13:00', organ: '心经当令', advice: '午时小憩，养心养阳。心经当令，宜午饭后小憩20分钟，滋养心气。', recommendHabit: '午时静卧小憩20分钟' }
    } else if (hour >= 13 && hour < 15) {
      map = { name: '未时', timeRange: '13:00 - 15:00', organ: '小肠经当令', advice: '小肠分清浊，补充水分。小肠吸收养分，宜多喝温水促进吸收。', recommendHabit: '喝够8杯水' }
    } else if (hour >= 15 && hour < 17) {
      map = { name: '申时', timeRange: '15:00 - 17:00', organ: '膀胱经当令', advice: '申时饮水，多动走气。体能巅峰期，宜练习八段锦、太极或散步。', recommendHabit: '散步30分钟' }
    } else if (hour >= 17 && hour < 19) {
      map = { name: '酉时', timeRange: '17:00 - 19:00', organ: '肾经当令', advice: '肾藏精气，晚餐宜清淡。肾经当令，晚餐宜七分饱，少吃重油重盐。', recommendHabit: '饭后散步10分钟' }
    } else if (hour >= 19 && hour < 21) {
      map = { name: '戌时', timeRange: '19:00 - 21:00', organ: '心包经当令', advice: '心包护心，静心放松。宜阅读、散步或听放松音乐，保持心情舒畅。', recommendHabit: '记录一件心安小事' }
    } else {
      map = { name: '亥时', timeRange: '21:00 - 23:00', organ: '三焦经当令', advice: '三焦通百脉，睡前泡脚安神。宜用40℃温水泡脚15分钟，准备入睡。', recommendHabit: '睡前泡脚15分钟' }
    }
    return { code: 200, data: map }
  }

  if (url.includes('/content/today-quote')) {
    return {
      code: 200,
      data: {
        title: '慢下来的呼吸法则',
        quote: '把呼吸放慢，让身体跟上你。',
        content: '在下一个任务开始前，先做三次完整深长地呼吸。没有特别的目标，只是把注意力收回到身心里。',
        readTimeMinutes: 1,
        category: '情志'
      }
    }
  }

  if (url.includes('/content/solar-term/current')) {
    return {
      code: 200,
      data: {
        id: 14,
        name: '处暑',
        monthDay: '8月22-24日',
        threeClimates: '一候鹰乃祭鸟；二候天地始肃；三候禾乃登',
        summary: '暑气渐退，宜祛湿防秋燥',
        dietAdvice: '宜吃百合、银耳、鸭肉，少食辛辣',
        livingAdvice: '早睡早起，午休20分钟补充精力',
        exerciseAdvice: '避免大汗淋漓，推荐太极、散步'
      }
    }
  }

  if (url.includes('/auth/update-settings') && options.method === 'POST') {
    const { remindTime } = options.data || {}
    if (remindTime) mockUserSettings.remindTime = remindTime
    return { code: 200, msg: '设置更新成功', data: mockUserSettings }
  }

  if (url.includes('/auth/user-info')) {
    // 动态统计完成习惯总次数与寻找最要节律
    const totalCheckins = mockHabitsState.reduce((sum, h) => sum + (h.totalCheckins || 0), 0)
    let maxCheckin = -1
    let topHabitName = '早起'
    mockHabitsState.forEach(h => {
      if ((h.totalCheckins || 0) > maxCheckin) {
        maxCheckin = h.totalCheckins
        topHabitName = h.name
      }
    })
    mockUserSettings.completedHabits = totalCheckins
    mockUserSettings.bestHabit = topHabitName

    // 获取本地用户头像与昵称
    const localUserStr = uni.getStorageSync('daily_wellness_user_info')
    if (localUserStr) {
      try {
        const u = typeof localUserStr === 'string' ? JSON.parse(localUserStr) : localUserStr
        if (u.nickname) mockUserSettings.nickname = u.nickname
        if (u.avatarUrl) mockUserSettings.avatarUrl = u.avatarUrl
      } catch (e) {}
    }

    return {
      code: 200,
      data: mockUserSettings
    }
  }

  if (url.includes('/subscribe/save')) {
    return { code: 200, msg: '订阅授权记录成功', data: true }
  }

  if (url.includes('/subscribe/send-test')) {
    return {
      code: 200,
      msg: '订阅消息推送成功',
      data: {
        templateId: 'K91dYUNJ6O195FwH596ocLpWpSAS29YM7TUvlCmQ0H8',
        thing1: '处暑',
        thing2: '早睡早起，午休补充精力',
        thing3: '宜吃百合银耳，少食辛辣'
      }
    }
  }

  return { code: 200, data: {} }
}
