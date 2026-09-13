import {
  platformProducts,
  type ProductDefinition,
} from "./platform-products";

const STORAGE_KEY = "artniverse.productTemplates";

const cloneTemplates = (templates: ProductDefinition[]) =>
  templates.map((template) => ({
    ...template,
    printZones: template.printZones.map((zone) => ({
      ...zone,
      position: { ...zone.position },
    })),
    specs: [...template.specs],
    optionGroups: template.optionGroups?.map((group) => ({
      ...group,
      options: group.options.map((option) => ({ ...option })),
    })),
    stockDiscountTiers: template.stockDiscountTiers?.map((tier) => ({ ...tier })),
    templateFile: template.templateFile ? { ...template.templateFile } : undefined,
  }));

export const getProductTemplates = (): ProductDefinition[] => {
  if (typeof window === "undefined") return cloneTemplates(platformProducts);

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneTemplates(platformProducts);
    const templates = JSON.parse(stored) as ProductDefinition[];
    return Array.isArray(templates) ? cloneTemplates(templates) : cloneTemplates(platformProducts);
  } catch {
    return cloneTemplates(platformProducts);
  }
};

export const saveProductTemplates = (templates: ProductDefinition[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};
