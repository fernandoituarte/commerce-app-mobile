import { PaginationParams } from "@/shared/types/api";

export interface Products {
  items: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  availability: string;
  isActive: boolean;
  deletedAt: Date | null; // ← agregar
  reservedStock?: number;
  lowStockThreshold?: number;
  trackStock?: boolean;
  ui?: ProductUI | null;
  image: Image;
  category: Category | null;
  tags: Category[];
  ingredients: Ingredient[];
  extras: Extra[];
}

export interface ProductUI {
  backgroundColor?: string;
  textColor?: string;
  badge?: string;
  highlight?: boolean;
  sortOrder?: number;
}

export interface Image {
  url: string | null;
  key: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
}

export interface ProductsFilters extends PaginationParams {
  ingredient?: string;
  tag?: string;
  category?: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  stock: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
  description?: string;
  imageUrl?: string;
  imageKey?: string;
  category?: string;
  tags: string[];
  extras: string[];
  ingredients: { ingredientId: string; quantity: number }[];
  ui: {
    backgroundColor: string;
    textColor: string;
    badge: string;
    highlight: boolean;
    sortOrder: number;
  };
  reservedStock?: number;
  lowStockThreshold?: number;
  trackStock?: boolean;
}
