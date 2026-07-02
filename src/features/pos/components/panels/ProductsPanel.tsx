import React from "react";
import { Alert, View, FlatList, StyleSheet, ActivityIndicator, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { CategoryTabs } from "../sections/CategoryTabs";
import { ProductCard } from "../cards/ProductCard";
import { AddItemModal } from "../modals/AddItemModal";
import { EditProductModal } from "@/features/products/product/components/edit-product-modal";
import { SearchBar } from "@/shared/components/ui";
import { spacing, typography, useTheme } from "@/core/theme";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useGetProducts } from "@/features/products/product/hooks";
import { useGetCategories } from "@/features/products/category/hooks";
import { useGetTags } from "@/features/products/tags/hooks";
import { useAddOrderItem, useOrderDetails } from "@/features/orders/hooks";
import { getOrderActions } from "@/features/orders/utils/getOrderActions";
import type { Product } from "@/features/products/product/types";

interface ProductsPanelProps {
  selectedOrderId: string;
  canWrite: boolean;
  onAddToOrder?: () => void;
}

const NUM_COLS = 3;
// Total horizontal space consumed by cell margins:
//   [GRID_PADDING | CELL_MARGIN] [cell] [CELL_MARGIN | CELL_MARGIN] … [CELL_MARGIN | GRID_PADDING]
//   = 2*GRID_PADDING + NUM_COLS*2*CELL_MARGIN
// GRID_PADDING = spacing.sm (8), CELL_MARGIN = spacing.xs (4)
const CELL_OVERHEAD = 2 * spacing.sm + NUM_COLS * 2 * spacing.xs; // 40

export function ProductsPanel({ selectedOrderId, canWrite, onAddToOrder }: ProductsPanelProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [query, setQuery] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("all");
  const [tagId, setTagId] = React.useState("all");
  const [listWidth, setListWidth] = React.useState(0);
  // PATH B: product waiting for configuration in the add-item modal
  const [configProduct, setConfigProduct] = React.useState<Product | null>(null);
  // Long-press: product being edited via the catalog edit modal
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);

  // cellSize is square: width = height = one column's share of available space.
  // Gives every card — including last-row orphans — identical dimensions.
  const cellSize = listWidth > 0 ? (listWidth - CELL_OVERHEAD) / NUM_COLS : 0;

  const debouncedQuery = useDebounce(query, 350);
  const mutation = useAddOrderItem();

  // Fix 4 — derive canEditItems from the selected order's status.
  // useOrderDetails is disabled when selectedOrderId is empty; React Query
  // deduplicates the fetch with OrderDetailPanel which already holds the same key.
  const { data: selectedOrder } = useOrderDetails(selectedOrderId);
  const { canEditItems } = getOrderActions(selectedOrder);
  // A card is interactive only when the subscription allows writes AND the
  // order itself is in an editable state (active, not cancelled/completed).
  const canAddToOrder = canWrite && canEditItems;

  const { data: categoriesData } = useGetCategories({ limit: 100 });
  const { data: tagsData } = useGetTags({ limit: 100 });

  const {
    data: productsData,
    isLoading,
    isError,
    refetch,
  } = useGetProducts({
    limit: 50,
    offset: 0,
    category: categoryId === "all" ? undefined : categoryId,
    tag: tagId === "all" ? undefined : tagId,
    search: debouncedQuery || undefined,
  });

  const categories = categoriesData?.items ?? [];
  const tags = tagsData?.items ?? [];
  const products = productsData?.items ?? [];

  // ── Long-press handler — opens catalog edit modal ─────────────────
  // canWrite gating: editing is a write; in readonly mode this is a no-op.
  // Not gated by availability — admin may want to edit an unavailable product.
  const handleCardLongPress = (product: Product) => {
    // Long-press opens the catalog edit modal — gated on subscription write only,
    // NOT on canEditItems (admin may edit an unavailable/cancelled-order product).
    if (!canWrite) return;
    setEditProduct(product);
  };

  // ── Tap handler ────────────────────────────────────────────────────
  const handleCardPress = (product: Product) => {
    if (mutation.isPending) return;

    if (!selectedOrderId) {
      Alert.alert(
        t("pos.addItem.noOrder.title"),
        t("pos.addItem.noOrder.message"),
      );
      return;
    }

    const isSimple = product.extras.length === 0 && product.ingredients.length === 0;

    if (isSimple) {
      // PATH A — simple product: add directly, quantity 1.
      mutation.mutate(
        {
          orderId: selectedOrderId,
          item: {
            productId: product.id,
            name: product.name,
            unitPrice: product.price,
            quantity: 1,
          },
        },
        {
          onSuccess: () => onAddToOrder?.(),
          onError: (err) =>
            Alert.alert(t("pos.addItem.error"), err.message),
        },
      );
    } else {
      // PATH B — configurable product: open the configuration modal.
      setConfigProduct(product);
    }
  };

  // ── Modal confirm ──────────────────────────────────────────────────
  const handleModalConfirm = ({
    quantity,
    selectedExtras,
    removedIngredients,
  }: {
    quantity: number;
    selectedExtras: { id: string; name: string; price: number }[];
    removedIngredients: { id: string; name: string }[];
  }) => {
    if (!configProduct || !selectedOrderId) return;

    mutation.mutate(
      {
        orderId: selectedOrderId,
        item: {
          productId: configProduct.id,
          name: configProduct.name,
          unitPrice: configProduct.price,
          quantity,
          extras: selectedExtras.map((e) => ({
            extraId: e.id,    // product extra.id  → extraId
            name: e.name,
            price: e.price,
            quantity: 1,      // toggle behavior — one of each selected extra
          })),
          removedIngredients: removedIngredients.map((i) => ({
            ingredientId: i.id,         // product ingredient.id   → ingredientId
            ingredientName: i.name,     // product ingredient.name → ingredientName
          })),
        },
      },
      {
        onSuccess: () => {
          setConfigProduct(null);
          onAddToOrder?.();
        },
        onError: (err) => Alert.alert(t("pos.addItem.error"), err.message),
      },
    );
  };

  return (
    <View
      style={[styles.root, { backgroundColor: theme.bg }]}
      onLayout={(e) => setListWidth(e.nativeEvent.layout.width)}
    >
      {/* Category tabs (primary) + tag chips (secondary) */}
      <View style={[styles.tabs, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
        <CategoryTabs
          categories={categories}
          selectedId={categoryId}
          onSelect={setCategoryId}
          tags={tags}
          selectedTagId={tagId}
          onSelectTag={setTagId}
          allLabel={t("pos.products.all")}
        />
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { borderBottomColor: theme.border }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t("pos.products.search")}
        />
      </View>

      {/* Content: loading / error / grid */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Ionicons name="cloud-offline-outline" size={32} color={theme.textMuted} />
          <Text style={[typography.bodySm, { color: theme.textMuted, textAlign: "center" }]}>
            {t("pos.products.error")}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={({ pressed }) => [
              styles.retryBtn,
              { borderColor: theme.primary },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[typography.bodySm, { color: theme.primary }]}>
              {t("pos.products.retry")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={NUM_COLS}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="storefront-outline" size={32} color={theme.textMuted} />
              <Text style={[typography.bodySm, { color: theme.textMuted, textAlign: "center" }]}>
                {t("pos.products.empty")}
              </Text>
            </View>
          }
          renderItem={({ item }: { item: Product }) => (
            <View style={[styles.cell, { width: cellSize, height: cellSize }]}>
              <ProductCard
                product={item}
                onPress={canAddToOrder ? () => handleCardPress(item) : undefined}
                onLongPress={canWrite ? () => handleCardLongPress(item) : undefined}
              />
            </View>
          )}
        />
      )}

      {/* PATH B — add-item configuration modal */}
      <AddItemModal
        product={configProduct}
        open={configProduct !== null}
        onClose={() => setConfigProduct(null)}
        onConfirm={handleModalConfirm}
        isPending={mutation.isPending}
      />

      {/* Long-press — catalog product edit modal (reused from org screen) */}
      <EditProductModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { borderBottomWidth: StyleSheet.hairlineWidth },
  searchWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  grid: {
    padding: spacing.sm,
    paddingBottom: spacing.xl + spacing.lg,
  },
  cell: {
    margin: spacing.xs,
  },
  center: {
    flex: 1,
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  retryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
