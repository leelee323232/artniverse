// Print zone definition
export interface PrintZone {
  id: string;
  name: string;
  width: number; // max width in cm
  height: number; // max height in cm
  position: { x: number; y: number; w: number; h: number }; // percentage position on mockup
}

// Product definition with zones
export interface ProductDefinition {
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
export const platformProducts: ProductDefinition[] = [
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
  // {
  //   id: "mug",
  //   name: "Mug",
  //   nameZh: "馬克杯",
  //   category: "生活用品",
  //   baseCost: 120,
  //   minOrder: 10,
  //   hasMinQuantity: true,
  //   printZones: [
  //     {
  //       id: "left",
  //       name: "左側",
  //       width: 8,
  //       height: 9,
  //       position: { x: 15, y: 30, w: 25, h: 45 },
  //     },
  //     {
  //       id: "center",
  //       name: "中間",
  //       width: 8,
  //       height: 9,
  //       position: { x: 38, y: 30, w: 25, h: 45 },
  //     },
  //     {
  //       id: "right",
  //       name: "右側",
  //       width: 8,
  //       height: 9,
  //       position: { x: 60, y: 30, w: 25, h: 45 },
  //     },
  //   ],
  //   specs: ["容量: 350ml", "材質: 陶瓷", "可微波", "可機洗"],
  // },
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
