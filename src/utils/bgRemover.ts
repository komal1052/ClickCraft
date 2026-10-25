import { loadImage } from "./canvasRenderer";

export interface BgRemoverOptions {
  tolerance: number; // 5 to 80 (default ~30)
  feather: number; // 0 to 8 (default ~2)
  targetColor?: { r: number; g: number; b: number } | null; // null = auto detect from edges
  protectCenter: boolean; // protect center face/subject
}

/**
 * Removes background from an image using color distance keying,
 * perimeter edge sampling, and alpha edge feathering.
 */
export async function removeBackground(
  imageSource: string,
  options: BgRemoverOptions = { tolerance: 32, feather: 2, protectCenter: true }
): Promise<string> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  const width = img.naturalWidth || img.width || 640;
  const height = img.naturalHeight || img.height || 480;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // 1. Determine background color reference (either provided by user or sampled from perimeter)
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;

  if (options.targetColor) {
    bgR = options.targetColor.r;
    bgG = options.targetColor.g;
    bgB = options.targetColor.b;
  } else {
    // Sample corners and perimeter
    let samples = 0;
    const sampleCoords = [
      [2, 2],
      [width - 3, 2],
      [2, height - 3],
      [width - 3, height - 3],
      [Math.floor(width / 2), 2],
      [2, Math.floor(height / 2)],
      [width - 3, Math.floor(height / 2)],
    ];

    for (const [sx, sy] of sampleCoords) {
      const idx = (sy * width + sx) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
      samples++;
    }

    bgR = Math.round(bgR / samples);
    bgG = Math.round(bgG / samples);
    bgB = Math.round(bgB / samples);
  }

  // 2. Tolerance threshold squared (Euclidean color distance in RGB space)
  const thresholdDist = (options.tolerance * 4.41); // max distance is ~441
  const thresholdSq = thresholdDist * thresholdDist;
  const featherRange = Math.max(1, (options.feather * 12));
  const featherRangeSq = featherRange * featherRange;

  // Center bounding protection (face / core subject usually lives in the center 50%)
  const centerX = width / 2;
  const centerY = height / 2;
  const protectRadiusX = width * 0.28;
  const protectRadiusY = height * 0.35;

  // 3. Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // Calculate distance to background color
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const distSq = dr * dr + dg * dg + db * db;

      // Check if inside center protected zone
      let isProtected = false;
      if (options.protectCenter) {
        const dxCenter = (x - centerX) / protectRadiusX;
        const dyCenter = (y - centerY) / protectRadiusY;
        if (dxCenter * dxCenter + dyCenter * dyCenter < 0.65) {
          isProtected = true;
        }
      }

      if (isProtected && distSq > thresholdSq * 0.7) {
        // Keep opaque for protected center subject
        continue;
      }

      if (distSq < thresholdSq) {
        // Pixel is background -> make transparent
        data[idx + 3] = 0;
      } else if (distSq < thresholdSq + featherRangeSq) {
        // Soft feather border
        const factor = (Math.sqrt(distSq) - thresholdDist) / featherRange;
        data[idx + 3] = Math.round(Math.min(255, Math.max(0, factor * 255)));
      }
    }
  }

  // 4. Put processed pixels back onto canvas
  ctx.putImageData(imgData, 0, 0);

  // Return base64 transparent PNG
  return canvas.toDataURL("image/png");
}

/**
 * Samples RGB color from an image coordinate
 */
export async function samplePixelColor(
  imageSource: string,
  normalizedX: number, // 0 to 1
  normalizedY: number // 0 to 1
): Promise<{ r: number; g: number; b: number }> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { r: 255, g: 255, b: 255 };

  canvas.width = img.width || 640;
  canvas.height = img.height || 480;
  ctx.drawImage(img, 0, 0);

  const px = Math.min(canvas.width - 1, Math.max(0, Math.floor(normalizedX * canvas.width)));
  const py = Math.min(canvas.height - 1, Math.max(0, Math.floor(normalizedY * canvas.height)));

  const p = ctx.getImageData(px, py, 1, 1).data;
  return { r: p[0], g: p[1], b: p[2] };
}
