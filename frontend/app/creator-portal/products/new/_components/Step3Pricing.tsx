"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  Loader2,
  AlertCircle,
  Info,
  Send,
  Calculator,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Layers,
  Gavel,
  Target,
  CalendarClock,
  FileText,
} from "lucide-react";
import { getEffectiveScalePercent } from "./lib/print-size";
import { WatermarkOverlay } from "./WatermarkOverlay";
import type { NewProductForm } from "./useNewProductForm";

export function Step3Pricing({ form }: { form: NewProductForm }) {
  const {
    productType,
    setProductType,
    productName,
    setProductName,
    productDescription,
    setProductDescription,
    auctionStartPrice,
    setAuctionStartPrice,
    auctionMinIncrement,
    setAuctionMinIncrement,
    auctionStartTime,
    setAuctionStartTime,
    auctionEndTime,
    setAuctionEndTime,
    presaleStartDate,
    setPresaleStartDate,
    presaleEndDate,
    setPresaleEndDate,
    presaleTargetQuantity,
    setPresaleTargetQuantity,
    costs,
    sellingPrice,
    setSellingPrice,
    selectedProduct,
    preOrderQuantity,
    setPreOrderQuantity,
    wantPreOrder,
    setWantPreOrder,
    productNote,
    setProductNote,
    designImages,
    getMockupComponent,
    customProductRequest,
    canSubmit,
    submitBlockers,
    isSubmitting,
    handleSubmit,
    setCurrentStep,
  } = form;

  return (
    <Card className="border-border/50 bg-card/30 p-6 backdrop-blur-sm">
      <h2 className="mb-6 text-xl font-bold text-foreground">
        步驟 3: 設定價格與數量
      </h2>

      {/* Product Type & Basic Info */}
      <div className="mb-6 space-y-4">
        {/* Type selector + name + description */}
        <div className="space-y-4 rounded-lg border border-border/50 bg-white/5 p-4">
          <div>
            <Label className="mb-2 flex items-center gap-2 font-bold text-foreground">
              <Layers className="h-5 w-5 text-primary" />
              商品類型
            </Label>
            <Select
              value={productType}
              onValueChange={(v) =>
                setProductType(v as "general" | "auction" | "presale")
              }
            >
              <SelectTrigger className="bg-white/5">
                <SelectValue placeholder="選擇商品類型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">一般商品</SelectItem>
                <SelectItem value="auction">競標商品</SelectItem>
                <SelectItem value="presale">預售商品</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-2 text-xs text-muted-foreground">
              {productType === "auction"
                ? "競標商品：設定時間內價高者得，適合畫作、陶藝等原創作品。"
                : productType === "presale"
                  ? "預售商品：於期間內達到設定數量才會發貨，未達標則退費。"
                  : "一般商品：以固定售價販售。"}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              產品名稱
            </Label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="輸入產品名稱"
              className="bg-white/5"
            />
          </div>

          <div className="space-y-2">
            <Label>商品說明</Label>
            <Textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="輸入商品說明，例如作品理念、材質、尺寸等"
              className="min-h-24 bg-white/5"
            />
          </div>
        </div>

        {/* Auction settings */}
        {productType === "auction" && (
          <div className="space-y-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-foreground">競標設定</h3>
            </div>

            <div className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-500">
              <AlertCircle className="mr-1 inline h-4 w-4" />
              競標商品需與您已申請通過的 IP
              一致（例如：畫作、陶藝等原創作品）。
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>起標價 (NT$)</Label>
                <Input
                  type="number"
                  value={auctionStartPrice}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || Number(v) >= 0) setAuctionStartPrice(v);
                  }}
                  placeholder="輸入起標價"
                  className="bg-white/5"
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>每次加價最低金額 (NT$)</Label>
                <Input
                  type="number"
                  value={auctionMinIncrement}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "" || Number(v) >= 0) setAuctionMinIncrement(v);
                  }}
                  placeholder="例如：100"
                  className="bg-white/5"
                  min={0}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  競標開始時間
                </Label>
                <Input
                  type="datetime-local"
                  value={auctionStartTime}
                  onChange={(e) => setAuctionStartTime(e.target.value)}
                  className="bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  競標結束時間
                </Label>
                <Input
                  type="datetime-local"
                  value={auctionEndTime}
                  onChange={(e) => setAuctionEndTime(e.target.value)}
                  className="bg-white/5"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              設定時間內，出價最高者得標。
            </p>
          </div>
        )}

        {/* Pre-sale settings */}
        {productType === "presale" && (
          <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">預售設定</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>預售開始日期</Label>
                <Input
                  type="date"
                  value={presaleStartDate}
                  onChange={(e) => setPresaleStartDate(e.target.value)}
                  className="bg-white/5"
                />
              </div>
              <div className="space-y-2">
                <Label>預售結束日期</Label>
                <Input
                  type="date"
                  value={presaleEndDate}
                  onChange={(e) => setPresaleEndDate(e.target.value)}
                  className="bg-white/5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>達標數量</Label>
              <Input
                type="number"
                value={presaleTargetQuantity}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || Number(v) >= 0) setPresaleTargetQuantity(v);
                }}
                placeholder="達到此數量才會發貨"
                className="bg-white/5"
                min={1}
              />
            </div>

            <div className="rounded-lg bg-primary/10 p-3 text-sm text-muted-foreground">
              <Info className="mr-1 inline h-4 w-4 text-primary" />
              於預售期間內達到設定數量才會發貨；若未達標將全額退費給消費者，退費訂單不計入創作者收益。
            </div>
          </div>
        )}
      </div>

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
                  <span className="text-muted-foreground">1. 產品基本成本</span>
                  <span className="text-foreground">NT$ {costs.baseCost}</span>
                </div>

                {/* 2. Printing Cost */}
                <div className="flex items-center justify-between border-b border-border/30 pb-2">
                  <div>
                    <span className="text-muted-foreground">2. 印刷費用</span>
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
                  <span className="text-muted-foreground">生產成本 (1+2)</span>
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
              min={0}
              value={sellingPrice}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || Number(v) >= 0) setSellingPrice(v);
              }}
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
                      <span className="text-muted-foreground">您的售價</span>
                      <span className="text-foreground">
                        NT$ {parseFloat(sellingPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">備貨成本</span>
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
                      <span className="text-muted-foreground">計算方式</span>
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
                  <Label>預製數量 (最少 {selectedProduct.minOrder} 件)</Label>
                  <Input
                    type="number"
                    value={preOrderQuantity}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "" || Number(v) >= 0) setPreOrderQuantity(v);
                    }}
                    placeholder={`最少 ${selectedProduct.minOrder} 件`}
                    className="bg-white/5"
                    min={selectedProduct.minOrder}
                  />
                </div>
                {preOrderQuantity &&
                  parseInt(preOrderQuantity) >= selectedProduct.minOrder &&
                  costs && (
                    <div className="rounded-lg bg-primary/10 p-3">
                      <p className="text-sm text-muted-foreground">預製費用:</p>
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
                  <Label htmlFor="want-preorder" className="cursor-pointer">
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
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "" || Number(v) >= 0)
                            setPreOrderQuantity(v);
                        }}
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
                              costs.stockingCost * parseInt(preOrderQuantity)
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

          {/* Product Note for Admin */}
          <div className="rounded-lg border border-border/50 bg-white/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">商品備註</h3>
            </div>
            <Textarea
              value={productNote}
              onChange={(e) => setProductNote(e.target.value)}
              placeholder="給管理員的補充說明（例如特殊需求、注意事項等），此內容僅管理員可見"
              className="min-h-24 bg-white/5"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              此備註為創作者提供給管理員審核的說明，不會顯示在商品頁面。
            </p>
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
                    <div key={zone.id} className="rounded-lg bg-muted/20 p-3">
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
                                transform: `translate(-50%, -50%) scale(${(getEffectiveScalePercent(img, zone) / 100) * 0.6}) rotate(${img.rotation}deg)`,
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
                <span className="text-muted-foreground">商品名稱</span>
                <span className="text-foreground">{productName || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">銷售類型</span>
                <span className="text-foreground">
                  {productType === "auction"
                    ? "競標商品"
                    : productType === "presale"
                      ? "預售商品"
                      : "一般商品"}
                </span>
              </div>
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
                    <span className="text-muted-foreground">預製數量</span>
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

      {!canSubmit && submitBlockers.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-500">
            <AlertCircle className="h-4 w-4" />
            送出前還需完成以下項目
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {submitBlockers.map((blocker) => (
              <li key={blocker} className="flex items-start gap-2">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                {blocker}
              </li>
            ))}
          </ul>
        </div>
      )}

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
  );
}
