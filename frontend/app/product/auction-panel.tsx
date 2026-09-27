"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Gavel, RotateCcw, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  AUCTION_STATUS_LABEL,
  getAuctionStatus,
  getAuctionRanking,
  getAuctionPayment,
  getMinimumAuctionBid,
  type AuctionBid,
} from "@/lib/products/status";
import type { Product } from "@/types/admin";

const PREVIEW_BIDDER_ID = "preview-member";
const money = (value: number) => `NT$ ${value.toLocaleString("zh-TW")}`;
const dateTime = (value: string | number) =>
  new Date(value).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour12: false,
  });

function remaining(until: number, now: number) {
  const seconds = Math.max(0, Math.ceil((until - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days > 0 ? `${days} 天 ` : ""}${hours} 小時 ${minutes} 分 ${seconds % 60} 秒`;
}

// 只供畫面操作；重新載入會還原。不呼叫 API、不代表真實出價或得標。
function createPreviewBids(product: Product): AuctionBid[] {
  if (
    !product.currentBid ||
    product.currentBid <= (product.auctionStartPrice ?? 0)
  )
    return [];
  const end = Date.parse(product.auctionEndTime ?? "");
  const start = Date.parse(product.auctionStartTime ?? "");
  if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
  const previous = Math.max(
    product.auctionStartPrice ?? 0,
    product.currentBid - (product.auctionMinIncrement ?? 0),
  );
  return [
    {
      id: "preview-1",
      bidderId: "member-a",
      bidderLabel: "星***",
      amount: previous,
      createdAt: new Date(start + 60000).toISOString(),
      withdrawn: false,
    },
    {
      id: "preview-2",
      bidderId: end <= Date.now() ? PREVIEW_BIDDER_ID : "member-b",
      bidderLabel: end <= Date.now() ? "你" : "宇***",
      amount: product.currentBid,
      createdAt: new Date(start + 120000).toISOString(),
      withdrawn: false,
    },
  ];
}

export function AuctionPanel({ product }: { product: Product }) {
  const [bids, setBids] = useState<AuctionBid[]>([]);
  const [now, setNow] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [dialog, setDialog] = useState<"bid" | "withdraw" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    auctionStartPrice,
    auctionMinIncrement,
    auctionStartTime,
    auctionEndTime,
  } = product;
  const start = Date.parse(auctionStartTime ?? "");
  const end = Date.parse(auctionEndTime ?? "");
  const configured =
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end > start &&
    typeof auctionStartPrice === "number" &&
    Number.isFinite(auctionStartPrice) &&
    auctionStartPrice > 0 &&
    typeof auctionMinIncrement === "number" &&
    Number.isFinite(auctionMinIncrement) &&
    auctionMinIncrement > 0;

  useEffect(() => {
    const initialBids = createPreviewBids(product);
    setBids(initialBids);
    setAmount(
      String(
        getMinimumAuctionBid(
          product.auctionStartPrice ?? 0,
          product.auctionMinIncrement ?? 0,
          initialBids,
        ),
      ),
    );
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [product]);

  if (!configured)
    return (
      <p className="text-muted-foreground">競標資料尚未完整，暫時無法出價。</p>
    );
  if (now === null)
    return <p className="text-muted-foreground">競標資料載入中…</p>;

  const status = getAuctionStatus(
    auctionStartTime,
    auctionEndTime,
    new Date(now),
  );
  const ranking = getAuctionRanking(bids);
  const leader = ranking[0];
  const ownBid = ranking.find((bid) => bid.bidderId === PREVIEW_BIDDER_ID);
  const minimumBid = getMinimumAuctionBid(
    auctionStartPrice!,
    auctionMinIncrement!,
    bids,
  );
  const payment = getAuctionPayment(bids, auctionEndTime!, now);
  const isWinner = payment?.winner.bidderId === PREVIEW_BIDDER_ID;
  const ownRank = ranking.findIndex(
    (bid) => bid.bidderId === PREVIEW_BIDDER_ID,
  );
  const hasWithdrawn = bids.some(
    (bid) => bid.bidderId === PREVIEW_BIDDER_ID && bid.withdrawn,
  );
  const bidAmount = Number(amount);
  const validAmount =
    amount.trim() !== "" &&
    Number.isFinite(bidAmount) &&
    Number.isSafeInteger(Math.round(bidAmount * 100)) &&
    Math.abs(bidAmount * 100 - Math.round(bidAmount * 100)) < 0.000001 &&
    bidAmount >= minimumBid;
  const leading = leader?.bidderId === PREVIEW_BIDDER_ID;
  const ownStatus =
    status === "ended"
      ? isWinner
        ? "你已得標，請於期限內付款"
        : ownRank >= 0 && payment && ownRank + 1 > payment.rank
          ? `候補中・第 ${ownRank + 1} 順位`
          : ownRank >= 0
            ? "付款期限已過，得標資格已失效"
            : "本次未得標"
      : ownBid
        ? leading
          ? "你目前領先"
          : "你的出價已被超越"
        : hasWithdrawn
          ? "你已撤回全部出價，可重新參與"
          : "你尚未出價";

  function confirmAction() {
    // 確認視窗開啟期間也可能結標，送出時再次核對時間。
    if (
      getAuctionStatus(auctionStartTime, auctionEndTime, new Date()) !== "live"
    ) {
      setNow(Date.now());
      setDialog(null);
      setError("競標已結束，無法出價或撤回。");
      return;
    }
    if (dialog === "withdraw") {
      const updated = bids.map((bid) =>
        bid.bidderId === PREVIEW_BIDDER_ID ? { ...bid, withdrawn: true } : bid,
      );
      setBids(updated);
      setAmount(
        String(
          getMinimumAuctionBid(
            auctionStartPrice!,
            auctionMinIncrement!,
            updated,
          ),
        ),
      );
      setMessage("已撤回你在這項商品的全部出價（包含先前出價）。");
    } else {
      if (!validAmount || leading) {
        setError("請確認最新最低出價金額。");
        setDialog(null);
        return;
      }
      const updated = [
        ...bids,
        {
          id: crypto.randomUUID(),
          bidderId: PREVIEW_BIDDER_ID,
          bidderLabel: "你",
          amount: bidAmount,
          createdAt: new Date().toISOString(),
          withdrawn: false,
        },
      ];
      setBids(updated);
      setAmount(
        String(
          getMinimumAuctionBid(
            auctionStartPrice!,
            auctionMinIncrement!,
            updated,
          ),
        ),
      );
      setMessage(`已記錄示範出價 ${money(bidAmount)}，你目前領先。`);
    }
    setError("");
    setDialog(null);
  }

  return (
    <section className="space-y-5" aria-label="競標資訊與操作">
      <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold">
            <Gavel className="h-5 w-5 text-amber-500" />
            競標資訊
          </h2>
          <Badge
            variant="outline"
            className="border-amber-500/30 text-amber-500"
          >
            {AUCTION_STATUS_LABEL[status]}
          </Badge>
        </div>
        <div>
          <p className="mb-1 text-sm text-muted-foreground">
            {leader ? "目前最高有效出價" : "起標價・尚未有人出價"}
          </p>
          <p className="text-3xl font-bold text-amber-500">
            {money(leader?.amount ?? auctionStartPrice!)}
          </p>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">起標價</dt>
            <dd className="mt-1 font-medium">{money(auctionStartPrice!)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">每次加價最低金額</dt>
            <dd className="mt-1 font-medium">{money(auctionMinIncrement!)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">競標開始時間</dt>
            <dd className="mt-1">{dateTime(auctionStartTime!)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">競標結束時間</dt>
            <dd className="mt-1">{dateTime(auctionEndTime!)}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 rounded-lg border border-border/50 bg-card/30 p-4">
        <p className="font-medium">{ownStatus}</p>
        {ownBid && (
          <p className="text-sm text-muted-foreground">
            我的最高有效出價：{money(ownBid.amount)}
          </p>
        )}
        {status === "ended" && !payment && (
          <p className="text-sm text-muted-foreground">
            {ranking.length
              ? "所有候補付款期限均已結束，本次未成交。"
              : "無有效出價，本次未成交。"}
          </p>
        )}
        {isWinner && payment && (
          <>
            <p className="text-sm">得標金額：{money(payment.winner.amount)}</p>
            <p className="text-sm text-amber-500">
              付款截止：{dateTime(payment.deadline)}
            </p>
            <p className="text-sm text-muted-foreground">
              剩餘 {remaining(payment.deadline, now)}
            </p>
            <Button
              asChild
              className="mt-2 w-full bg-gradient-to-r from-primary to-secondary"
            >
              <Link
                href={{ pathname: "/cart", query: { auction: product.id } }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                前往購物車結帳
              </Link>
            </Button>
          </>
        )}
      </div>

      {status === "live" && (
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            if (validAmount && !leading) setDialog("bid");
          }}
        >
          <Label htmlFor="auction-bid-amount">你的出價（NT$）</Label>
          <Input
            id="auction-bid-amount"
            type="number"
            min={minimumBid}
            step="0.01"
            required
            className="bg-white/5"
            value={amount}
            disabled={leading}
            aria-describedby="auction-minimum"
            aria-invalid={!leading && !validAmount}
            onChange={(event) => {
              setAmount(event.target.value);
              setError("");
            }}
          />
          <p id="auction-minimum" className="text-sm text-muted-foreground">
            最低可出價 {money(minimumBid)}；不限制為加價金額的倍數。
          </p>
          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-secondary"
            disabled={leading || !validAmount}
          >
            <Gavel className="mr-2 h-4 w-4" />
            {leading ? "你目前領先" : "確認出價"}
          </Button>
          {ownBid && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setDialog("withdraw")}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              撤回我的全部出價
            </Button>
          )}
        </form>
      )}
      {status === "upcoming" && (
        <Button size="lg" className="w-full" disabled>
          尚未開始競標
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <p role="status" className="text-sm text-muted-foreground">
        {message}
      </p>

      <details className="rounded-lg border border-border/50 p-4" open>
        <summary className="cursor-pointer font-medium">
          出價紀錄（{bids.filter((bid) => !bid.withdrawn).length} 筆有效）
        </summary>
        <ul
          className="mt-3 max-h-56 space-y-3 overflow-y-auto text-sm"
          aria-label="出價紀錄"
        >
          {bids.length === 0 && (
            <li className="text-muted-foreground">尚未有人出價</li>
          )}
          {[...bids].reverse().map((bid) => (
            <li
              key={bid.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border/30 pb-2"
            >
              <div>
                <span>{bid.bidderLabel}</span>
                <p className="text-xs text-muted-foreground">
                  {dateTime(bid.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={
                    bid.withdrawn
                      ? "text-muted-foreground line-through"
                      : "font-medium"
                  }
                >
                  {money(bid.amount)}
                </span>
                {bid.withdrawn && (
                  <p className="text-xs text-muted-foreground">已撤回</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </details>
      <div className="space-y-2 text-sm text-muted-foreground">
        <h3 className="font-medium text-foreground">競標須知</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>僅限結標前撤回，會一併撤回你在此商品的所有出價。</li>
          <li>得標後須於 24 小時內付款，運費於購物車確認。</li>
          <li>
            逾期依不同競標者的最高有效出價依序遞補，每人各有 24
            小時付款，依自己的最高出價成交。
          </li>
        </ul>
        <p className="rounded-lg bg-muted/30 p-3 text-xs">
          目前為畫面預覽，以示範會員操作；出價不會送出，重新整理會還原。
        </p>
      </div>

      <AlertDialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialog === "withdraw" ? "撤回全部出價？" : "確認本次出價"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialog === "withdraw"
                ? "包含先前出價都會一起撤回，不再參與得標及候補排序。結標前仍可重新出價。"
                : `${product.name}：${money(bidAmount)}。得標後須於 24 小時內付款，運費於購物車確認。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>返回</AlertDialogCancel>
            <Button
              onClick={confirmAction}
              disabled={status !== "live" || (dialog === "bid" && !validAmount)}
            >
              {dialog === "withdraw" ? "確認撤回全部出價" : "確認送出"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
