"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Search, Package, Sparkles, Check, AlertCircle, Info } from "lucide-react";
import type { NewProductForm } from "./useNewProductForm";

export function Step1SelectProduct({ form }: { form: NewProductForm }) {
  const {
    productSearch,
    setProductSearch,
    normalizedProductSearch,
    filteredProducts,
    getMockupComponent,
    selectedProduct,
    setSelectedProduct,
    setShowCustomInput,
    setCustomProductRequest,
    showCustomInput,
    customProductRequest,
    canProceedToStep2,
    setCurrentStep,
  } = form;

  return (
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
          找不到符合「{productSearch}
          」的商品，你可以透過右下方「其他產品」告訴我們你的需求。
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
              <p className="mb-2 text-sm text-muted-foreground">產品規格:</p>
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
              <p className="mb-2 text-sm text-muted-foreground">可印刷區域:</p>
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
  );
}
