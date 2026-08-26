const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 计算表
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4);
  data.copy(buf, 8);
  const crcVal = crc32(buf.slice(4, 8 + len));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

function generatePNG(width, height, drawPixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // IDAT
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      const idx = 1 + x * 4;
      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }
  const uncompressed = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(uncompressed);
  const idatChunk = createChunk('IDAT', compressed);
  
  // IEND
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// 辅助绘制逻辑：解析颜色 HEX (#RRGGBB)
function hexToRgba(hex, alpha = 255) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b, alpha];
}

const colorNormal = '#7A8B82';
const colorActive = '#2E6D56';

// 几何工具
function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// 图标绘制像素函数集合 (81x81)
const icons = {
  // 1. 今日：日出 / 太阳
  today: (x, y, w, h, hex) => {
    const cx = 40, cy = 40;
    const r = dist(x, y, cx, cy);
    // 圆圈
    if (r >= 14 && r <= 18) return hexToRgba(hex);
    // 中心实心圆点
    if (r <= 6) return hexToRgba(hex);
    // 4个方向光芒
    if ((Math.abs(x - cx) <= 2 && (y >= 10 && y <= 16 || y >= 64 && y <= 70)) ||
        (Math.abs(y - cy) <= 2 && (x >= 10 && x <= 16 || x >= 64 && x <= 70))) {
      return hexToRgba(hex);
    }
    return [0, 0, 0, 0];
  },
  
  // 2. 习惯：禅叶 / 芽
  habit: (x, y, w, h, hex) => {
    const cx = 40, cy = 44;
    // 绘制叶子轮廓
    const dx = x - cx;
    const dy = y - cy;
    // 简易叶子形状
    if (dy <= 16 && dy >= -24) {
      const maxWidth = 16 * (1 - Math.pow((dy + 4) / 20, 2));
      if (maxWidth > 0 && Math.abs(dx) <= maxWidth) {
        // 叶脉
        if (Math.abs(dx) <= 1 || (dy > -10 && Math.abs(dx - (dy + 10)*0.5) <= 1)) {
          return hexToRgba(hex, 255);
        }
        return hexToRgba(hex, 200);
      }
    }
    // 茎部
    if (dy > 16 && dy <= 26 && Math.abs(dx) <= 2) {
      return hexToRgba(hex);
    }
    return [0, 0, 0, 0];
  },

  // 3. 日历：方框与顶部两挂钩
  calendar: (x, y, w, h, hex) => {
    // 挂钩
    if ((x >= 24 && x <= 28 || x >= 52 && x <= 56) && y >= 14 && y <= 22) {
      return hexToRgba(hex);
    }
    // 日历主体
    if (x >= 16 && x <= 64 && y >= 22 && y <= 66) {
      // 边框
      if (x <= 20 || x >= 60 || y <= 26 || y >= 62 || (y >= 34 && y <= 36)) {
        return hexToRgba(hex);
      }
      // 网格点
      const gx = (x - 24) % 10;
      const gy = (y - 40) % 10;
      if (gx >= 0 && gx <= 3 && gy >= 0 && gy <= 3 && y >= 40 && y <= 58 && x >= 24 && x <= 56) {
        return hexToRgba(hex);
      }
    }
    return [0, 0, 0, 0];
  },

  // 4. 养生志：书本 / 典籍
  knowledge: (x, y, w, h, hex) => {
    // 开放书页
    if (y >= 20 && y <= 62 && x >= 16 && x <= 64) {
      // 中线
      if (Math.abs(x - 40) <= 2) return hexToRgba(hex);
      // 书页边框
      if (y <= 24 || y >= 58 || x <= 20 || x >= 60) return hexToRgba(hex);
      // 内部书页线条
      if ((y === 32 || y === 40 || y === 48) && (x >= 24 && x <= 34 || x >= 46 && x <= 56)) {
        return hexToRgba(hex);
      }
    }
    return [0, 0, 0, 0];
  },

  // 5. 我的：人物圆头与肩半圆
  profile: (x, y, w, h, hex) => {
    const cx = 40;
    // 头部圆
    const rHead = dist(x, y, cx, 28);
    if (rHead <= 11) return hexToRgba(hex);
    
    // 身体肩膀弧度
    if (y >= 46 && y <= 66) {
      const bodyWidth = 24 * Math.sqrt(1 - Math.pow((y - 66) / 20, 2));
      if (Math.abs(x - cx) <= bodyWidth) return hexToRgba(hex);
    }
    return [0, 0, 0, 0];
  }
};

const outputDir = path.join(__dirname, '../src/static/tabbar');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const list = ['today', 'habit', 'calendar', 'knowledge', 'profile'];
list.forEach(name => {
  const drawFn = icons[name];
  // normal
  const bufNormal = generatePNG(81, 81, (x, y, w, h) => drawFn(x, y, w, h, colorNormal));
  fs.writeFileSync(path.join(outputDir, `${name}.png`), bufNormal);

  // active
  const bufActive = generatePNG(81, 81, (x, y, w, h) => drawFn(x, y, w, h, colorActive));
  fs.writeFileSync(path.join(outputDir, `${name}-active.png`), bufActive);
  console.log(`Generated ${name}.png & ${name}-active.png`);
});
