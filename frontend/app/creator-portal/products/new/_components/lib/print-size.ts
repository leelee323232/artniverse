import type { PrintZone } from "../data/platform-products";

export interface DesignImage {
  id: string;
  url: string;
  file: File;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  zoneId: string; // which zone this image belongs to
  customWidth?: number; // user-defined print width in cm (overrides auto size)
  customHeight?: number; // user-defined print height in cm (overrides auto size)
}

// Calculate print size in cm based on image scale and zone
export function calculatePrintSize(scale: number, zone: PrintZone) {
  // 100% scale = 50% of the zone max size as default
  const baseRatio = 0.5;
  const width = (zone.width * baseRatio * scale) / 100;
  const height = (zone.height * baseRatio * scale) / 100;
  return {
    width: Math.round(width * 10) / 10,
    height: Math.round(height * 10) / 10,
  };
}

// Effective print size: use the user-defined size if set, otherwise the auto-calculated size
export function getEffectivePrintSize(img: DesignImage, zone: PrintZone) {
  if (
    img.customWidth != null &&
    img.customHeight != null &&
    !Number.isNaN(img.customWidth) &&
    !Number.isNaN(img.customHeight)
  ) {
    return { width: img.customWidth, height: img.customHeight };
  }
  return calculatePrintSize(img.scale, zone);
}

// Effective uniform scale (%) derived from the effective print size.
// When a custom size is set we reverse calculatePrintSize so the slider & preview
// stay in sync with the manually-entered 當前印刷尺寸.
export function getEffectiveScalePercent(img: DesignImage, zone: PrintZone) {
  if (
    img.customWidth != null &&
    !Number.isNaN(img.customWidth) &&
    zone.width > 0
  ) {
    // inverse of: width = (zone.width * 0.5 * scale) / 100
    return (img.customWidth * 200) / zone.width;
  }
  return img.scale;
}
