import type { ProductDetail } from "@/lib/products-api";
import type { ProductType } from "@/types/admin";

function numberOr(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value : fallback;
}

function dateOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() &&
    !Number.isNaN(new Date(value.replace(/\//g, "-")).getTime())
    ? value : null;
}

// API 與展示資料共用；日期交給卡片計算倒數，缺值時使用倒數欄位。
export function normalizeShopProduct(item: ProductDetail) {
  const price = numberOr(item.price);
  const auctionStartPrice = numberOr(item.auctionStartPrice, price);
  const productType: ProductType = item.productType === "presale" || item.productType === "auction"
    ? item.productType : "general";
  return {
    id: String(item.id ?? ""),
    name: item.name ?? "未命名商品",
    image: item.images?.[0] ?? "",
    category: item.category ?? "",
    categoryId: item.categoryId ?? "",
    productType,
    price,
    stock: numberOr(item.stock),
    isNew: item.isNew ?? false,
    creatorId: item.creatorId ?? "",
    creatorName: item.creatorName ?? "",
    currentBackers: numberOr(item.currentBackers),
    targetBackers: numberOr(item.targetBackers),
    daysLeft: numberOr(item.daysLeft),
    presaleStartTime: dateOrNull(item.presaleStartTime),
    presaleEndTime: dateOrNull(item.presaleEndTime),
    auctionStartPrice,
    currentBid: numberOr(item.currentBid, auctionStartPrice),
    auctionMinIncrement: numberOr(item.auctionMinIncrement, 100),
    auctionStartTime: dateOrNull(item.auctionStartTime),
    auctionEndTime: dateOrNull(item.auctionEndTime),
    hoursLeft: numberOr(item.hoursLeft),
  };
}
