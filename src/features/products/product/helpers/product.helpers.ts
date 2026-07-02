import type { Product, ProductPayload } from "../types";

export type IngredientLine = {
  ingredientId: string;
  name: string;
  quantity: string;
};

export const DEFAULT_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  availability: "AVAILABLE" as "AVAILABLE" | "UNAVAILABLE",
  imageUrl: "",
  imageKey: "",
  categoryId: "",
  tagIds: [] as string[],
  extraIds: [] as string[],
  ingredientLines: [] as IngredientLine[],
  backgroundColor: "#2563eb",
  textColor: "#ffffff",
  badge: "",
  highlight: false,
  sortOrder: "",
  trackStock: true,
  reservedStock: "",
  lowStockThreshold: "",
};

export type ProductFormValues = typeof DEFAULT_FORM;

export const BG_COLORS = [
  "#2563eb", "#16a34a", "#d97706", "#dc2626",
  "#7c3aed", "#0891b2", "#db2777", "#92400e",
];

export const TEXT_COLORS = [
  "#ffffff", "#0f172a", "#2563eb", "#16a34a", "#dc2626", "#7c3aed",
];

export const PRODUCT_LIMIT = 20;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function formatPrice(price: number): string {
  if (!price) return "$0.00";
  return `+$${price.toFixed(2)}`;
}

export function mapProductToForm(p: Product): ProductFormValues {
  return {
    name: p.name,
    description: p.description ?? "",
    price: String(p.price),
    stock: String(p.stock ?? ""),
    availability: (p.availability as "AVAILABLE" | "UNAVAILABLE") ?? "AVAILABLE",
    imageUrl: p.image?.url ?? "",
    imageKey: p.image?.key ?? "",
    categoryId: p.category?.id ?? "",
    tagIds: p.tags?.map((t) => t.id) ?? [],
    extraIds: p.extras?.map((e) => e.id) ?? [],
    ingredientLines:
      p.ingredients?.map((i) => ({
        ingredientId: i.id,
        name: i.name,
        quantity: String(i.quantity),
      })) ?? [],
    backgroundColor: p.ui?.backgroundColor || BG_COLORS[0],
    textColor: p.ui?.textColor || TEXT_COLORS[0],
    badge: p.ui?.badge ?? "",
    highlight: p.ui?.highlight ?? false,
    sortOrder: String(p.ui?.sortOrder ?? ""),
    trackStock: p.trackStock ?? true,
    reservedStock: p.reservedStock !== undefined ? String(p.reservedStock) : "",
    lowStockThreshold: p.lowStockThreshold !== undefined ? String(p.lowStockThreshold) : "",
  };
}

export function buildProductPayload(form: ProductFormValues): ProductPayload {
  return {
    name: form.name,
    description: form.description || undefined,
    price: parseFloat(form.price) || 0,
    stock: parseInt(form.stock, 10) || 0,
    availability: form.availability,
    ...(form.imageKey ? { imageUrl: form.imageUrl, imageKey: form.imageKey } : {}),
    category: form.categoryId || undefined,
    tags: form.tagIds,
    extras: form.extraIds,
    ingredients: form.ingredientLines.map((l) => ({
      ingredientId: l.ingredientId,
      quantity: parseInt(l.quantity, 10) || 1,
    })),
    ui: {
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      badge: form.badge,
      highlight: form.highlight,
      sortOrder: parseInt(form.sortOrder, 10) || 0,
    },
    trackStock: form.trackStock,
    ...(form.trackStock && form.reservedStock !== ""
      ? { reservedStock: parseInt(form.reservedStock, 10) }
      : {}),
    ...(form.trackStock && form.lowStockThreshold !== ""
      ? { lowStockThreshold: parseInt(form.lowStockThreshold, 10) }
      : {}),
  };
}
