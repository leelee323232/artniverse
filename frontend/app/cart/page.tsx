"use client";

import { useState } from "react";
import { ApiCart } from "./api-cart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockProducts } from "@/mocks/admin/products";
import { useCart } from "@/lib/commerce/cart-context";
import {
  cartGroupId,
  cartLineIssue,
  shippingFor,
  TYPE_LABEL,
} from "@/lib/commerce/cart";
import { Navigation } from "@/components/navigation";
import { UniverseBackground } from "@/components/universe-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const money = (value: number) => `NT$ ${value.toLocaleString("zh-TW")}`;
const dateTime = (value: number | string) =>
  new Date(value).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour12: false,
  });

export default function CartPage() {
  const { items, ready, now, storageWarning, setQuantity, removeItem } =
    useCart();
  const [message, setMessage] = useState("");
  const router = useRouter();
  const rows = items.map((line) => {
    const product = mockProducts.find((p) => p.id === line.productId);
    return {
      line,
      product,
      issue: cartLineIssue(line, product, now),
      price:
        product?.productType === "auction"
          ? (line.award?.amount ?? 0)
          : (product?.price ?? 0),
    };
  });
  const groups = Array.from(
    new Set(
      rows.map((row) =>
        row.product
          ? cartGroupId(row.product)
          : `missing:${row.line.productId}`,
      ),
    ),
  ).map((id) => {
    const entries = rows.filter(
      (row) =>
        (row.product
          ? cartGroupId(row.product)
          : `missing:${row.line.productId}`) === id,
    );
    const product = entries[0].product;
    const subtotal =
      Math.round(
        entries.reduce((sum, row) => sum + row.price * row.line.quantity, 0) *
          100,
      ) / 100;
    const shipping = shippingFor(subtotal);
    return {
      id,
      entries,
      product,
      subtotal,
      shipping,
      total: subtotal + shipping,
      invalid: entries.some((row) => !!row.issue),
    };
  });

  function checkoutGroup(id: string) {
    const group = groups.find((g) => g.id === id);
    if (
      !group ||
      group.entries.some((row) =>
        cartLineIssue(row.line, row.product, Date.now()),
      )
    ) {
      setMessage("商品狀態已變更，請確認提示並調整購物車。");
      return;
    }
    router.push(
      `/checkout?group=${encodeURIComponent(id)}&draft=${crypto.randomUUID()}`,
    );
  }

  return (
    <div className="relative min-h-screen">
      <UniverseBackground />
      <Navigation />
      <main className="container mx-auto max-w-5xl px-4 pt-24 pb-20">
        <h1 className="mb-2 text-3xl font-bold">購物車</h1>
        <ApiCart />
        <h2 className="mb-2 text-lg font-bold">示範商品</h2>
        <p className="mb-6 text-muted-foreground">
          一次結帳一個創作者賣場，同類商品合併結帳；一般、預售分開結帳，競標每件獨立結帳。
        </p>
      {storageWarning && (
          <p role="alert" className="mb-4 text-amber-500">
            {storageWarning}
          </p>
        )}
        <p role="status" className="mb-4 text-sm">
          {message}
        </p>
        {!ready ? (
          <p role="status">購物車載入中…</p>
        ) : items.length === 0 ? (
          <Card className="border-border/50 bg-card/30 p-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-bold">尚未加入示範商品</h2>
            <p className="mb-6 text-muted-foreground">
              先挑選喜歡的商品，加入後會保留在這裡。
            </p>
            <Button asChild>
              <Link href="/shop">繼續逛商店</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-28">
                <Card className="border-border/50 bg-card/40 p-4 sm:p-6">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-bold">
                      {group.product?.creatorName ??
                        (group.product?.creatorId
                          ? `創作者賣場 ${group.product.creatorId}`
                          : "商品資料待確認")}
                    </h2>
                    {group.product && (
                      <Badge variant="outline">
                        {TYPE_LABEL[group.product.productType]}
                      </Badge>
                    )}
                  </div>
                  {group.product?.productType === "presale" && (
                    <p className="mb-4 text-sm text-violet-400">
                      達標或截止即停止購買。下單後 24
                      小時內付款，加入購物車不開始倒數。
                    </p>
                  )}
                  {group.product?.productType === "auction" && (
                    <p className="mb-4 text-sm text-amber-500">
                      得標數量固定為 1
                      件／組。移除商品不會取消得標或延長付款期限。
                    </p>
                  )}
                  <div className="divide-y divide-border/50">
                    {group.entries.map(({ line, product, issue, price }) => (
                      <div key={line.productId} className="flex gap-4 py-5">
                        <img
                          src={product?.image || "/placeholder.svg"}
                          alt={product?.name ?? "商品"}
                          className="h-20 w-20 shrink-0 rounded-lg object-cover sm:h-24 sm:w-24"
                        />
                        <div className="min-w-0 flex-1 space-y-2">
                          <Link
                            href={`/product?id=${encodeURIComponent(line.productId)}`}
                            className="block break-words font-bold hover:underline"
                          >
                            {product?.name ?? "找不到這項商品"}
                          </Link>
                          <p className="font-semibold text-primary">
                            {money(price)}
                          </p>
                          {line.award && (
                            <p className="text-sm text-amber-500">
                              付款截止：{dateTime(line.award.deadline)}
                              （台灣時間）・第 {line.award.rank} 順位得標
                            </p>
                          )}
                          {product?.productType === "presale" &&
                            product.presaleEndTime && (
                              <p className="text-xs text-muted-foreground">
                                預售截止：{dateTime(product.presaleEndTime)}
                                （台灣時間）
                              </p>
                            )}
                          {issue && (
                            <p
                              role="alert"
                              className="text-sm text-destructive"
                            >
                              {issue}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            {product?.productType === "auction" ? (
                              <span className="text-sm">
                                得標數量：1 件／組
                              </span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label={`減少${product?.name ?? "商品"}數量`}
                                  disabled={line.quantity <= 1}
                                  onClick={() =>
                                    setMessage(
                                      setQuantity(
                                        line.productId,
                                        Math.min(
                                          line.quantity - 1,
                                          product?.stock ?? 0,
                                        ),
                                      ).message,
                                    )
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span
                                  className="min-w-8 text-center"
                                  aria-label="商品數量"
                                >
                                  {line.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label={`增加${product?.name ?? "商品"}數量`}
                                  disabled={
                                    !!issue ||
                                    line.quantity >= (product?.stock ?? 0)
                                  }
                                  onClick={() =>
                                    setMessage(
                                      setQuantity(
                                        line.productId,
                                        line.quantity + 1,
                                      ).message,
                                    )
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`移除${product?.name ?? "商品"}`}
                              className="text-destructive"
                              onClick={() => {
                                removeItem(line.productId);
                                setMessage("已移除商品");
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between text-sm">
                      <span>商品小計</span>
                      <span>{money(group.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>預估運費（本組滿 NT$ 1,000 免運）</span>
                      <span>
                        {group.shipping ? money(group.shipping) : "免運費"}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>本組預估總額</span>
                      <span>{money(group.total)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      每次僅結帳此組商品，其他賣場的商品會保留在購物車。
                    </p>
                    {group.invalid && (
                      <p className="text-sm text-destructive">
                        請先移除無法購買的商品，或依提示調整數量。
                      </p>
                    )}
                    <Button
                      className="w-full"
                      disabled={group.invalid}
                      onClick={() => checkoutGroup(group.id)}
                    >
                      前往結帳
                    </Button>
                  </div>
                </Card>
              </section>
            ))}
            <Button asChild variant="outline">
              <Link href="/shop">繼續購物</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
