import { ThumbnailDesign } from "../types/thumbnail";

// Cache for loaded HTML images
const imageCache = new Map<string, HTMLImageElement>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function renderThumbnailToCanvas(
  canvas: HTMLCanvasElement,
  design: ThumbnailDesign,
  heatmapPoints?: Array<{ x: number; y: number; intensity: number; label: string }>
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  ctx.save();

  // 1. Render Background
  const bg = design.background;
  if (bg.type === "radial-burst") {
    // Fill base gradient
    const grad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      50,
      width * 0.5,
      height * 0.5,
      width * 0.75
    );
    grad.addColorStop(0, bg.gradientStart);
    grad.addColorStop(1, bg.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Draw comic burst rays
    ctx.save();
    ctx.translate(width * 0.5, height * 0.5);
    const numRays = 24;
    const burstColor = bg.burstColor || "rgba(255, 255, 255, 0.15)";
    ctx.fillStyle = burstColor;
    for (let i = 0; i < numRays; i += 2) {
      const a1 = (i * 2 * Math.PI) / numRays;
      const a2 = ((i + 1) * 2 * Math.PI) / numRays;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a1) * width, Math.sin(a1) * width);
      ctx.lineTo(Math.cos(a2) * width, Math.sin(a2) * width);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (bg.type === "speed-lines") {
    // Dynamic angle gradient
    const angleRad = (bg.gradientAngle * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, bg.gradientStart);
    grad.addColorStop(1, bg.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Speed lines
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 3;
    for (let y = 0; y < height; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width * (0.3 + Math.sin(y * 0.05) * 0.2), y);
      ctx.stroke();
    }
    ctx.restore();
  } else if (bg.type === "cyber-grid") {
    // Deep dark background
    ctx.fillStyle = bg.gradientEnd || "#090d16";
    ctx.fillRect(0, 0, width, height);

    // Glowing horizon
    const glowGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      10,
      width * 0.5,
      height * 0.5,
      width * 0.6
    );
    glowGrad.addColorStop(0, bg.gradientStart);
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Perspective Grid
    ctx.save();
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1.5;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, height * 0.5);
      ctx.lineTo(width * 0.5 + (x - width * 0.5) * 2.5, height);
      ctx.stroke();
    }
    for (let y = height * 0.5; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  } else {
    // Standard Linear Gradient
    const angleRad = (bg.gradientAngle * Math.PI) / 180;
    const x1 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x2 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y2 = height / 2 + (Math.sin(angleRad) * height) / 2;

    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, bg.gradientStart);
    grad.addColorStop(1, bg.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  // Vignette overlay
  if (bg.vignetteIntensity > 0) {
    const vigGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.5,
      width * 0.2,
      width * 0.5,
      height * 0.5,
      width * 0.75
    );
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, `rgba(0,0,0,${bg.vignetteIntensity})`);
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Render Subject / Creator Cutout
  const sub = design.subject;
  if (sub.imageUrl) {
    try {
      const img = await loadImage(sub.imageUrl);
      const subX = (sub.x / 100) * width;
      const subY = (sub.y / 100) * height;
      const imgW = (height * 0.95) * sub.scale;
      const imgH = (height * 0.95) * sub.scale * (img.height / img.width);

      ctx.save();
      ctx.translate(subX, subY);
      if (sub.flipHorizontal) {
        ctx.scale(-1, 1);
      }

      // Draw Glow / Sticker Outline
      if (sub.glowType !== "none") {
        ctx.save();
        if (sub.glowType === "neon") {
          ctx.shadowColor = sub.glowColor;
          ctx.shadowBlur = sub.glowWidth * 2;
        } else if (sub.glowType === "sticker") {
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = sub.glowWidth * 1.5;
        } else if (sub.glowType === "flame") {
          ctx.shadowColor = "#f97316";
          ctx.shadowBlur = sub.glowWidth * 2.5;
        } else if (sub.glowType === "drop-shadow") {
          ctx.shadowColor = "rgba(0,0,0,0.85)";
          ctx.shadowBlur = 30;
          ctx.shadowOffsetX = 10;
          ctx.shadowOffsetY = 15;
        }

        // Apply filters
        ctx.filter = `brightness(${sub.brightness}) contrast(${sub.contrast}) saturate(${sub.saturation})`;
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
        ctx.restore();
      }

      // Main image pass
      ctx.filter = `brightness(${sub.brightness}) contrast(${sub.contrast}) saturate(${sub.saturation})`;
      ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
      ctx.restore();
    } catch (err) {
      console.warn("Failed to draw subject image:", err);
    }
  }

  // 3. Render Stickers & Accents
  for (const stk of design.stickers) {
    ctx.save();
    const stkX = (stk.x / 100) * width;
    const stkY = (stk.y / 100) * height;
    ctx.translate(stkX, stkY);
    ctx.rotate((stk.rotation * Math.PI) / 180);
    ctx.scale(stk.scale, stk.scale);

    if (stk.type === "arrow") {
      drawHighCtrArrow(ctx, stk.color);
    } else if (stk.type === "badge") {
      drawPillBadge(ctx, stk.label || "100% REAL", stk.color);
    } else if (stk.type === "warning") {
      drawWarningStamp(ctx, stk.color);
    } else if (stk.type === "vs") {
      drawVsBadge(ctx);
    } else if (stk.type === "mystery") {
      drawMysteryBox(ctx, stk.label || "CENSORED");
    } else if (stk.type === "cash") {
      drawCashBurst(ctx);
    } else if (stk.type === "fire") {
      drawFireIcon(ctx);
    }

    ctx.restore();
  }

  // 4. Render Text Layers
  for (const txt of design.texts) {
    if (!txt.text) continue;

    ctx.save();
    const txtX = (txt.x / 100) * width;
    const txtY = (txt.y / 100) * height;

    ctx.translate(txtX, txtY);
    ctx.rotate((txt.rotation * Math.PI) / 180);

    const displayText = txt.isUppercase ? txt.text.toUpperCase() : txt.text;

    // Font family mapping (supports all Google Fonts dynamically)
    let fontStr = `'${txt.font}', Impact, sans-serif`;
    if (txt.font === "Impact") fontStr = "Impact, sans-serif";
    else if (txt.font === "Anton") fontStr = "'Anton', sans-serif";
    else if (txt.font === "Montserrat") fontStr = "'Montserrat', sans-serif";
    else if (txt.font === "Bebas Neue") fontStr = "'Bebas Neue', sans-serif";
    else if (txt.font === "Bungee") fontStr = "'Bungee', sans-serif";
    else if (txt.font === "Inter") fontStr = "'Inter', sans-serif";

    ctx.font = `900 ${txt.fontSize}px ${fontStr}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textMetrics = ctx.measureText(displayText);
    const textWidth = textMetrics.width;
    const textHeight = txt.fontSize * 1.15;

    // Highlight background pill/banner
    if (txt.highlightBg) {
      ctx.save();
      ctx.fillStyle = txt.highlightBg;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 12;
      const paddingX = 24;
      const paddingY = 12;
      roundRect(
        ctx,
        -textWidth / 2 - paddingX,
        -textHeight / 2 - paddingY,
        textWidth + paddingX * 2,
        textHeight + paddingY * 2,
        14
      );
      ctx.fill();
      ctx.restore();
    }

    // Heavy 3D Stroke & Outline (YouTube signature look)
    if (txt.strokeWidth > 0) {
      ctx.strokeStyle = txt.strokeColor;
      ctx.lineWidth = txt.strokeWidth;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeText(displayText, 0, 0);
    }

    // Shadow
    ctx.shadowColor = txt.shadowColor || "rgba(0,0,0,0.85)";
    ctx.shadowBlur = txt.shadowBlur || 18;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 6;

    // Main Text Fill
    ctx.fillStyle = txt.color;
    ctx.fillText(displayText, 0, 0);

    ctx.restore();
  }

  // 4.5. Reference Ghost / Onion Skin Overlay (for tracing/comparing with reference)
  if (design.showReferenceGhost && design.referenceImageOverlay) {
    try {
      const refImg = await loadImage(design.referenceImageOverlay);
      ctx.save();
      ctx.globalAlpha = design.referenceOpacity ?? 0.35;
      ctx.drawImage(refImg, 0, 0, width, height);
      ctx.restore();
    } catch (e) {
      console.warn("Could not render reference ghost image:", e);
    }
  }

  // 5. YouTube Safe-Zone Overlay (Duration Badge)
  if (design.showSafeZoneOverlay) {
    drawYouTubeTimestampOverlay(ctx, width, height);
  }

  // 6. Eye-Tracking Heatmap Overlay
  if (design.showHeatmap && heatmapPoints && heatmapPoints.length > 0) {
    drawGazeHeatmap(ctx, width, height, heatmapPoints);
  }

  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawHighCtrArrow(ctx: CanvasRenderingContext2D, color: string) {
  // Bold, dynamic curved arrow with yellow/white highlight and dark drop shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 8;

  // Outer border
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-70, -20);
  ctx.bezierCurveTo(-30, -50, 20, -50, 50, -10);
  ctx.lineTo(40, -35);
  ctx.lineTo(85, 0);
  ctx.lineTo(55, 45);
  ctx.lineTo(50, 20);
  ctx.bezierCurveTo(20, -10, -20, -10, -55, 10);
  ctx.closePath();
  ctx.fill();

  // Vibrant fill
  ctx.fillStyle = color || "#ef4444";
  ctx.beginPath();
  ctx.moveTo(-65, -16);
  ctx.bezierCurveTo(-28, -42, 18, -42, 46, -6);
  ctx.lineTo(38, -26);
  ctx.lineTo(76, 0);
  ctx.lineTo(50, 36);
  ctx.lineTo(46, 16);
  ctx.bezierCurveTo(18, -6, -18, -6, -50, 8);
  ctx.closePath();
  ctx.fill();

  // Glow line inside
  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-50, -12);
  ctx.bezierCurveTo(-20, -28, 15, -28, 40, -2);
  ctx.stroke();

  ctx.restore();
}

function drawPillBadge(ctx: CanvasRenderingContext2D, text: string, color: string) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;

  ctx.font = "900 32px 'Anton', 'Impact', sans-serif";
  const metrics = ctx.measureText(text);
  const w = metrics.width + 48;
  const h = 54;

  // Background
  ctx.fillStyle = color || "#f59e0b";
  roundRect(ctx, -w / 2, -h / 2, w, h, 27);
  ctx.fill();

  // Outline
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  roundRect(ctx, -w / 2, -h / 2, w, h, 27);
  ctx.stroke();

  // Text
  ctx.fillStyle = "#000000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 2);

  ctx.restore();
}

function drawWarningStamp(ctx: CanvasRenderingContext2D, color: string) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 20;

  // Yellow/red warning triangle
  ctx.fillStyle = color || "#ef4444";
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.lineTo(55, 45);
  ctx.lineTo(-55, 45);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Exclamation point
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(-6, -20, 12, 35);
  ctx.beginPath();
  ctx.arc(0, 28, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawVsBadge(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.shadowColor = "#f59e0b";
  ctx.shadowBlur = 25;

  // Electric circle
  ctx.fillStyle = "#dc2626";
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#facc15";
  ctx.lineWidth = 6;
  ctx.stroke();

  // "VS" text
  ctx.font = "900 48px 'Anton', 'Impact', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 8;
  ctx.strokeText("VS", 0, 2);
  ctx.fillText("VS", 0, 2);

  ctx.restore();
}

function drawMysteryBox(ctx: CanvasRenderingContext2D, label: string) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.9)";
  ctx.shadowBlur = 18;

  const w = 220;
  const h = 75;

  // Dark censored box with diagonal caution stripes
  ctx.fillStyle = "#000000";
  roundRect(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();

  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 4;
  roundRect(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.stroke();

  ctx.font = "900 36px 'Anton', 'Impact', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ef4444";
  ctx.fillText(label || "CENSORED", 0, 2);

  ctx.restore();
}

function drawCashBurst(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "900 64px 'Impact', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 14;

  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 12;
  ctx.strokeText("$$$", 0, 0);

  ctx.fillStyle = "#22c55e";
  ctx.fillText("$$$", 0, 0);
  ctx.restore();
}

function drawFireIcon(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.font = "72px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#ea580c";
  ctx.shadowBlur = 30;
  ctx.fillText("🔥", 0, 0);
  ctx.restore();
}

function drawYouTubeTimestampOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  // YouTube timestamp is at bottom-right corner, ~16px from edge
  const badgeW = 92;
  const badgeH = 40;
  const badgeX = width - badgeW - 24;
  const badgeY = height - badgeH - 24;

  // Dark YouTube rounded pill
  ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 1.5;
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8);
  ctx.stroke();

  // YouTube timestamp text
  ctx.font = "700 22px 'Inter', sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("14:28", badgeX + badgeW / 2, badgeY + badgeH / 2 + 1);

  // Red dashed Safe Zone warning box around that area to alert creator
  ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  roundRect(ctx, badgeX - 12, badgeY - 12, badgeW + 24, badgeH + 24, 12);
  ctx.stroke();

  // Label "YT SAFE ZONE"
  ctx.font = "600 13px 'Inter', sans-serif";
  ctx.fillStyle = "#f87171";
  ctx.textAlign = "right";
  ctx.fillText("KEEP CLEAR (YT BADGE)", badgeX + badgeW + 8, badgeY - 18);

  ctx.restore();
}

function drawGazeHeatmap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  points: Array<{ x: number; y: number; intensity: number; label: string }>
) {
  ctx.save();
  // Semi-transparent overlay canvas
  for (const pt of points) {
    const cx = (pt.x / 100) * width;
    const cy = (pt.y / 100) * height;
    const radius = 180 * pt.intensity;

    const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
    radGrad.addColorStop(0, `rgba(239, 68, 68, ${0.75 * pt.intensity})`);
    radGrad.addColorStop(0.3, `rgba(234, 179, 8, ${0.55 * pt.intensity})`);
    radGrad.addColorStop(0.7, `rgba(34, 197, 94, ${0.3 * pt.intensity})`);
    radGrad.addColorStop(1, "rgba(6, 182, 212, 0)");

    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Pulse target ring
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Label tag
    ctx.font = "700 16px 'Inter', sans-serif";
    const labelW = ctx.measureText(pt.label).width + 24;
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    roundRect(ctx, cx - labelW / 2, cy + 24, labelW, 30, 6);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pt.label, cx, cy + 39);
  }
  ctx.restore();
}
