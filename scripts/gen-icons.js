const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 如果没有 canvas，用纯 JS 编码极简 81x81 PNG 图标
const targetDir = path.join(__dirname, '../src/static/tabbar');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log('Target directory ready:', targetDir);
