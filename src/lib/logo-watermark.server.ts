// Marca d'água aplicada NO SERVIDOR: a versão limpa nunca sai daqui antes do pagamento.
import { decode, encode } from "fast-png";

const PREVIEW_MAX = 640;

// Fonte bitmap 5x7 mínima para o texto da marca d'água.
const FONT: Record<string, string[]> = {
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  "·": ["00000", "00000", "00000", "00100", "00000", "00000", "00000"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
};

const TEXT = "REBRAND IA · PREVIA";

type Rgba = { data: Uint8ClampedArray; width: number; height: number };

function toRgba(png: ReturnType<typeof decode>): Rgba {
  const { width, height, channels, depth } = png as unknown as {
    width: number;
    height: number;
    channels: number;
    depth: number;
  };
  const src = png.data as unknown as ArrayLike<number>;
  const shift = depth === 16 ? 8 : 0;
  const out = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const s = i * channels;
    if (channels >= 3) {
      out[i * 4] = (src[s] as number) >> shift;
      out[i * 4 + 1] = (src[s + 1] as number) >> shift;
      out[i * 4 + 2] = (src[s + 2] as number) >> shift;
      out[i * 4 + 3] = channels === 4 ? (src[s + 3] as number) >> shift : 255;
    } else {
      const g = (src[s] as number) >> shift;
      out[i * 4] = g;
      out[i * 4 + 1] = g;
      out[i * 4 + 2] = g;
      out[i * 4 + 3] = channels === 2 ? (src[s + 1] as number) >> shift : 255;
    }
  }
  return { data: out, width, height };
}

function downscale(img: Rgba, max: number): Rgba {
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  if (scale >= 1) return img;
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const out = new Uint8ClampedArray(w * h * 4);
  const bx = img.width / w;
  const by = img.height / h;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0,
        n = 0;
      const y0 = Math.floor(y * by);
      const y1 = Math.min(img.height, Math.floor((y + 1) * by) || y0 + 1);
      const x0 = Math.floor(x * bx);
      const x1 = Math.min(img.width, Math.floor((x + 1) * bx) || x0 + 1);
      for (let sy = y0; sy < y1; sy++) {
        for (let sx = x0; sx < x1; sx++) {
          const s = (sy * img.width + sx) * 4;
          r += img.data[s];
          g += img.data[s + 1];
          b += img.data[s + 2];
          a += img.data[s + 3];
          n++;
        }
      }
      const d = (y * w + x) * 4;
      out[d] = r / n;
      out[d + 1] = g / n;
      out[d + 2] = b / n;
      out[d + 3] = a / n;
    }
  }
  return { data: out, width: w, height: h };
}

function blend(img: Rgba, x: number, y: number, alpha: number, light: boolean) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  const i = (y * img.width + x) * 4;
  const target = light ? 255 : 0;
  for (let c = 0; c < 3; c++) {
    img.data[i + c] = img.data[i + c] * (1 - alpha) + target * alpha;
  }
}

function drawStripes(img: Rgba) {
  const period = Math.max(14, Math.round(img.width / 18));
  const band = Math.round(period / 2);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if ((x + y) % period < band) blend(img, x, y, 0.16, false);
    }
  }
}

function drawText(img: Rgba, originX: number, originY: number, scale: number) {
  let cursor = originX;
  for (const ch of TEXT) {
    const glyph = FONT[ch] ?? FONT[" "];
    for (let gy = 0; gy < glyph.length; gy++) {
      for (let gx = 0; gx < 5; gx++) {
        if (glyph[gy][gx] !== "1") continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const px = cursor + gx * scale + sx;
            const py = originY + gy * scale + sy;
            blend(img, px, py, 0.75, false);
            blend(img, px, py + scale, 0.25, true);
          }
        }
      }
    }
    cursor += 6 * scale;
  }
}

function drawWatermarkText(img: Rgba) {
  const scale = Math.max(2, Math.round(img.width / 220));
  const textWidth = TEXT.length * 6 * scale;
  const stepY = Math.round(img.height / 4);
  let row = 0;
  for (let y = -stepY; y < img.height + stepY; y += stepY) {
    const offset = row % 2 === 0 ? 0 : -Math.round(textWidth / 2);
    for (let x = offset - textWidth; x < img.width + textWidth; x += textWidth + 8 * scale) {
      drawText(img, x, y, scale);
    }
    row++;
  }
}

/** Recebe PNG base64 limpo e devolve base64 de uma prévia reduzida e marcada. */
export function watermarkPngBase64(cleanBase64: string): string {
  const bytes = Uint8Array.from(atob(cleanBase64), (c) => c.charCodeAt(0));
  const img = downscale(toRgba(decode(bytes)), PREVIEW_MAX);
  drawStripes(img);
  drawWatermarkText(img);
  const out = encode({
    width: img.width,
    height: img.height,
    data: new Uint8Array(img.data.buffer, img.data.byteOffset, img.data.length),
    channels: 4,
    depth: 8,
  });
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < out.length; i += chunk) {
    binary += String.fromCharCode(...out.subarray(i, i + chunk));
  }
  return btoa(binary);
}
