"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";
import { ProductCard } from "@/components/product-card";
import { PresaleProductCard } from "@/components/presale-product-card";
import { AuctionProductCard } from "@/components/auction-product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  SlidersHorizontal,
  Filter,
  Tent,
  Sofa,
  ChefHat,
  Bed,
  Car,
  Sparkles,
  Grid3X3,
  LayoutList,
} from "lucide-react";

import { catalog, catalogError, type CatalogProduct } from "@/lib/commerce/catalog-api";
import { getAuctionPrices } from "@/lib/products/status";

// 商品類型：未來會作為參數帶入搜尋 API（selectedProductType）
const productTypes = [
  { id: "all", name: "全部類型" },
  { id: "general", name: "一般商品" },
  { id: "auction", name: "競標商品" },
  { id: "presale", name: "預售商品" },
];

//過渡時期使用
function getFirstImage(image: string): string {
  if (!image) return "";

  try {
    const parsed = JSON.parse(image);

    if (Array.isArray(parsed)) {
      return parsed[0] ?? "";
    }

    return image;
  } catch {
    return image;
  }
}

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductType, setSelectedProductType] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [webProducts, setWebProducts] = useState<CatalogProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setWebProducts([]);
    void catalog(controller.signal).then(data => { if (!controller.signal.aborted) setWebProducts(data); })
      .catch(e => { if (!controller.signal.aborted) setError(catalogError(e)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reload]);
  const products = webProducts.filter(p => p.productType === "general");
  const categoryNameMap = Object.fromEntries(products.map(p => [p.categoryId, p.category]));
  const categories = [{ id: "all", name: "全部商品", icon: Grid3X3, count: products.length }, ...Object.entries(categoryNameMap).map(([id, name]) => ({ id, name, icon: Grid3X3, count: products.filter(p => p.categoryId === id).length }))];

  const filteredProducts = products.filter(
    (product) => {
      const categoryName = categoryNameMap[product.categoryId] ?? "";
      const matchesCategory =
        selectedCategory === "all" || product.categoryId === selectedCategory;
      const matchesProductType =
        selectedProductType === "all" ||
        product.productType === selectedProductType;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categoryName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesProductType && matchesSearch;
    },
  );


  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-primary/20 text-primary">
              <Sparkles className="mr-1 h-3 w-3" />
              複合式生活美學
            </Badge>
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              讓藝術融入
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                每個生活角落
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              探索由創作者設計的獨特生活用品，從戶外探險到居家空間，讓創意點亮你的日常
            </p>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pb-20">
        {/* Filters and Search */}
        <div className="mb-8 md:sticky md:top-20 z-20 -mx-4 px-4 py-4 bg-[oklch(0.13_0.05_275)]/80 backdrop-blur-md flex flex-col gap-4 md:items-center md:justify-start w-full">
          <div className="flex w-full justify-between gap-8">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋商品..."
                className="bg-card/50 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-card/50">
                    <SelectValue placeholder="排序方式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">最新上架</SelectItem>
                    <SelectItem value="price-low">價格低到高</SelectItem>
                    <SelectItem value="price-high">價格高到低</SelectItem>
                    <SelectItem value="popular">熱門商品</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;
                return (
                  <Button
                    key={category.id}
                    variant={isActive ? "default" : "outline"}
                    className={`gap-2 ${
                      isActive
                        ? "bg-gradient-to-r from-primary to-secondary"
                        : "bg-card/50 hover:bg-card"
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                    <Badge
                      variant="secondary"
                      className={`ml-1 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {category.count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            顯示{" "}
            <span className="font-medium text-foreground">
              {sortedProducts.length}
            </span>{" "}
            件商品
            {selectedCategory !== "all" && (
              <>
                {" "}
                在{" "}
                <span className="font-medium text-primary">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              </>
            )}
          </p>
        </div>
        {/* 商品類型側欄 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-44 rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  商品類型
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {productTypes.map((type) => {
                  const isActive = selectedProductType === type.id;
                  return (
                    <Button
                      key={type.id}
                      variant={isActive ? "default" : "outline"}
                      className={`w-full justify-start ${
                        isActive
                          ? "bg-gradient-to-r from-primary to-secondary"
                          : "bg-card/50 hover:bg-card"
                      }`}
                      onClick={() => setSelectedProductType(type.id)}
                      disabled={type.id !== "general"}
                      title={type.id !== "general" ? "尚未開放" : undefined}
                    >
                      {type.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          </aside>
          {/* Products */}
          <div className="min-w-0 lg:col-span-3">
            {loading && <p role="status">載入資料庫商品中…</p>}
            {error && <div role="alert" className="mb-4"><p>{error}</p><Button variant="outline" onClick={() => setReload(n => n + 1)}>重新載入</Button></div>}
            {sortedProducts.length > 0 ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {sortedProducts.map((product) => {
                  const categoryName =
                    categoryNameMap[product.categoryId] ?? "";
                  if (product.productType === "presale") {
                    return (
                      <PresaleProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        category={categoryName}
                        currentBackers={product.currentBackers ?? 0}
                        targetBackers={product.targetBackers ?? 0}
                        
                        presaleStartTime={product.presaleStartTime}
                        presaleEndTime={product.presaleEndTime}
                      />
                    );
                  }
                  if (product.productType === "auction") {
                    const prices = getAuctionPrices(product);
                    return (
                      <AuctionProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        image={product.image}
                        category={categoryName}
                        creatorName={product.creatorName ?? ""}
                        auctionStartPrice={prices.auctionStartPrice}
                        currentBid={prices.currentBid}
                        auctionMinIncrement={prices.auctionMinIncrement}
                        auctionStartTime={product.auctionStartTime}
                        auctionEndTime={product.auctionEndTime}
                        
                      />
                    );
                  }
                  return (
                    <ProductCard
                      source="api"
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      image={getFirstImage(product.image ?? "")}
                      category={categoryName}
                      stock={product.stock}
                      creatorId={product.creatorId ?? ""}
                    />
                  );
                })}
              </div>
            ) : !loading && !error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  找不到符合的商品
                </h3>
                <p className="text-muted-foreground">
                  嘗試調整搜尋條件或瀏覽其他分類
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
