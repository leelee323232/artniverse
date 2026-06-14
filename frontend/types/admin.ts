// 後台共用型別定義

export interface AdminBaseEntity {
  id: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

// 產品類別
export interface ProductCategory extends AdminBaseEntity {
  name: string;
}

// 創作者類別
export interface CreatorCategory extends AdminBaseEntity {
  name: string;
}

// 產品
export interface Product extends AdminBaseEntity {
  name: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  stock: number;
}

// 創作者
export interface Creator extends AdminBaseEntity {
  name: string;
  avatarUrl: string;
  categoryId: string;
  specialty: string;
}

// 活動區塊
export interface Activity extends AdminBaseEntity {
  title: string;
  linkUrl: string;
  imageUrl: string;
}

// 熱門創作者
export interface FeaturedCreator extends AdminBaseEntity {
  creatorId: string;
}

// 熱門商品
export interface FeaturedProduct extends AdminBaseEntity {
  productId: string;
}
