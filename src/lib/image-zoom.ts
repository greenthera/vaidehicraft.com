export type ImageTransform = { scale: number; x: number; y: number };
export type ZoomPoint = { x: number; y: number };

export function clampImageTransform(view: ImageTransform, width: number, height: number, naturalWidth: number, naturalHeight: number): ImageTransform {
  const scale = Math.max(1, Math.min(4, view.scale));
  if (!naturalWidth || !naturalHeight || !width || !height || scale === 1) return { scale, x: 0, y: 0 };
  const fit = Math.min(width / naturalWidth, height / naturalHeight);
  const bx = Math.max(0, (naturalWidth * fit * scale - width) / 2);
  const by = Math.max(0, (naturalHeight * fit * scale - height) / 2);
  return { scale, x: Math.max(-bx, Math.min(bx, view.x)), y: Math.max(-by, Math.min(by, view.y)) };
}

export function pinchTransform(startDistance: number, startScale: number, distance: number, midpoint: ZoomPoint, anchor: ZoomPoint): ImageTransform {
  const scale = Math.max(1, Math.min(4, startScale * distance / Math.max(1, startDistance)));
  return { scale, x: midpoint.x - anchor.x * scale, y: midpoint.y - anchor.y * scale };
}
