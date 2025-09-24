// export-utils.ts
import { toBlob, toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

export type ExportType = 'png'|'jpeg';

export async function exportElementAsBlob(
  el: HTMLElement,
  opts: {
    type?: ExportType;
    scale?: number;
    width?: number;
    height?: number;
    clip?: { x: number; y: number; width: number; height: number };
    background?: string;
    hideClass?: string;
    styleOverride?: Partial<CSSStyleDeclaration>;
    filter?: (node: HTMLElement) => boolean;
  } = {}
): Promise<Blob> {
  const {
    type = 'png',
    scale = 1,
    width,
    height,
    clip,
    background = type === 'jpeg' ? '#ffffff' : undefined,
    hideClass,
    styleOverride,
    filter
  } = opts;

  if (hideClass) el.classList.add(hideClass);
  try {
    const blob = await toBlob(el, {
      pixelRatio: scale,
      width,
      height,
      clip,
      backgroundColor: background,
      cacheBust: true,
      skipFonts: false,
      style: {
        padding: '0px',
        borderRadius: '0px',
        margin: '0px',
        boxSizing: 'border-box',
        ...styleOverride
      } as any,
      filter
    } as any);
    if (blob) return blob;
    throw new Error('html-to-image returned null');
  } catch {
    const canvas = await html2canvas(el, {
      backgroundColor: background ?? null,
      allowTaint: true,
      useCORS: true,
      scale
    });
    const blob: Blob | null = await new Promise(res =>
      canvas.toBlob(
        b => res(b),
        type === 'png' ? 'image/png' : 'image/jpeg',
        type === 'jpeg' ? 0.92 : undefined
      )
    );
    if (!blob) throw new Error('fallback toBlob failed');
    return blob;
  } finally {
    if (hideClass) el.classList.remove(hideClass);
  }
}

/** Composite a PNG watermark over a base image blob, returns a new PNG blob. */
export async function applyWatermark(
  baseBlob: Blob,
  watermarkUrl: string,
  opts: {
    opacity?: number;       // 0..1
    scale?: number;         // watermark width relative to base width (0..1)
    margin?: number;        // px margin from bottom-right (CSS pixels)
    position?: 'bottom-right'|'bottom-left'|'top-right'|'top-left'|'center';
  } = {}
): Promise<Blob> {
  const { opacity = 0.7, scale = 0.25, margin = 16, position = 'bottom-right' } = opts;

  const baseUrl = URL.createObjectURL(baseBlob);
  try {
    const baseImg = await loadImage(baseUrl);
    const wmImg = await loadImage(watermarkUrl); // requires CORS headers if cross-origin

    const W = baseImg.naturalWidth;
    const H = baseImg.naturalHeight;

    const targetW = Math.max(1, Math.floor(W * scale));
    const ratio = wmImg.naturalHeight / wmImg.naturalWidth;
    const targetH = Math.max(1, Math.floor(targetW * ratio));

    const pos = computePosition(position, W, H, targetW, targetH, margin);

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(baseImg, 0, 0);
    ctx.globalAlpha = opacity;
    ctx.drawImage(wmImg, pos.x, pos.y, targetW, targetH);
    ctx.globalAlpha = 1;

    const out: Blob | null = await new Promise(res =>
      canvas.toBlob(b => res(b), 'image/png')
    );
    if (!out) throw new Error('watermark toBlob failed');
    return out;
  } finally {
    URL.revokeObjectURL(baseUrl);
  }
}

export async function exportElementAsDataUrl(
  el: HTMLElement,
  opts: {
    scale?: number;
    width?: number;
    height?: number;
    clip?: { x: number; y: number; width: number; height: number };
    background?: string;
    hideClass?: string;
    styleOverride?: Partial<CSSStyleDeclaration>;
    filter?: (node: HTMLElement) => boolean;
  } = {}
): Promise<string> {
  const {
    scale = 1,
    width,
    height,
    clip,
    background,
    hideClass,
    styleOverride,
    filter,
  } = opts;

  if (hideClass) el.classList.add(hideClass);
  try {
    // html-to-image returns a PNG data URL directly
    return await toPng(el, {
      pixelRatio: scale,
      width, height, clip,
      backgroundColor: background,
      cacheBust: true,
      skipFonts: false,
      style: {
        padding: '0px',
        borderRadius: '0px',
        margin: '0px',
        boxSizing: 'border-box',
        ...styleOverride,
      } as any,
      filter,
    } as any);
  } catch {
    // Fallback: html2canvas -> data URL
    const canvas = await html2canvas(el, {
      backgroundColor: background ?? null,
      allowTaint: true,
      useCORS: true,
      scale,
    });
    return canvas.toDataURL('image/png');
  } finally {
    if (hideClass) el.classList.remove(hideClass);
  }
}

/** Watermark a PNG data URL with a PNG watermark. Returns a PNG data URL. */
export async function applyWatermarkToDataUrl(
  baseDataUrl: string,
  watermarkUrl: string,
  opts: {
    opacity?: number;
    scale?: number;    // watermark width relative to base width (0..1)
    margin?: number;   // px
    position?: 'bottom-right'|'bottom-left'|'top-right'|'top-left'|'center';
  } = {}
): Promise<string> {
  const { opacity = 0.7, scale = 0.25, margin = 16, position = 'bottom-right' } = opts;

  const baseImg = await loadImage(baseDataUrl);
  const wmImg = await loadImage(watermarkUrl); // must be same-origin or CORS-enabled

  const W = baseImg.naturalWidth;
  const H = baseImg.naturalHeight;
  const wmW = Math.max(1, Math.floor(W * scale));
  const wmH = Math.max(1, Math.floor(wmW * (wmImg.naturalHeight / wmImg.naturalWidth)));
  const { x, y } = positionPx(position, W, H, wmW, wmH, margin);

  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(baseImg, 0, 0);
  ctx.globalAlpha = opacity;
  ctx.drawImage(wmImg, x, y, wmW, wmH);
  ctx.globalAlpha = 1;
  return canvas.toDataURL('image/png');
}


function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // needs server CORS if cross-origin
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function positionPx(
  pos: string, W: number, H: number, w: number, h: number, m: number
): { x: number; y: number } {
  switch (pos) {
    case 'bottom-left': return { x: m, y: H - h - m };
    case 'top-right':   return { x: W - w - m, y: m };
    case 'top-left':    return { x: m, y: m };
    case 'center':      return { x: (W - w)/2, y: (H - h)/2 };
    default:            return { x: W - w - m, y: H - h - m };
  }
}

function computePosition(
  position: string, W: number, H: number, w: number, h: number, m: number
): { x: number; y: number } {
  switch (position) {
    case 'bottom-left':  return { x: m, y: H - h - m };
    case 'top-right':    return { x: W - w - m, y: m };
    case 'top-left':     return { x: m, y: m };
    case 'center':       return { x: (W - w) / 2, y: (H - h) / 2 };
    default:             return { x: W - w - m, y: H - h - m }; // bottom-right
  }
}
