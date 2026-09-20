import {
  platformProducts,
  type ProductTemplate,
} from "@/app/creator-portal/products/new/_components/data/platform-products";

// 假資料直接由創作者端第一步的模板建立，確保欄位名稱與值域完全相同。
export const mockProductTemplates: ProductTemplate[] = platformProducts.map(
  (template, index) => ({
    ...template,
    printZones: template.printZones.map((zone) => ({ ...zone })),
    specs: [...template.specs],
    templateFile: template.templateFile
      ? { ...template.templateFile }
      : undefined,
    isActive: true,
    sortOrder: index + 1,
    createdAt: "2026-09-06",
  }),
);
