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
  "price" | "startingPrice" | "currentBid" | "minBidIncrement"
>) {
  const startingPrice = product.startingPrice ?? product.price;
  const currentBid = product.currentBid ?? startingPrice;
  const minBidIncrement = product.minBidIncrement ?? 100;
  return { startingPrice, currentBid, minBidIncrement };
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
