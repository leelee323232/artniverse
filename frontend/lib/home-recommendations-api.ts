import { api } from "@/lib/api";

export type RecommendedCreator = {
  id: string;
  name: string;
  creator: string;
  tags: string[];
  followers: number;
  productCount: number;
  image: string | null;
  color: string;
};

export type RecommendedProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string | null;
  creatorId: string;
  creator: string;
  isNew: boolean;
  isSale: boolean;
  isPopular: boolean;
};

export type HomeRecommendations = {
  data: { products: RecommendedProduct[]; creators: RecommendedCreator[] };
  meta: { productSource: "popular" | "all"; creatorSource: "all" };
};

export async function fetchHomeRecommendations(signal: AbortSignal) {
  const { data } = await api.get<HomeRecommendations>("/api/v1/home/recommendations", {
    params: { product_limit: 3, creator_limit: 4 },
    signal,
    timeout: 15000,
  });
  return data;
}
