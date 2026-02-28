const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'assets', 'images');

function drawS(ctx, cx, cy, size, color) {
  const s = size / 200;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 40 * s;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(50 * s, -78 * s);
  ctx.bezierCurveTo(30 * s, -100 * s, -65 * s, -102 * s, -60 * s, -58 * s);
  ctx.bezierCurveTo(-52 * s, -15 * s, 62 * s, -10 * s, 58 * s, 35 * s);
  ctx.bezierCurveTo(52 * s, 78 * s, -45 * s, 80 * s, -55 * s, 55 * s);
  ctx.stroke();

  ctx.restore();
}

function drawIcon(size, options = {}) {
  const { transparent = false } = options;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size / 1024;

  const white = '#FFFFFF';
  const brandColor = '#4F46E5';

  // === BACKGROUND (solid brand color — matches website logo) ===
  if (transparent) {
    ctx.clearRect(0, 0, size, size);
  } else {
    ctx.fillStyle = brandColor;
    ctx.fillRect(0, 0, size, size);
  }

  const cx = size / 2;
  const cy = size / 2;

  // === HOUSE OUTLINE (white, thick stroke — the "frame") ===
  const roofPeak = cy - 260 * s;
  const roofOverhang = 290 * s;
  const roofBase = cy - 50 * s;
  const wallLeft = cx - 210 * s;
  const wallRight = cx + 210 * s;
  const wallBottom = cy + 230 * s;

  ctx.strokeStyle = white;
  ctx.lineWidth = 28 * s;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(cx, roofPeak);
  ctx.lineTo(cx + roofOverhang, roofBase);
  ctx.lineTo(wallRight, roofBase);
  ctx.lineTo(wallRight, wallBottom);
  ctx.lineTo(wallLeft, wallBottom);
  ctx.lineTo(wallLeft, roofBase);
  ctx.lineTo(cx - roofOverhang, roofBase);
  ctx.closePath();
  ctx.stroke();

  // === WHITE "S" IN CENTER ===
  drawS(ctx, cx, cy + 75 * s, 260 * s, white);

  return canvas;
}

function drawSolidBackground(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#4F46E5';
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

console.log('Generating icons...');

const icon = drawIcon(1024);
fs.writeFileSync(path.join(OUTPUT_DIR, 'icon.png'), icon.toBuffer('image/png'));
fs.writeFileSync(path.join(OUTPUT_DIR, 'splash-icon.png'), icon.toBuffer('image/png'));

const favicon = drawIcon(48);
fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.png'), favicon.toBuffer('image/png'));

const androidFg = drawIcon(1024, { transparent: true });
fs.writeFileSync(path.join(OUTPUT_DIR, 'android-icon-foreground.png'), androidFg.toBuffer('image/png'));
fs.writeFileSync(path.join(OUTPUT_DIR, 'android-icon-monochrome.png'), androidFg.toBuffer('image/png'));

const androidBg = drawSolidBackground(1024);
fs.writeFileSync(path.join(OUTPUT_DIR, 'android-icon-background.png'), androidBg.toBuffer('image/png'));

console.log('All icons generated!');
