import * as THREE from 'three';

export function createHexGridTexture(
  maxAnisotropy: number,
  gridRgba = 'rgba(101, 216, 244, 0.10)',
  bgHex = '#040816',
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, size, size);

  const r = 16;
  const h = Math.sqrt(3) * r;
  ctx.strokeStyle = gridRgba;
  ctx.lineWidth = 1;

  for (let row = -1; row < size / (h * 0.5) + 2; row++) {
    for (let col = -1; col < size / (r * 3) + 2; col++) {
      const cx = col * r * 3 + (row % 2 === 0 ? 0 : r * 1.5);
      const cy = row * (h * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (Math.PI / 3) * i;
        const px = cx + r * Math.cos(ang);
        const py = cy + r * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(34, 24);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createRadarRingTexture(
  maxAnisotropy: number,
  accentRgb = '101, 216, 244',
): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  // Outer dashed precision ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([18, 12]);
  ctx.beginPath();
  ctx.arc(cx, cy, 242, 0, Math.PI * 2);
  ctx.stroke();

  // Mid solid technical ring
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 224, 0, Math.PI * 2);
  ctx.stroke();

  // Segmented bright arcs
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const start = i * (Math.PI / 2) + 0.18;
    ctx.beginPath();
    ctx.arc(cx, cy, 206, start, start + 0.72);
    ctx.stroke();
  }

  // Inner subtle themed ring
  ctx.strokeStyle = `rgba(${accentRgb}, 0.36)`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 10]);
  ctx.beginPath();
  ctx.arc(cx, cy, 174, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createWarningRippleTexture(
  maxAnisotropy: number,
  accentRgb = '101, 216, 244',
): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);

  const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, 118);
  grad.addColorStop(0, `rgba(${accentRgb}, 0.95)`);
  grad.addColorStop(0.28, `rgba(${accentRgb}, 0.55)`);
  grad.addColorStop(0.7, `rgba(${accentRgb}, 0.16)`);
  grad.addColorStop(1, `rgba(${accentRgb}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = `rgba(${accentRgb}, 0.9)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 56, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([12, 8]);
  ctx.strokeStyle = `rgba(${accentRgb}, 0.72)`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 88, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createFlowGradientTexture(
  colorHex: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.35, colorHex);
  grad.addColorStop(0.55, '#ffffff');
  grad.addColorStop(0.75, colorHex);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(3, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createRoomMarkerTexture(
  indexCode: string,
  roomName: string,
  maxAnisotropy: number,
  accentHex = '#65d8f4',
  accentRgb = '101, 216, 244',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 220;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 220);

  // Bracket corners around number
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.lineWidth = 2;
  // Top-left & bottom-left brackets
  ctx.beginPath();
  ctx.moveTo(82, 22);
  ctx.lineTo(74, 22);
  ctx.lineTo(74, 72);
  ctx.lineTo(82, 72);
  ctx.stroke();

  // Top-right & bottom-right brackets
  ctx.beginPath();
  ctx.moveTo(174, 22);
  ctx.lineTo(182, 22);
  ctx.lineTo(182, 72);
  ctx.lineTo(174, 72);
  ctx.stroke();

  // Top index number ("01" or "02")
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(indexCode, 128, 48);

  // Room title in glowing theme accent ("主控室" or "高压室")
  ctx.shadowColor = `rgba(${accentRgb}, 0.9)`;
  ctx.shadowBlur = 12;
  ctx.fillStyle = accentHex;
  ctx.font = 'bold 34px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.fillText(roomName, 128, 114);
  ctx.shadowBlur = 0;

  // Trapezoid light glow base
  const glow = ctx.createLinearGradient(0, 140, 0, 180);
  glow.addColorStop(0, `rgba(${accentRgb}, 0.65)`);
  glow.addColorStop(1, `rgba(${accentRgb}, 0.05)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(86, 142);
  ctx.lineTo(170, 142);
  ctx.lineTo(198, 178);
  ctx.lineTo(58, 178);
  ctx.closePath();
  ctx.fill();

  // Vertical stem down
  ctx.strokeStyle = `rgba(${accentRgb}, 0.85)`;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(128, 178);
  ctx.lineTo(128, 214);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createChevronArrowTexture(
  maxAnisotropy: number,
  accentHex = '#65d8f4',
  accentRgb = '101, 216, 244',
  secondaryHex = '#e2a5ee',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 128, 128);

  ctx.shadowColor = `rgba(${accentRgb}, 0.85)`;
  ctx.shadowBlur = 14;
  ctx.fillStyle = accentHex;
  ctx.beginPath();
  ctx.moveTo(22, 34);
  ctx.lineTo(64, 96);
  ctx.lineTo(106, 34);
  ctx.lineTo(84, 34);
  ctx.lineTo(64, 66);
  ctx.lineTo(44, 34);
  ctx.closePath();
  ctx.fill();

  // Inner bright highlight
  ctx.shadowBlur = 0;
  ctx.fillStyle = secondaryHex;
  ctx.beginPath();
  ctx.moveTo(46, 28);
  ctx.lineTo(64, 54);
  ctx.lineTo(82, 28);
  ctx.lineTo(64, 38);
  ctx.closePath();
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createSignLabelTexture(
  text: string,
  color: string,
  bgColor: string,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 252, 60);
  ctx.fillStyle = color;
  ctx.font = 'bold 28px "PingFang SC", "Microsoft YaHei", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
