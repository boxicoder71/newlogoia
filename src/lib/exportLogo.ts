const SIZE = 2048;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível ler a imagem"));
    img.src = src;
  });
}

/** Renderiza a logo em alta resolução e remove o fundo branco/claro. */
async function toTransparentCanvas(src: string): Promise<HTMLCanvasElement> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const scale = Math.min(SIZE / img.width, SIZE / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h);

  const data = ctx.getImageData(0, 0, SIZE, SIZE);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    const min = Math.min(r, g, b);
    const max = Math.max(r, g, b);
    if (min > 238 && max - min < 12) {
      px[i + 3] = 0;
    } else if (min > 218 && max - min < 18) {
      px[i + 3] = Math.round(((min - 218) / 20) * 0 + ((238 - min) / 20) * 255);
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadPng(src: string, baseName: string) {
  const canvas = await toTransparentCanvas(src);
  triggerDownload(canvas.toDataURL("image/png"), `${baseName}-logo.png`);
}

export async function downloadSvg(src: string, baseName: string) {
  const canvas = await toTransparentCanvas(src);
  const png = canvas.toDataURL("image/png");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><title>${baseName}</title><image width="${SIZE}" height="${SIZE}" xlink:href="${png}"/></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  triggerDownload(url, `${baseName}-logo.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}