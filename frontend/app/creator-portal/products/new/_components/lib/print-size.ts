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

// Each manually entered dimension independently overrides its automatic value.
// This lets a creator edit only the height without resetting the width.
export function getEffectivePrintSize(img: DesignImage, zone: PrintZone) {
  const automaticSize = calculatePrintSize(img.scale, zone);
  return {
    width:
      img.customWidth != null && !Number.isNaN(img.customWidth)
        ? img.customWidth
        : automaticSize.width,
    height:
      img.customHeight != null && !Number.isNaN(img.customHeight)
        ? img.customHeight
        : automaticSize.height,
  };
}

// Height and width can be set independently, so the editor needs separate
// horizontal and vertical scale values rather than one uniform scale.
export function getEffectiveScaleFactors(img: DesignImage, zone: PrintZone) {
  const size = getEffectivePrintSize(img, zone);
  return {
    x: (size.width * 200) / zone.width,
    y: (size.height * 200) / zone.height,
  };
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
