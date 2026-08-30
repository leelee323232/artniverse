// 後台共用型別定義

export interface AdminBaseEntity {
  id: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

// 產品類別
export interface ProductCategory extends AdminBaseEntity {
  name: string;
}

// 創作者類別
export interface CreatorCategory extends AdminBaseEntity {
  name: string;
}

// 產品
export interface Product extends AdminBaseEntity {
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  stock: number;
}

// 創作者
export interface Creator extends AdminBaseEntity {
  name: string;
  avatarUrl: string;
  categoryId: string;
  specialty: string;
}

// 活動區塊
export interface Activity extends AdminBaseEntity {
  title: string;
  linkUrl: string;
  imageUrl: string;
  startTime: string | null;       // 活動開始時間
  endTime: string | null;         // 活動結束時間
  publishStartTime: string | null; // 上架時間
  publishEndTime: string | null;   // 下架時間
}

// 熱門創作者
export interface FeaturedCreator extends AdminBaseEntity {
  creatorId: string;
}

// 熱門商品
export interface FeaturedProduct extends AdminBaseEntity {
  productId: string;
}

// 商品開發申請 - 審核狀態
export type ProductApplicationStatus = "pending" | "approved" | "rejected";

// 商品開發申請 - 單一印刷區域的設計
export interface ProductApplicationDesign {
  zoneName: string; // 印刷區域名稱，例如「正面」
  imageUrl: string; // 設計圖預覽
}

// 商品開發申請（對應創作者「新增商品」流程送出的資料）
export interface ProductApplication {
  id: string;
  date: string; // 申請日期
  status: ProductApplicationStatus;
  rejectReason?: string;

  // 申請者資訊
  creatorName: string; // 創作者暱稱／真實姓名
  brandName: string; // 品牌名稱

  // 產品資訊
  productType: string; // 產品中文名稱，例如「T恤」
  productTypeEn: string; // 產品英文名稱
  category: string; // 產品分類
  isCustomProduct?: boolean; // 是否為客製化產品需求
  customRequest?: string; // 客製化產品描述
  designs: ProductApplicationDesign[]; // 各印刷區域設計圖
  printSize: string; // 最大印刷尺寸，例如「15 x 20 cm」

  // 價格與成本
  baseCost: number; // 產品基本成本
  printingCost: number; // 印刷費用
  productionCost: number; // 生產成本 (baseCost + printingCost)
  stockingCost: number; // 備貨成本 (生產成本 * 130%)
  sellingPrice: number; // 創作者設定售價
  preOrderQuantity?: number; // 預先備貨數量（可選）
}
