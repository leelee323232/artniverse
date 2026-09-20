import ProductDetailClient from "./ProductDetailClient";

// 匯出一份共用商品 shell；SiteGround 的 .htaccess 將其他數字 ID 導向此檔。
// 不在建置階段下載商品清單，新增商品不需要重建整個前端。
export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function ProductPage() {
  return <ProductDetailClient />;
}
