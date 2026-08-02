"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ImagePlus,
  Package,
  Loader2,
  Check,
  AlertCircle,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Send,
  Calculator,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  Layers,
  Hand,
  MousePointer,
  Search,
} from "lucide-react";

// Print zone definition
interface PrintZone {
  id: string;
  name: string;
  width: number; // max width in cm
  height: number; // max height in cm
  position: { x: number; y: number; w: number; h: number }; // percentage position on mockup
}

// Product definition with zones
interface ProductDefinition {
  id: string;
  name: string;
  nameZh: string;
  category: string;
  baseCost: number;
  minOrder: number;
  hasMinQuantity: boolean;
  printZones: PrintZone[];
  specs: string[];
}

// Predefined products with print zones
const platformProducts: ProductDefinition[] = [
  {
    id: "tshirt",
    name: "T-Shirt",
    nameZh: "T恤",
    category: "服飾",
    baseCost: 180,
    minOrder: 1,
    hasMinQuantity: false,
    printZones: [
      {
        id: "front",
        name: "正面",
        width: 30,
        height: 40,
        position: { x: 25, y: 20, w: 50, h: 50 },
      },
      {
        id: "back",
        name: "背面",
        width: 30,
        height: 40,
        position: { x: 25, y: 20, w: 50, h: 50 },
      },
    ],
    specs: [
      "材質: 100% 純棉",
      "重量: 180g",
      "尺寸: XS-3XL",
      "顏色: 黑/白/灰/海軍藍",
    ],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    nameZh: "連帽衫",
    category: "服飾",
    baseCost: 450,
    minOrder: 1,
    hasMinQuantity: false,
    printZones: [
      {
        id: "front",
        name: "正面",
        width: 28,
        height: 35,
        position: { x: 22, y: 25, w: 56, h: 45 },
      },
      {
        id: "back",
        name: "背面",
        width: 28,
        height: 35,
        position: { x: 22, y: 25, w: 56, h: 45 },
      },
    ],
    specs: ["材質: 棉混紡", "重量: 320g", "尺寸: S-2XL", "附帽子與口袋"],
  },
  {
    id: "mug",
    name: "Mug",
    nameZh: "馬克杯",
    category: "生活用品",
    baseCost: 120,
    minOrder: 10,
    hasMinQuantity: true,
    printZones: [
      {
        id: "left",
        name: "左側",
        width: 8,
        height: 9,
        position: { x: 15, y: 30, w: 25, h: 45 },
      },
      {
        id: "center",
        name: "中間",
        width: 8,
        height: 9,
        position: { x: 38, y: 30, w: 25, h: 45 },
      },
      {
        id: "right",
        name: "右側",
        width: 8,
        height: 9,
        position: { x: 60, y: 30, w: 25, h: 45 },
      },
    ],
    specs: ["容量: 350ml", "材質: 陶瓷", "可微波", "可機洗"],
  },
  {
    id: "tote-bag",
    name: "Tote Bag",
    nameZh: "帆布袋",
    category: "包袋",
    baseCost: 150,
    minOrder: 1,
    hasMinQuantity: false,
    printZones: [
      {
        id: "front",
        name: "正面",
        width: 35,
        height: 40,
        position: { x: 15, y: 20, w: 70, h: 60 },
      },
      {
        id: "back",
        name: "背面",
        width: 35,
        height: 40,
        position: { x: 15, y: 20, w: 70, h: 60 },
      },
    ],
    specs: ["材質: 帆布", "尺寸: 38x42cm", "肩帶長度: 65cm"],
  },
  {
    id: "phone-case",
    name: "Phone Case",
    nameZh: "手機殼",
    category: "3C配件",
    baseCost: 200,
    minOrder: 5,
    hasMinQuantity: true,
    printZones: [
      {
        id: "back",
        name: "背面",
        width: 7,
        height: 15,
        position: { x: 18, y: 15, w: 64, h: 65 },
      },
    ],
    specs: ["材質: TPU軟殼", "適用型號: iPhone/Samsung/Pixel", "防摔設計"],
  },
  {
    id: "poster",
    name: "Poster",
    nameZh: "海報",
    category: "印刷品",
    baseCost: 80,
    minOrder: 1,
    hasMinQuantity: false,
    printZones: [
      {
        id: "full",
        name: "整面",
        width: 42,
        height: 59,
        position: { x: 10, y: 8, w: 80, h: 84 },
      },
    ],
    specs: ["尺寸: A2/A3可選", "紙質: 銅版紙 200g", "高品質印刷"],
  },
  {
    id: "sticker-pack",
    name: "Sticker Pack",
    nameZh: "貼紙組",
    category: "印刷品",
    baseCost: 60,
    minOrder: 20,
    hasMinQuantity: true,
    printZones: [
      {
        id: "sticker",
        name: "貼紙",
        width: 10,
        height: 10,
        position: { x: 25, y: 25, w: 50, h: 50 },
      },
    ],
    specs: ["尺寸: 可客製", "材質: 防水貼紙", "每組5-10張"],
  },
  {
    id: "notebook",
    name: "Notebook",
    nameZh: "筆記本",
    category: "文具",
    baseCost: 100,
    minOrder: 10,
    hasMinQuantity: true,
    printZones: [
      {
        id: "cover",
        name: "封面",
        width: 15,
        height: 21,
        position: { x: 30, y: 10, w: 55, h: 80 },
      },
    ],
    specs: ["尺寸: A5", "頁數: 80頁", "空白/橫線/方格可選"],
  },
  {
    id: "pillow",
    name: "Pillow",
    nameZh: "抱枕",
    category: "家居",
    baseCost: 280,
    minOrder: 3,
    hasMinQuantity: true,
    printZones: [
      {
        id: "front",
        name: "正面",
        width: 40,
        height: 40,
        position: { x: 12, y: 15, w: 76, h: 70 },
      },
      {
        id: "back",
        name: "背面",
        width: 40,
        height: 40,
        position: { x: 12, y: 15, w: 76, h: 70 },
      },
    ],
    specs: ["尺寸: 45x45cm", "材質: 絨布", "含枕芯"],
  },
  {
    id: "canvas",
    name: "Canvas Print",
    nameZh: "無框畫",
    category: "家居",
    baseCost: 350,
    minOrder: 1,
    hasMinQuantity: false,
    printZones: [
      {
        id: "full",
        name: "整面",
        width: 40,
        height: 50,
        position: { x: 12, y: 12, w: 76, h: 76 },
      },
    ],
    specs: ["尺寸: 40x50cm/60x80cm", "高品質帆布", "含木框"],
  },
];

// Product mockup SVG components for each zone
const ProductMockups: Record<
  string,
  Record<string, React.FC<{ className?: string; zoneHighlight?: string }>>
> = {
  tshirt: {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M50 50 L80 30 L120 30 L150 50 L170 70 L155 85 L140 70 L140 170 L60 170 L60 70 L45 85 L30 70 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <rect
          x="75"
          y="55"
          width="50"
          height="70"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="130" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M50 50 L80 30 L120 30 L150 50 L170 70 L155 85 L140 70 L140 170 L60 170 L60 70 L45 85 L30 70 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <rect
          x="75"
          y="55"
          width="50"
          height="70"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="130" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  hoodie: {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M45 55 L75 35 L85 35 L100 50 L115 35 L125 35 L155 55 L175 75 L160 90 L145 75 L145 170 L55 170 L55 75 L40 90 L25 75 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <ellipse
          cx="100"
          cy="40"
          rx="15"
          ry="12"
          fill="#2a2a2a"
          stroke="#555"
        />
        <rect
          x="70"
          y="60"
          width="60"
          height="65"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="140" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M45 55 L75 35 L85 35 L100 50 L115 35 L125 35 L155 55 L175 75 L160 90 L145 75 L145 170 L55 170 L55 75 L40 90 L25 75 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <ellipse
          cx="100"
          cy="40"
          rx="15"
          ry="12"
          fill="#2a2a2a"
          stroke="#555"
        />
        <rect
          x="70"
          y="60"
          width="60"
          height="65"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="140" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  mug: {
    left: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="50"
          width="90"
          height="110"
          rx="8"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <path
          d="M135 70 Q165 70 165 100 Q165 130 135 130"
          fill="none"
          stroke="#ccc"
          strokeWidth="8"
        />
        <rect
          x="50"
          y="60"
          width="30"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="4"
          opacity={zoneHighlight ? "0.5" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="65" y="170" textAnchor="middle" fill="#666" fontSize="8">
          左側
        </text>
      </svg>
    ),
    center: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="50"
          width="90"
          height="110"
          rx="8"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <path
          d="M135 70 Q165 70 165 100 Q165 130 135 130"
          fill="none"
          stroke="#ccc"
          strokeWidth="8"
        />
        <rect
          x="75"
          y="60"
          width="30"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="4"
          opacity={zoneHighlight ? "0.5" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="90" y="170" textAnchor="middle" fill="#666" fontSize="8">
          中間
        </text>
      </svg>
    ),
    right: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="50"
          width="90"
          height="110"
          rx="8"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <path
          d="M135 70 Q165 70 165 100 Q165 130 135 130"
          fill="none"
          stroke="#ccc"
          strokeWidth="8"
        />
        <rect
          x="100"
          y="60"
          width="30"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="4"
          opacity={zoneHighlight ? "0.5" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="115" y="170" textAnchor="middle" fill="#666" fontSize="8">
          右側
        </text>
      </svg>
    ),
  },
  "tote-bag": {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="40"
          y="60"
          width="120"
          height="120"
          fill="#d4c4b0"
          stroke="#b5a590"
          strokeWidth="2"
        />
        <path
          d="M70 60 Q70 30 100 30 Q130 30 130 60"
          fill="none"
          stroke="#b5a590"
          strokeWidth="6"
        />
        <rect
          x="55"
          y="75"
          width="90"
          height="90"
          fill={zoneHighlight || "#c9b9a5"}
          rx="2"
          opacity={zoneHighlight ? "0.4" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="40"
          y="60"
          width="120"
          height="120"
          fill="#d4c4b0"
          stroke="#b5a590"
          strokeWidth="2"
        />
        <path
          d="M70 60 Q70 30 100 30 Q130 30 130 60"
          fill="none"
          stroke="#b5a590"
          strokeWidth="6"
        />
        <rect
          x="55"
          y="75"
          width="90"
          height="90"
          fill={zoneHighlight || "#c9b9a5"}
          rx="2"
          opacity={zoneHighlight ? "0.4" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  "phone-case": {
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="60"
          y="25"
          width="80"
          height="150"
          rx="12"
          fill="#2a2a2a"
          stroke="#444"
          strokeWidth="2"
        />
        <rect x="68" y="35" width="64" height="120" rx="4" fill="#1a1a1a" />
        <circle cx="100" cy="165" r="6" fill="#333" />
        <rect
          x="72"
          y="40"
          width="56"
          height="100"
          fill={zoneHighlight || "#222"}
          rx="2"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  poster: {
    full: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="35"
          y="20"
          width="130"
          height="160"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
        />
        <rect
          x="45"
          y="30"
          width="110"
          height="140"
          fill={zoneHighlight || "#f8f8f8"}
          rx="1"
          opacity={zoneHighlight ? "0.4" : "0.8"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="190" textAnchor="middle" fill="#666" fontSize="8">
          整面
        </text>
      </svg>
    ),
  },
  "sticker-pack": {
    sticker: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="50"
          y="50"
          width="60"
          height="60"
          rx="8"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
          transform="rotate(-15 80 80)"
        />
        <rect
          x="80"
          y="60"
          width="60"
          height="60"
          rx="8"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
          transform="rotate(10 110 90)"
        />
        <rect
          x="65"
          y="90"
          width="60"
          height="60"
          rx="8"
          fill={zoneHighlight || "#fff"}
          stroke={zoneHighlight ? "#a855f7" : "#ddd"}
          strokeWidth="2"
          transform="rotate(-5 95 120)"
          strokeDasharray={zoneHighlight ? "4" : "0"}
        />
        <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="8">
          貼紙
        </text>
      </svg>
    ),
  },
  notebook: {
    cover: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="30"
          width="110"
          height="140"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
        />
        <rect x="45" y="30" width="15" height="140" fill="#e74c3c" />
        <line x1="70" y1="30" x2="70" y2="170" stroke="#ddd" strokeWidth="1" />
        <rect
          x="80"
          y="40"
          width="65"
          height="120"
          fill={zoneHighlight || "#f9f9f9"}
          rx="1"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          封面
        </text>
      </svg>
    ),
  },
  pillow: {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="30"
          y="40"
          width="140"
          height="120"
          rx="20"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <rect
          x="45"
          y="55"
          width="110"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="10"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="30"
          y="40"
          width="140"
          height="120"
          rx="20"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <rect
          x="45"
          y="55"
          width="110"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="10"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  canvas: {
    full: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="25"
          y="25"
          width="150"
          height="150"
          fill="#8b7355"
          stroke="#6b5344"
          strokeWidth="3"
        />
        <rect
          x="35"
          y="35"
          width="130"
          height="130"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="1"
        />
        <rect
          x="45"
          y="45"
          width="110"
          height="110"
          fill={zoneHighlight || "#fafafa"}
          rx="1"
          opacity={zoneHighlight ? "0.4" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          整面
        </text>
      </svg>
    ),
  },
};

interface DesignImage {
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
function calculatePrintSize(scale: number, zone: PrintZone) {
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
function getEffectivePrintSize(img: DesignImage, zone: PrintZone) {
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

// Repeating watermark overlaid on top of uploaded design previews.
// The mockup is for reference only, so previews are always watermarked.
const WATERMARK_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><text x="10" y="82" fill="rgba(255,255,255,0.32)" font-size="15" font-weight="bold" font-family="Arial, sans-serif" transform="rotate(-30 75 75)">ARTNIVERSE</text></svg>`,
);

function WatermarkOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-10 ${className || ""}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${WATERMARK_SVG}")`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}

export default function NewProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Product selection
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDefinition | null>(null);
  const [customProductRequest, setCustomProductRequest] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Zone selection
  const [activeZoneId, setActiveZoneId] = useState<string>("");

  // Multiple design uploads - organized by zone
  const [designImages, setDesignImages] = useState<DesignImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  // Editor state
  const [editorZoom, setEditorZoom] = useState(100);
  const [editorTool, setEditorTool] = useState<"select" | "pan">("select");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Pricing
  const [sellingPrice, setSellingPrice] = useState("");
  const [preOrderQuantity, setPreOrderQuantity] = useState("");
  const [wantPreOrder, setWantPreOrder] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Set default zone when product is selected
  useEffect(() => {
    if (selectedProduct && selectedProduct.printZones.length > 0) {
      setActiveZoneId(selectedProduct.printZones[0].id);
    }
  }, [selectedProduct]);

  // Filter products by search query (matches Chinese or English name); empty query shows all
  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const filteredProducts = normalizedProductSearch
    ? platformProducts.filter(
        (product) =>
          product.nameZh.toLowerCase().includes(normalizedProductSearch) ||
          product.name.toLowerCase().includes(normalizedProductSearch),
      )
    : platformProducts;

  // Get active zone
  const activeZone = selectedProduct?.printZones.find(
    (z) => z.id === activeZoneId,
  );

  // Get images for active zone
  const activeZoneImages = designImages.filter(
    (img) => img.zoneId === activeZoneId,
  );

  // Get selected image
  const selectedImage = designImages.find((img) => img.id === selectedImageId);

  // Calculate current print size (user-defined size takes priority over auto size)
  const currentPrintSize =
    selectedImage && activeZone
      ? getEffectivePrintSize(selectedImage, activeZone)
      : null;

  // Local input state for the editable print size fields (kept as strings for smooth typing)
  const [printWidthInput, setPrintWidthInput] = useState("");
  const [printHeightInput, setPrintHeightInput] = useState("");

  // Sync the size inputs when the selection, zone, or auto scale changes.
  // (Editing the inputs updates customWidth/customHeight, which are NOT in the deps,
  //  so typing stays smooth; the scale slider clears custom sizes and re-syncs here.)
  useEffect(() => {
    if (selectedImage && activeZone) {
      const size = getEffectivePrintSize(selectedImage, activeZone);
      setPrintWidthInput(String(size.width));
      setPrintHeightInput(String(size.height));
    } else {
      setPrintWidthInput("");
      setPrintHeightInput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImageId, activeZoneId, selectedImage?.scale]);

  // Commit a manually-entered print size (in cm) onto the selected image
  const commitPrintSize = (widthStr: string, heightStr: string) => {
    if (!selectedImage || !activeZone) return;
    const w = parseFloat(widthStr);
    const h = parseFloat(heightStr);
    if (Number.isNaN(w) || Number.isNaN(h) || w <= 0 || h <= 0) return;
    updateImage(selectedImage.id, {
      customWidth: Math.round(w * 10) / 10,
      customHeight: Math.round(h * 10) / 10,
    });
  };

  // Check if print size exceeds max
  const isPrintSizeExceeded =
    currentPrintSize &&
    activeZone &&
    (currentPrintSize.width > activeZone.width ||
      currentPrintSize.height > activeZone.height);

  // Calculate total print area for cost calculation
  const getTotalPrintArea = useCallback(() => {
    if (!selectedProduct) return { width: 0, height: 0 };

    let maxWidth = 0;
    let maxHeight = 0;

    designImages.forEach((img) => {
      const zone = selectedProduct.printZones.find((z) => z.id === img.zoneId);
      if (zone) {
        const size = getEffectivePrintSize(img, zone);
        maxWidth = Math.max(maxWidth, size.width);
        maxHeight = Math.max(maxHeight, size.height);
      }
    });

    return { width: maxWidth, height: maxHeight };
  }, [designImages, selectedProduct]);

  // Calculate costs with new formula
  const calculateCosts = useCallback(() => {
    if (!selectedProduct) return null;

    const totalPrint = getTotalPrintArea();
    const baseCost = selectedProduct.baseCost; // 1. 產品基本成本
    const printingCost =
      totalPrint.width > 0 && totalPrint.height > 0
        ? Math.round(totalPrint.width * totalPrint.height * 0.5)
        : 0; // 2. 印刷費用

    const productionCost = baseCost + printingCost; // 生產成本 = 1 + 2
    const stockingCost = Math.round(productionCost * 1.3); // 3. 備貨成本 = (1+2) * 130%

    const price = sellingPrice ? parseFloat(sellingPrice) : 0;
    // 4. 無備貨的自然流量訂單分潤 = (售價 - 生產成本) * 20%
    const passiveIncome =
      price > productionCost ? Math.round((price - productionCost) * 0.2) : 0;

    // 備貨訂單的利潤
    const stockingProfit = price > stockingCost ? price - stockingCost : 0;

    return {
      baseCost,
      printingCost,
      productionCost,
      stockingCost,
      passiveIncome,
      stockingProfit,
      totalPrintWidth: totalPrint.width,
      totalPrintHeight: totalPrint.height,
    };
  }, [selectedProduct, getTotalPrintArea, sellingPrice]);

  const costs = calculateCosts();

  // Handle file upload - support multiple files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !activeZoneId) return;

    Array.from(files).forEach((file) => {
      if (!file.type.includes("png")) {
        alert("請上傳PNG透明去背圖片");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: DesignImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: event.target?.result as string,
          file,
          position: { x: 50, y: 50 },
          scale: 100,
          rotation: 0,
          zoneId: activeZoneId,
        };
        setDesignImages((prev) => [...prev, newImage]);
        setSelectedImageId(newImage.id);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Delete image
  const deleteImage = (id: string) => {
    setDesignImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      const remaining = designImages.filter((img) => img.id !== id);
      setSelectedImageId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Update image properties
  const updateImage = (id: string, updates: Partial<DesignImage>) => {
    setDesignImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, ...updates } : img)),
    );
  };

  // Handle mouse down on image for dragging
  const handleImageMouseDown = (e: React.MouseEvent, imageId: string) => {
    if (editorTool !== "select") return;
    e.stopPropagation();
    e.preventDefault();

    setSelectedImageId(imageId);
    setIsDragging(true);

    const rect = editorRef.current?.getBoundingClientRect();
    if (!rect) return;

    const image = designImages.find((img) => img.id === imageId);
    if (!image) return;

    setDragStart({
      x: e.clientX - (image.position.x * rect.width) / 100,
      y: e.clientY - (image.position.y * rect.height) / 100,
    });
  };

  // Handle mouse move for dragging or panning
  const handleEditorMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedImageId && editorTool === "select") {
      const rect = editorRef.current?.getBoundingClientRect();
      if (!rect) return;

      const newX = Math.max(
        0,
        Math.min(100, ((e.clientX - dragStart.x) / rect.width) * 100),
      );
      const newY = Math.max(
        0,
        Math.min(100, ((e.clientY - dragStart.y) / rect.height) * 100),
      );

      updateImage(selectedImageId, { position: { x: newX, y: newY } });
    } else if (isPanning && editorTool === "pan") {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setPanOffset({ x: deltaX, y: deltaY });
    }
  };

  // Handle mouse up
  const handleEditorMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  // Handle pan start
  const handleEditorMouseDown = (e: React.MouseEvent) => {
    if (editorTool === "pan") {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  // Reset editor view
  const resetEditorView = () => {
    setEditorZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };

  // Reset selected image position
  const resetImagePosition = () => {
    if (selectedImageId) {
      updateImage(selectedImageId, {
        position: { x: 50, y: 50 },
        scale: 100,
        rotation: 0,
        customWidth: undefined,
        customHeight: undefined,
      });
    }
  };

  // Submit application
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setShowSuccessDialog(true);
  };

  // Validation - check all zones have at least one image or no zones exceed size
  const hasAnyDesigns = designImages.length > 0;
  const allDesignsValid = !designImages.some((img) => {
    const zone = selectedProduct?.printZones.find((z) => z.id === img.zoneId);
    if (!zone) return false;
    const size = getEffectivePrintSize(img, zone);
    return size.width > zone.width || size.height > zone.height;
  });

  const canProceedToStep2 =
    selectedProduct !== null || customProductRequest.trim() !== "";
  const canProceedToStep3 = hasAnyDesigns && allDesignsValid;
  const canSubmit =
    sellingPrice &&
    parseFloat(sellingPrice) > 0 &&
    (!selectedProduct?.hasMinQuantity ||
      (preOrderQuantity &&
        parseInt(preOrderQuantity) >= (selectedProduct?.minOrder || 0)));

  // Get product mockup component for active zone
  const getMockupComponent = (productId: string, zoneId: string) => {
    const productMockups = ProductMockups[productId];
    if (!productMockups) return null;
    return productMockups[zoneId] || null;
  };

  const ActiveMockup = selectedProduct
    ? getMockupComponent(selectedProduct.id, activeZoneId)
    : null;

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />

      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/creator-portal"
            className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回創作者控制台
          </Link>
          <h1 className="mb-2 text-3xl font-bold text-foreground">新增商品</h1>
          <p className="text-muted-foreground">
            選擇產品、上傳設計、設定價格，申請產品開發
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[
              { step: 1, label: "選擇產品" },
              { step: 2, label: "上傳設計" },
              { step: 3, label: "設定價格" },
            ].map(({ step, label }) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    currentStep >= step
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent text-muted-foreground"
                  }`}
                >
                  {currentStep > step ? <Check className="h-5 w-5" /> : step}
                </div>
                <span
                  className={`ml-2 text-sm ${currentStep >= step ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {label}
                </span>
                {step < 3 && (
                  <div
                    className={`mx-4 h-0.5 w-16 ${currentStep > step ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Product Selection */}
        {currentStep === 1 && (
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-foreground">
                步驟 1: 選擇產品類型
              </h2>
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="搜尋商品名稱"
                  className="bg-white/5 pl-9"
                />
              </div>
            </div>

            {normalizedProductSearch && filteredProducts.length === 0 && (
              <p className="mb-4 text-sm text-muted-foreground">
                找不到符合「{productSearch}」的商品，你可以透過右下方「其他產品」告訴我們你的需求。
              </p>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const MockupComponent = getMockupComponent(
                  product.id,
                  product.printZones[0]?.id || "",
                );
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowCustomInput(false);
                      setCustomProductRequest("");
                    }}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all hover:border-primary/50 ${
                      selectedProduct?.id === product.id
                        ? "border-primary bg-primary/10"
                        : "border-border/50 bg-white/5"
                    }`}
                  >
                    {selectedProduct?.id === product.id && (
                      <div className="absolute right-2 top-2">
                        <Check className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="mb-3 flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 p-4">
                      {MockupComponent ? (
                        <MockupComponent className="h-full w-full" />
                      ) : (
                        <Package className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <h3 className="mb-1 font-bold text-foreground">
                      {product.nameZh}
                    </h3>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {product.name}
                    </p>
                    <Badge variant="outline" className="mb-2">
                      {product.category}
                    </Badge>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>基本成本: NT$ {product.baseCost}</p>
                      <p>可印刷區域: {product.printZones.length} 個</p>
                      {product.hasMinQuantity && (
                        <p className="text-yellow-500">
                          最低製作量: {product.minOrder} 件
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Custom product request option */}
              <div
                onClick={() => {
                  setSelectedProduct(null);
                  setShowCustomInput(true);
                }}
                className={`relative cursor-pointer rounded-xl border-2 border-dashed p-4 transition-all hover:border-primary/50 ${
                  showCustomInput
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-white/5"
                }`}
              >
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted/30">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-1 font-bold text-foreground">其他產品</h3>
                  <p className="text-xs text-muted-foreground">
                    找不到想要的產品？
                    <br />
                    告訴我們你的需求
                  </p>
                </div>
              </div>
            </div>

            {/* Custom product input */}
            {showCustomInput && (
              <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <Label className="mb-2 block text-foreground">
                  請描述你想製作的產品
                </Label>
                <Textarea
                  value={customProductRequest}
                  onChange={(e) => setCustomProductRequest(e.target.value)}
                  placeholder="例如：客製化滑鼠墊、環保餐具組、寵物用品..."
                  className="min-h-[100px] bg-white/5"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  <Info className="mr-1 inline h-3 w-3" />
                  我們會評估您的需求，若可行會聯繫您討論細節
                </p>
              </div>
            )}

            {/* Selected product details */}
            {selectedProduct && (
              <div className="mt-6 rounded-lg border border-border/50 bg-white/5 p-4">
                <h3 className="mb-3 font-bold text-foreground">
                  已選擇: {selectedProduct.nameZh}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      產品規格:
                    </p>
                    <ul className="space-y-1 text-sm text-foreground">
                      {selectedProduct.specs.map((spec, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-primary" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-3">
                    <p className="mb-2 text-sm text-muted-foreground">
                      可印刷區域:
                    </p>
                    <div className="space-y-2">
                      {selectedProduct.printZones.map((zone) => (
                        <div
                          key={zone.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-foreground">{zone.name}</span>
                          <span className="text-muted-foreground">
                            最大 {zone.width} x {zone.height} cm
                          </span>
                        </div>
                      ))}
                    </div>
                    {selectedProduct.hasMinQuantity && (
                      <p className="mt-3 text-sm text-yellow-500">
                        <AlertCircle className="mr-1 inline h-4 w-4" />
                        此產品有最低製作量 {selectedProduct.minOrder} 件
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                下一步: 上傳設計
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Upload Design - Canva-like Editor */}
        {currentStep === 2 && (
          <div
            className={`${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}
          >
            <Card
              className={`border-border/50 bg-card/30 backdrop-blur-sm ${isFullscreen ? "h-full rounded-none border-0" : "p-6"}`}
            >
              {/* Editor Header */}
              <div
                className={`flex items-center justify-between border-b border-border/50 ${isFullscreen ? "px-4 py-3" : "mb-6 pb-4"}`}
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-foreground">
                    步驟 2: 上傳設計並調整位置
                  </h2>
                  {selectedProduct && (
                    <Badge variant="outline">{selectedProduct.nameZh}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-transparent"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div
                className={`grid gap-4 ${isFullscreen ? "h-[calc(100%-80px)] grid-cols-[280px_1fr_280px] p-4" : "lg:grid-cols-[1fr_2fr_1fr]"}`}
              >
                {/* Left Panel: Zone Selection, Upload & Layers */}
                <div className="space-y-4 overflow-y-auto">
                  {/* Zone Selection */}
                  {selectedProduct && selectedProduct.printZones.length > 1 && (
                    <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                      <Label className="mb-3 block font-bold text-foreground">
                        選擇印刷區域
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedProduct.printZones.map((zone) => {
                          const zoneImages = designImages.filter(
                            (img) => img.zoneId === zone.id,
                          );
                          return (
                            <button
                              key={zone.id}
                              onClick={() => setActiveZoneId(zone.id)}
                              className={`relative rounded-lg border-2 p-3 text-center transition-all ${
                                activeZoneId === zone.id
                                  ? "border-primary bg-primary/10"
                                  : "border-border/30 bg-white/5 hover:border-primary/30"
                              }`}
                            >
                              <span className="text-sm font-medium text-foreground">
                                {zone.name}
                              </span>
                              {zoneImages.length > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                                  {zoneImages.length}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                    <Label className="mb-3 flex items-center gap-2 font-bold text-foreground">
                      <ImagePlus className="h-4 w-4" />
                      上傳設計圖 {activeZone && `(${activeZone.name})`}
                    </Label>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-transparent"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      新增圖片
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      支援多張 PNG 透明去背圖片
                    </p>
                  </div>

                  {/* Layers Panel */}
                  <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                    <Label className="mb-3 flex items-center gap-2 font-bold text-foreground">
                      <Layers className="h-4 w-4" />
                      圖層 - {activeZone?.name || ""} ({activeZoneImages.length}
                      )
                    </Label>
                    <div className="max-h-[300px] space-y-2 overflow-y-auto">
                      {activeZoneImages.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          尚未上傳圖片
                        </p>
                      ) : (
                        activeZoneImages.map((img, index) => (
                          <div
                            key={img.id}
                            onClick={() => setSelectedImageId(img.id)}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-colors ${
                              selectedImageId === img.id
                                ? "border-primary bg-primary/10"
                                : "border-border/30 bg-white/5 hover:border-primary/30"
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={`Layer ${index + 1}`}
                              className="h-10 w-10 rounded object-contain bg-white/10"
                            />
                            <span className="flex-1 truncate text-sm text-foreground">
                              圖層 {index + 1}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteImage(img.id);
                              }}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Current Print Size - editable by the creator */}
                  {activeZone && (
                    <div
                      className={`rounded-lg border p-4 ${isPrintSizeExceeded ? "border-red-500 bg-red-500/10" : "border-border/50 bg-white/5"}`}
                    >
                      <Label className="mb-2 block font-bold text-foreground">
                        當前印刷尺寸
                      </Label>
                      {selectedImage && currentPrintSize ? (
                        <>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <span className="mb-1 block text-xs text-muted-foreground">
                                寬 (cm)
                              </span>
                              <Input
                                type="number"
                                min={0.1}
                                step={0.1}
                                value={printWidthInput}
                                onChange={(e) => {
                                  setPrintWidthInput(e.target.value);
                                  commitPrintSize(
                                    e.target.value,
                                    printHeightInput,
                                  );
                                }}
                                className={`h-9 bg-white/5 ${isPrintSizeExceeded ? "border-red-500 text-red-500" : ""}`}
                              />
                            </div>
                            <span className="pb-2 text-muted-foreground">
                              x
                            </span>
                            <div className="flex-1">
                              <span className="mb-1 block text-xs text-muted-foreground">
                                高 (cm)
                              </span>
                              <Input
                                type="number"
                                min={0.1}
                                step={0.1}
                                value={printHeightInput}
                                onChange={(e) => {
                                  setPrintHeightInput(e.target.value);
                                  commitPrintSize(
                                    printWidthInput,
                                    e.target.value,
                                  );
                                }}
                                className={`h-9 bg-white/5 ${isPrintSizeExceeded ? "border-red-500 text-red-500" : ""}`}
                              />
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            可自行輸入尺寸；拖曳「縮放」會重新套用自動尺寸
                          </p>
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          請選擇圖層
                        </div>
                      )}
                      <div className="mt-2 text-xs text-muted-foreground">
                        最大: {activeZone.width} x {activeZone.height} cm
                      </div>
                      {isPrintSizeExceeded && (
                        <p className="mt-2 text-sm text-red-500">
                          <AlertCircle className="mr-1 inline h-4 w-4" />
                          印刷尺寸超過上限，請縮小圖片
                        </p>
                      )}
                      <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                        <Info className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        此模擬圖僅限參考，建議以實際圖片尺寸為主
                      </p>
                    </div>
                  )}
                </div>

                {/* Center: Canvas Editor */}
                <div className="flex flex-col">
                  {/* Editor Toolbar */}
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-border/50 bg-white/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          editorTool === "select" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setEditorTool("select")}
                        className={
                          editorTool === "select" ? "" : "bg-transparent"
                        }
                      >
                        <MousePointer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={editorTool === "pan" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEditorTool("pan")}
                        className={editorTool === "pan" ? "" : "bg-transparent"}
                      >
                        <Hand className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditorZoom(Math.max(25, editorZoom - 25))
                        }
                        className="bg-transparent"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <span className="min-w-[60px] text-center text-sm text-foreground">
                        {editorZoom}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditorZoom(Math.min(200, editorZoom + 25))
                        }
                        className="bg-transparent"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetEditorView}
                        className="bg-transparent"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Canvas Area */}
                  <div
                    className={`flex flex-1 items-center justify-center overflow-hidden rounded-xl border-2 border-border/50 bg-[#1a1a1a] ${
                      editorTool === "pan"
                        ? "cursor-grab active:cursor-grabbing"
                        : ""
                    }`}
                    style={{ minHeight: isFullscreen ? "auto" : "500px" }}
                  >
                    <div
                      ref={editorRef}
                      className="relative"
                      style={{
                        width: `${(300 * editorZoom) / 100}px`,
                        height: `${(300 * editorZoom) / 100}px`,
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                      }}
                      onMouseDown={handleEditorMouseDown}
                      onMouseMove={handleEditorMouseMove}
                      onMouseUp={handleEditorMouseUp}
                      onMouseLeave={handleEditorMouseUp}
                    >
                      {/* Product Mockup */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {ActiveMockup ? (
                          <ActiveMockup
                            className="h-full w-full"
                            zoneHighlight="#a855f7"
                          />
                        ) : (
                          <div className="flex h-3/4 w-3/4 items-center justify-center rounded-lg bg-white/10">
                            <Package className="h-24 w-24 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Design Images for active zone */}
                      {activeZoneImages.map((img) => (
                        <div
                          key={img.id}
                          className={`absolute cursor-move ${selectedImageId === img.id ? "ring-2 ring-primary" : ""}`}
                          style={{
                            left: `${img.position.x}%`,
                            top: `${img.position.y}%`,
                            transform: `translate(-50%, -50%) scale(${img.scale / 100}) rotate(${img.rotation}deg)`,
                            maxWidth: "50%",
                            maxHeight: "50%",
                          }}
                          onMouseDown={(e) => handleImageMouseDown(e, img.id)}
                        >
                          <img
                            src={img.url}
                            alt="Design"
                            className="max-h-full max-w-full object-contain drop-shadow-lg"
                            draggable={false}
                          />
                          <WatermarkOverlay />
                          {selectedImageId === img.id && (
                            <>
                              <div className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary" />
                              <div className="absolute -right-1.5 -top-1.5 h-3 w-3 rounded-full bg-primary" />
                              <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-primary" />
                              <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-primary" />
                            </>
                          )}
                        </div>
                      ))}

                      {/* Empty state */}
                      {activeZoneImages.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-lg bg-black/50 px-4 py-3 text-center">
                            <ImagePlus className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              上傳圖片到「{activeZone?.name || ""}」區域
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editor Tips */}
                  <div className="mt-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-muted-foreground">
                    選擇工具: 拖曳圖片移動位置 | 平移工具: 拖曳畫布移動視角 |
                    使用右側面板調整尺寸與旋轉
                  </div>
                </div>

                {/* Right Panel: Image Properties */}
                <div className="space-y-4 overflow-y-auto">
                  {selectedImage ? (
                    <>
                      {/* Selected Image Preview */}
                      <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                        <Label className="mb-3 block font-bold text-foreground">
                          選中的圖層
                        </Label>
                        <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-white/10">
                          <img
                            src={selectedImage.url}
                            alt="Selected"
                            className="h-full w-full object-contain p-2"
                          />
                        </div>
                      </div>

                      {/* Transform Controls */}
                      <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                        <Label className="mb-3 block font-bold text-foreground">
                          調整
                        </Label>

                        {/* Scale */}
                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              縮放
                            </span>
                            <span
                              className={`text-sm ${isPrintSizeExceeded ? "text-red-500 font-bold" : "text-foreground"}`}
                            >
                              {selectedImage.scale}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="200"
                            value={selectedImage.scale}
                            onChange={(e) =>
                              updateImage(selectedImage.id, {
                                scale: parseInt(e.target.value),
                                customWidth: undefined,
                                customHeight: undefined,
                              })
                            }
                            className="w-full accent-primary"
                          />
                          {currentPrintSize && (
                            <div
                              className={`mt-1 text-xs ${isPrintSizeExceeded ? "text-red-500" : "text-muted-foreground"}`}
                            >
                              印刷尺寸: {currentPrintSize.width} x{" "}
                              {currentPrintSize.height} cm
                              {isPrintSizeExceeded && " (超過上限!)"}
                            </div>
                          )}
                        </div>

                        {/* Rotation */}
                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              旋轉
                            </span>
                            <span className="text-sm text-foreground">
                              {selectedImage.rotation}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={selectedImage.rotation}
                            onChange={(e) =>
                              updateImage(selectedImage.id, {
                                rotation: parseInt(e.target.value),
                              })
                            }
                            className="w-full accent-primary"
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetImagePosition}
                          className="w-full bg-transparent"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          重置位置
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                      <p className="text-center text-sm text-muted-foreground py-8">
                        選擇一個圖層
                        <br />
                        以編輯屬性
                      </p>
                    </div>
                  )}

                  {/* All Zones Summary */}
                  {selectedProduct && selectedProduct.printZones.length > 1 && (
                    <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                      <Label className="mb-3 block font-bold text-foreground">
                        各區域設計數量
                      </Label>
                      <div className="space-y-2">
                        {selectedProduct.printZones.map((zone) => {
                          const zoneImages = designImages.filter(
                            (img) => img.zoneId === zone.id,
                          );
                          return (
                            <div
                              key={zone.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {zone.name}
                              </span>
                              <span
                                className={`${zoneImages.length > 0 ? "text-primary" : "text-muted-foreground"}`}
                              >
                                {zoneImages.length} 張
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="rounded-lg bg-primary/10 p-3 text-sm text-muted-foreground">
                    <Info className="mr-1 inline h-4 w-4 text-primary" />
                    此為效果示意圖，實際成品可能略有差異。
                  </div>
                </div>
              </div>

              {/* Footer Navigation */}
              <div
                className={`flex justify-between border-t border-border/50 ${isFullscreen ? "px-4 py-3" : "mt-6 pt-4"}`}
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsFullscreen(false);
                    setCurrentStep(1);
                  }}
                  className="bg-transparent"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  上一步
                </Button>
                <Button
                  onClick={() => {
                    setIsFullscreen(false);
                    setCurrentStep(3);
                  }}
                  disabled={!canProceedToStep3}
                  className="bg-gradient-to-r from-primary to-secondary"
                >
                  {!allDesignsValid ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      有設計超過尺寸限制
                    </>
                  ) : (
                    "下一步: 設定價格"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Pricing - Updated Formula */}
        {currentStep === 3 && (
          <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
            <h2 className="mb-6 text-xl font-bold text-foreground">
              步驟 3: 設定價格與數量
            </h2>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Pricing Info */}
              <div className="space-y-4">
                {/* Cost Breakdown */}
                <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">成本計算</h3>
                  </div>

                  {costs && (
                    <div className="space-y-3">
                      {/* 1. Base Cost */}
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <span className="text-muted-foreground">
                          1. 產品基本成本
                        </span>
                        <span className="text-foreground">
                          NT$ {costs.baseCost}
                        </span>
                      </div>

                      {/* 2. Printing Cost */}
                      <div className="flex items-center justify-between border-b border-border/30 pb-2">
                        <div>
                          <span className="text-muted-foreground">
                            2. 印刷費用
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({costs.totalPrintWidth}x{costs.totalPrintHeight}cm)
                          </span>
                        </div>
                        <span className="text-foreground">
                          NT$ {costs.printingCost}
                        </span>
                      </div>

                      {/* Production Cost (1+2) */}
                      <div className="flex items-center justify-between border-b border-border/30 pb-2 text-sm">
                        <span className="text-muted-foreground">
                          生產成本 (1+2)
                        </span>
                        <span className="text-muted-foreground">
                          NT$ {costs.productionCost}
                        </span>
                      </div>

                      {/* 3. Stocking Cost */}
                      <div className="flex items-center justify-between rounded-lg bg-blue-500/10 p-3">
                        <div>
                          <span className="font-bold text-foreground">
                            3. 您的備貨成本
                          </span>
                          <p className="text-xs text-muted-foreground">
                            生產成本 + 30% 倉儲物流費
                          </p>
                        </div>
                        <span className="text-xl font-bold text-blue-500">
                          NT$ {costs.stockingCost}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selling Price Input */}
                <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                  <Label className="mb-3 flex items-center gap-2 font-bold text-foreground">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    設定您的售價
                  </Label>
                  <Input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="輸入您想販售的價格"
                    className="bg-white/5 text-lg"
                  />

                  {sellingPrice && costs && (
                    <div className="mt-4 space-y-3">
                      {/* Stocking Order Profit */}
                      <div className="rounded-lg bg-green-500/10 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-green-500" />
                          <span className="font-bold text-foreground">
                            備貨訂單利潤
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              您的售價
                            </span>
                            <span className="text-foreground">
                              NT$ {parseFloat(sellingPrice).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              備貨成本
                            </span>
                            <span className="text-foreground">
                              - NT$ {costs.stockingCost}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-border/30 pt-1">
                            <span className="font-bold text-foreground">
                              每件淨利潤
                            </span>
                            <span
                              className={`text-lg font-bold ${costs.stockingProfit > 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              NT$ {costs.stockingProfit}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Passive Income */}
                      <div className="rounded-lg bg-amber-500/10 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          <span className="font-bold text-foreground">
                            4. 無備貨的自然流量分潤
                          </span>
                        </div>
                        <p className="mb-2 text-xs text-muted-foreground">
                          顧客從網站或廣告直接下單，您無需備貨的被動收益
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              計算方式
                            </span>
                            <span className="text-muted-foreground">
                              (售價 - 生產成本) x 20%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              ({sellingPrice} - {costs.productionCost}) x 20%
                            </span>
                            <span className="text-muted-foreground">=</span>
                          </div>
                          <div className="flex justify-between border-t border-border/30 pt-1">
                            <span className="font-bold text-foreground">
                              每件被動收益
                            </span>
                            <span className="text-lg font-bold text-amber-500">
                              NT$ {costs.passiveIncome}
                            </span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          此收益模式無需扣除平台服務費
                        </p>
                      </div>
                    </div>
                  )}

                  {sellingPrice &&
                    costs &&
                    parseFloat(sellingPrice) < costs.stockingCost && (
                      <p className="mt-2 text-sm text-red-500">
                        <AlertCircle className="mr-1 inline h-4 w-4" />
                        售價低於備貨成本，備貨訂單將會虧損
                      </p>
                    )}
                </div>

                {/* Pre-order Option */}
                <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-foreground">預先備貨</h3>
                  </div>

                  {selectedProduct?.hasMinQuantity ? (
                    <div className="space-y-3">
                      <div className="rounded-lg bg-yellow-500/10 p-3">
                        <p className="text-sm text-yellow-500">
                          <AlertCircle className="mr-1 inline h-4 w-4" />
                          此產品有最低製作量 {selectedProduct.minOrder}{" "}
                          件，請填寫預製數量
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          預製數量 (最少 {selectedProduct.minOrder} 件)
                        </Label>
                        <Input
                          type="number"
                          value={preOrderQuantity}
                          onChange={(e) => setPreOrderQuantity(e.target.value)}
                          placeholder={`最少 ${selectedProduct.minOrder} 件`}
                          className="bg-white/5"
                          min={selectedProduct.minOrder}
                        />
                      </div>
                      {preOrderQuantity &&
                        parseInt(preOrderQuantity) >=
                          selectedProduct.minOrder &&
                        costs && (
                          <div className="rounded-lg bg-primary/10 p-3">
                            <p className="text-sm text-muted-foreground">
                              預製費用:
                            </p>
                            <p className="text-xl font-bold text-foreground">
                              NT${" "}
                              {(
                                costs.stockingCost * parseInt(preOrderQuantity)
                              ).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              申請通過後需先支付此費用
                            </p>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="want-preorder"
                          checked={wantPreOrder}
                          onChange={(e) => setWantPreOrder(e.target.checked)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        <Label
                          htmlFor="want-preorder"
                          className="cursor-pointer"
                        >
                          我想預先備貨 (可選)
                        </Label>
                      </div>
                      {wantPreOrder && (
                        <>
                          <div className="space-y-2">
                            <Label>預製數量</Label>
                            <Input
                              type="number"
                              value={preOrderQuantity}
                              onChange={(e) =>
                                setPreOrderQuantity(e.target.value)
                              }
                              placeholder="輸入數量"
                              className="bg-white/5"
                              min={1}
                            />
                          </div>
                          {preOrderQuantity &&
                            parseInt(preOrderQuantity) > 0 &&
                            costs && (
                              <div className="rounded-lg bg-primary/10 p-3">
                                <p className="text-sm text-muted-foreground">
                                  預製費用:
                                </p>
                                <p className="text-xl font-bold text-foreground">
                                  NT${" "}
                                  {(
                                    costs.stockingCost *
                                    parseInt(preOrderQuantity)
                                  ).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  申請通過後需先支付此費用
                                </p>
                              </div>
                            )}
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">
                        此產品支援單件生產，您可以選擇不預先備貨，接到訂單後再製作
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Preview Summary */}
              <div className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-white/5 p-4">
                  <h3 className="mb-4 font-bold text-foreground">產品預覽</h3>

                  {/* Show all zones with their designs */}
                  {selectedProduct && (
                    <div className="space-y-4">
                      {selectedProduct.printZones.map((zone) => {
                        const zoneImages = designImages.filter(
                          (img) => img.zoneId === zone.id,
                        );
                        const ZoneMockup = getMockupComponent(
                          selectedProduct.id,
                          zone.id,
                        );

                        return (
                          <div
                            key={zone.id}
                            className="rounded-lg bg-muted/20 p-3"
                          >
                            <p className="mb-2 text-sm font-medium text-foreground">
                              {zone.name}
                            </p>
                            <div className="relative aspect-square overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/10">
                              <div className="relative flex h-full items-center justify-center">
                                {ZoneMockup ? (
                                  <ZoneMockup className="h-3/4 w-3/4" />
                                ) : (
                                  <div className="flex h-3/4 w-3/4 items-center justify-center rounded-lg bg-white/10">
                                    <Package className="h-16 w-16 text-muted-foreground/30" />
                                  </div>
                                )}
                                {/* Show all images for this zone */}
                                {zoneImages.map((img) => (
                                  <div
                                    key={img.id}
                                    className="pointer-events-none absolute"
                                    style={{
                                      left: `${img.position.x}%`,
                                      top: `${img.position.y}%`,
                                      transform: `translate(-50%, -50%) scale(${(img.scale / 100) * 0.6}) rotate(${img.rotation}deg)`,
                                      maxWidth: "40%",
                                      maxHeight: "40%",
                                    }}
                                  >
                                    <img
                                      src={img.url}
                                      alt="Design preview"
                                      className="max-h-full max-w-full object-contain drop-shadow-lg"
                                    />
                                    <WatermarkOverlay />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {zoneImages.length > 0
                                ? `${zoneImages.length} 張設計圖`
                                : "無設計"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 space-y-2 border-t border-border/30 pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">產品類型</span>
                      <span className="text-foreground">
                        {selectedProduct?.nameZh || customProductRequest}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">印刷區域</span>
                      <span className="text-foreground">
                        {selectedProduct?.printZones.length || 1} 個
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">設計圖總數</span>
                      <span className="text-foreground">
                        {designImages.length} 張
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">售價</span>
                      <span className="font-bold text-foreground">
                        NT$ {sellingPrice || "-"}
                      </span>
                    </div>
                    {(selectedProduct?.hasMinQuantity || wantPreOrder) &&
                      preOrderQuantity && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            預製數量
                          </span>
                          <span className="text-foreground">
                            {preOrderQuantity} 件
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Application Note */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <h4 className="mb-2 flex items-center gap-2 font-bold text-foreground">
                    <Info className="h-4 w-4 text-primary" />
                    申請說明
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      提交申請後，我們會在 1-3 個工作天內審核
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      審核通過後，您才能編輯商品詳細資訊
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      第一張商品圖會由我們提供效果圖
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      產品規格由系統自動填寫，無法更改
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="bg-transparent"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                上一步
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    申請產品開發
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md border-green-500/30 bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-500">
              <Check className="h-6 w-6" />
              申請已提交
            </DialogTitle>
            <DialogDescription>
              您的產品開發申請已成功提交！我們會在 1-3 個工作天內審核您的申請。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/20 p-4">
              <h4 className="mb-2 font-bold text-foreground">接下來的步驟：</h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>我們會審核您的設計和產品設定</li>
                <li>審核通過後，您會收到通知</li>
                <li>您可以在「商品管理」編輯商品詳情</li>
                <li>設定完成後，商品即可上架販售</li>
              </ol>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => router.push("/creator-portal")}
              className="w-full bg-gradient-to-r from-primary to-secondary"
            >
              返回創作者控制台
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
