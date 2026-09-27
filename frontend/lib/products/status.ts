import type { AuctionStatus, PresaleStatus, Product } from "@/types/admin";

export const AUCTION_STATUS_LABEL: Record<AuctionStatus, string> = {
  upcoming: "未開始",
  live: "競標中",
  ended: "競標結束",
};

export const PRESALE_STATUS_LABEL: Record<PresaleStatus, string> = {
  upcoming: "未開始",
  live: "預售中",
  success: "預售成功",
  failed: "預售失敗",
};

export function parseProductTime(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value.replace(/\//g, "-"));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getAuctionStatus(
  startTime?: string | null,
  endTime?: string | null,
  now = new Date(),
): AuctionStatus {
  const start = parseProductTime(startTime);
  const end = parseProductTime(endTime);
  if (start && now < start) return "upcoming";
  if (end && now >= end) return "ended";
  return "live";
}

export function getPresaleStatus(
  startTime?: string | null,
  endTime?: string | null,
  currentBackers = 0,
  targetBackers = 0,
  now = new Date(),
): PresaleStatus {
  const start = parseProductTime(startTime);
  const end = parseProductTime(endTime);
  if (start && now < start) return "upcoming";
  if (end && now >= end) {
    return currentBackers >= targetBackers && targetBackers > 0
      ? "success"
      : "failed";
  }
  return "live";
}

export function getHoursLeft(endTime?: string | null, now = new Date()) {
  const end = parseProductTime(endTime);
  if (!end) return 0;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 36e5));
}

export function getDaysLeft(endTime?: string | null, now = new Date()) {
  const end = parseProductTime(endTime);
  if (!end) return 0;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 864e5));
}

export function getPresaleProgress(currentBackers = 0, targetBackers = 0) {
  if (targetBackers <= 0) return 0;
  return Math.min(Math.round((currentBackers / targetBackers) * 100), 999);
}

export function getAuctionPrices(product: Pick<
  Product,
  "price" | "auctionStartPrice" | "currentBid" | "auctionMinIncrement"
>) {
  const auctionStartPrice = product.auctionStartPrice ?? product.price;
  const currentBid = product.currentBid ?? auctionStartPrice;
  const auctionMinIncrement = product.auctionMinIncrement ?? 100;
  return { auctionStartPrice, currentBid, auctionMinIncrement };
}

export function formatProductDateTime(value?: string | null) {
  const date = parseProductTime(value);
  if (!date) return "—";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${d} ${h}:${min}`;
}

export interface AuctionBid {
  id: string;
  bidderId: string;
  bidderLabel: string;
  amount: number;
  createdAt: string;
  withdrawn: boolean;
}

// 同一人只保留最高有效出價作為順位；同價時較早出價者優先。
export function getAuctionRanking(bids: AuctionBid[]) {
  const ranked = bids.filter((bid) => !bid.withdrawn).sort(
    (a, b) => b.amount - a.amount || Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
  return ranked.filter((bid, index) => ranked.findIndex((item) => item.bidderId === bid.bidderId) === index);
}

export const AUCTION_PAYMENT_WINDOW = 24 * 60 * 60 * 1000;

// 畫面示範用：每一順位各有 24 小時，使用自己的最高有效出價成交。
// 正式串接時，得標者與付款期限必須採用後端結果，不能由瀏覽器決定。
export function getAuctionPayment(bids: AuctionBid[], auctionEndTime: string, now = Date.now()) {
  const end = Date.parse(auctionEndTime);
  const ranking = getAuctionRanking(bids);
  if (!Number.isFinite(end) || now < end) return null;
  const index = Math.floor((now - end) / AUCTION_PAYMENT_WINDOW);
  const winner = ranking[index];
  if (!winner) return null;
  return { winner, rank: index + 1, deadline: end + (index + 1) * AUCTION_PAYMENT_WINDOW };
}

export function getMinimumAuctionBid(auctionStartPrice: number, auctionMinIncrement: number, bids: AuctionBid[]) {
  const leader = getAuctionRanking(bids)[0];
  return leader ? Math.round((leader.amount + auctionMinIncrement) * 100) / 100 : auctionStartPrice;
}
