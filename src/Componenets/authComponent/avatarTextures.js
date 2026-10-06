import * as THREE from 'three';

/**
 * Procedural Studio Environment Map Generator
 * Creates an HDR-like studio environment with overhead & side softboxes
 * so that PBR materials reflect realistic photographer lighting and window panels.
 */
export function generateStudioEnvironment(renderer) {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Dark studio gradient background (deep navy-gray)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#10141e');
    bgGrad.addColorStop(0.4, '#1b2230');
    bgGrad.addColorStop(0.7, '#141822');
    bgGrad.addColorStop(1, '#0b0d13');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 1. Top Overhead Softbox (Large rectangular high-key diffuse light)
    const topGrad = ctx.createRadialGradient(width * 0.5, height * 0.15, 20, width * 0.5, height * 0.15, 220);
    topGrad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    topGrad.addColorStop(0.3, 'rgba(250, 252, 255, 0.85)');
    topGrad.addColorStop(0.7, 'rgba(220, 235, 255, 0.35)');
    topGrad.addColorStop(1, 'rgba(200, 220, 255, 0.0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(width * 0.2, 0, width * 0.6, height * 0.35);

    // 2. Left Main Softbox Window (4-pane photography window panel like in reference image)
    const windowX = width * 0.18;
    const windowY = height * 0.38;
    const paneW = 55;
    const paneH = 45;
    const gap = 8;

    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#ffffff';

    // 4 Panes of the softbox window
    ctx.fillRect(windowX, windowY, paneW, paneH);
    ctx.fillRect(windowX + paneW + gap, windowY, paneW, paneH);
    ctx.fillRect(windowX, windowY + paneH + gap, paneW, paneH);
    ctx.fillRect(windowX + paneW + gap, windowY + paneH + gap, paneW, paneH);
    ctx.restore();

    // 3. Right Fill Softbox (Slightly cooler cyan-blue soft panel)
    const rightGrad = ctx.createLinearGradient(width * 0.75, 0, width * 0.95, 0);
    rightGrad.addColorStop(0, 'rgba(160, 210, 255, 0)');
    rightGrad.addColorStop(0.5, 'rgba(220, 240, 255, 0.7)');
    rightGrad.addColorStop(1, 'rgba(180, 220, 255, 0)');
    ctx.fillStyle = rightGrad;
    ctx.fillRect(width * 0.75, height * 0.25, width * 0.2, height * 0.5);

    // 4. Floor Soft Bounce (Warm neutral ground rim)
    const floorGrad = ctx.createLinearGradient(0, height * 0.85, 0, height);
    floorGrad.addColorStop(0, 'rgba(15, 20, 28, 0)');
    floorGrad.addColorStop(1, 'rgba(70, 85, 110, 0.4)');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, height * 0.85, width, height * 0.15);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const envMap = pmremGenerator.fromEquirectangular(texture).texture;

  texture.dispose();
  pmremGenerator.dispose();

  return envMap;
}

/**
 * Procedural Eye Iris Texture Generator
 * Creates the exact high-tech micro-aperture matrix shown in the reference image:
 * - Concentric rings of illuminated micro-dots / honeycomb mesh
 * - Center glowing optical core with lens flare
 * - High-contrast aperture tick marks
 * - Dynamic color (Cyan/Blue for normal, Crimson for Error alert)
 */
export function createIrisCanvasTexture(colorHex, isError = false) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const cx = size / 2;
  const cy = size / 2;

  // Clear background: Deep Obsidian
  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, size, size);

  const primaryColor = isError ? '#ff1e38' : colorHex;
  const coreColor = isError ? '#ffffff' : '#ffffff';
  const glowSubColor = isError ? '#ff4d64' : '#38bdf8';

  // 1. Soft Ambient Iris Backlight
  const bgGlow = ctx.createRadialGradient(cx, cy, 60, cx, cy, 460);
  bgGlow.addColorStop(0, isError ? 'rgba(255, 30, 56, 0.45)' : 'rgba(56, 189, 248, 0.35)');
  bgGlow.addColorStop(0.7, isError ? 'rgba(200, 0, 30, 0.15)' : 'rgba(14, 116, 144, 0.12)');
  bgGlow.addColorStop(1, 'rgba(5, 7, 12, 0)');
  ctx.fillStyle = bgGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, 460, 0, Math.PI * 2);
  ctx.fill();

  // 2. Outer Aperture Bezel Ring
  ctx.strokeStyle = isError ? 'rgba(255, 60, 80, 0.6)' : 'rgba(125, 211, 252, 0.5)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, 450, 0, Math.PI * 2);
  ctx.stroke();

  // 3. Precision Radial Tick Marks (Camera lens bezel markings)
  const totalTicks = 72;
  for (let i = 0; i < totalTicks; i++) {
    const angle = (i / totalTicks) * Math.PI * 2;
    const isMajor = i % 6 === 0;
    const rInner = isMajor ? 425 : 435;
    const rOuter = 448;

    const x1 = cx + Math.cos(angle) * rInner;
    const y1 = cy + Math.sin(angle) * rInner;
    const x2 = cx + Math.cos(angle) * rOuter;
    const y2 = cy + Math.sin(angle) * rOuter;

    ctx.strokeStyle = isMajor
      ? isError ? '#ff3b50' : primaryColor
      : isError ? 'rgba(255, 60, 80, 0.35)' : 'rgba(125, 211, 252, 0.3)';
    ctx.lineWidth = isMajor ? 5 : 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // 4. Concentric Rings of Glowing Micro-Aperture Dots
  const ringConfigs = [
    { radius: 390, count: 56, dotSize: 7, alpha: 0.9 },
    { radius: 345, count: 48, dotSize: 6, alpha: 0.85 },
    { radius: 300, count: 40, dotSize: 6.5, alpha: 0.9 },
    { radius: 255, count: 32, dotSize: 7, alpha: 0.95 },
    { radius: 210, count: 24, dotSize: 8, alpha: 1.0 },
    { radius: 165, count: 18, dotSize: 9, alpha: 1.0 },
  ];

  ringConfigs.forEach((ring) => {
    for (let i = 0; i < ring.count; i++) {
      const angle = (i / ring.count) * Math.PI * 2;
      const x = cx + Math.cos(angle) * ring.radius;
      const y = cy + Math.sin(angle) * ring.radius;

      ctx.save();
      ctx.shadowColor = glowSubColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = primaryColor;
      ctx.globalAlpha = ring.alpha;
      ctx.beginPath();
      ctx.arc(x, y, ring.dotSize, 0, Math.PI * 2);
      ctx.fill();

      // Bright white inner reflection spark on larger dots
      if (ring.dotSize >= 7) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 1.5, y - 1.5, ring.dotSize * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  });

  // 5. Connecting Concentric Hairline Circuits
  [390, 300, 210].forEach((r) => {
    ctx.strokeStyle = isError ? 'rgba(255, 50, 70, 0.25)' : 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // 6. Central High-Intensity Pupil / Optic Core
  if (isError) {
    // Menacing Alert Crosshairs / Targeting Reticle
    ctx.save();
    ctx.strokeStyle = '#ff1e38';
    ctx.lineWidth = 8;
    ctx.shadowColor = '#ff0033';
    ctx.shadowBlur = 25;

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(cx - 140, cy);
    ctx.lineTo(cx - 35, cy);
    ctx.moveTo(cx + 35, cy);
    ctx.lineTo(cx + 140, cy);
    ctx.moveTo(cx, cy - 140);
    ctx.lineTo(cx, cy - 35);
    ctx.moveTo(cx, cy + 35);
    ctx.lineTo(cx, cy + 140);
    ctx.stroke();

    // Central Warning Diamond
    ctx.fillStyle = '#ff1e38';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25);
    ctx.lineTo(cx + 25, cy);
    ctx.lineTo(cx, cy + 25);
    ctx.lineTo(cx - 25, cy);
    ctx.closePath();
    ctx.fill();

    // Intense Red Pupil Flare
    const errCore = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
    errCore.addColorStop(0, '#ffffff');
    errCore.addColorStop(0.3, '#ff3b50');
    errCore.addColorStop(0.8, '#ff0022');
    errCore.addColorStop(1, 'rgba(255, 0, 34, 0)');
    ctx.fillStyle = errCore;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else {
    // Normal / Peeking: Brilliant Luminous Optical Core
    ctx.save();
    const coreGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
    coreGlow.addColorStop(0, '#ffffff');
    coreGlow.addColorStop(0.25, coreColor);
    coreGlow.addColorStop(0.55, primaryColor);
    coreGlow.addColorStop(0.85, glowSubColor);
    coreGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');

    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 35;
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 130, 0, Math.PI * 2);
    ctx.fill();

    // Specular Lens Highlight Reflection (Curved reflection arc top-left)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, 85, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.stroke();
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Procedural Visor Softbox Reflection Texture
 * Gives the black curved glass visor the photographic 4-pane studio softbox reflection
 * seen in the user's reference photo.
 */
export function createVisorReflectionTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);

  // Softbox window panes at top-left
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';

  const sx = 90;
  const sy = 70;
  const pw = 60;
  const ph = 48;
  const gap = 10;

  ctx.fillRect(sx, sy, pw, ph);
  ctx.fillRect(sx + pw + gap, sy, pw, ph);
  ctx.fillRect(sx, sy + ph + gap, pw, ph);
  ctx.fillRect(sx + pw + gap, sy + ph + gap, pw, ph);

  // Soft curved horizontal studio highlight strip
  const stripGrad = ctx.createLinearGradient(0, 180, 512, 180);
  stripGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  stripGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
  stripGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
  stripGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = stripGrad;
  ctx.fillRect(0, 160, 512, 24);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Procedural Cyber Capsule / Pill Eye Texture
 * Exact match for the glowing cyan horizontal capsule/pill eyes seen in user's image!
 */
export function createCyberPillEyeTexture(
  colorHex,
  isLeft = true,
  isError = false,
  isBlinking = false
) {
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Transparent background so black visor shines through cleanly
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  const primaryColor = isError ? '#ff1e38' : colorHex;
  const glowColor = isError ? '#ff0033' : (colorHex === '#00f0ff' ? '#38bdf8' : colorHex);
  const coreColor = '#ffffff';

  ctx.save();

  // Subtle natural inward slant matching the uploaded image
  const slantAngle = isLeft ? 0.08 : -0.08;
  ctx.translate(cx, cy);
  ctx.rotate(slantAngle);

  if (isBlinking) {
    // Thin horizontal glowing neon line
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 25;
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(-160, -10, 320, 20, 10);
    ctx.fill();

    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.roundRect(-140, -4, 280, 8, 4);
    ctx.fill();
  } else {
    // Cyber Pill / Capsule Shape
    const pillW = 320;
    const pillH = 145;
    const pillR = 60;

    // 1. Radiant Outer Neon Bloom
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 40;
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pillR);
    ctx.fill();

    // 2. High-Intensity Mid Gradient
    const midGrad = ctx.createLinearGradient(0, -pillH / 2, 0, pillH / 2);
    midGrad.addColorStop(0, isError ? '#ff4d64' : '#67e8f9');
    midGrad.addColorStop(0.5, primaryColor);
    midGrad.addColorStop(1, isError ? '#cc0022' : '#0284c7');
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pillR);
    ctx.fill();

    // 3. Bright White Hot Optical Core
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 18;
    const coreW = pillW * 0.76;
    const coreH = pillH * 0.52;
    const coreR = 30;
    const coreGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, coreW / 2);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.65, isError ? '#ffe4e6' : '#e0f2fe');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.roundRect(-coreW / 2, -coreH / 2, coreW, coreH, coreR);
    ctx.fill();

    // 4. Subtle Top Curvature Glass Specular Sheen
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-pillW / 2 + 25, -pillH / 2 + 12, pillW - 50, 22, 10);
    ctx.fill();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
