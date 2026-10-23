import type { ProductType } from "@/types/admin";

// 商品 API 預期欄位；允許尚未提供或回傳 null，交由轉換層補預設值。
export interface ProductDetail {
  id?: string | null;
  name?: string | null;
  images?: string[] | null;
  image?: string | null;
  category?: string | null;
  categoryId?: string | number | null;
  productType?: ProductType | null;
  price?: number | null;
  stock?: number | null;
  isNew?: boolean | number | null;
  createdAt?: string | null;
  creatorId?: string | null;
  creatorName?: string | null;
  currentBackers?: number | null;
  targetBackers?: number | null;
  daysLeft?: number | null;
  presaleStartTime?: string | null;
  presaleEndTime?: string | null;
  auctionStartPrice?: number | null;
  currentBid?: number | null;
  auctionMinIncrement?: number | null;
  auctionStartTime?: string | null;
  auctionEndTime?: string | null;
  hoursLeft?: number | null;
}
