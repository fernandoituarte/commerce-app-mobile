import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { OrgShell } from "@/shared/components/OrgShell";
import { FloatingAction } from "@/shared/components/ui";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";
import { useGetProducts } from "@/features/products/product/hooks";
import { ProductsFilters } from "@/features/products/product/components/products-filters";
import { ProductsTable } from "@/features/products/product/components/products-table";
import { CreateProductModal } from "@/features/products/product/components/create-product-modal";
import { EditProductModal } from "@/features/products/product/components/edit-product-modal";
import { DeleteProductDialog } from "@/features/products/product/components/delete-product-dialog";
import type { Product } from "@/features/products/product/types";
import { PRODUCT_LIMIT } from "@/features/products/product/helpers/product.helpers";

export default function ProductsScreen() {
  const { t } = useTranslation();
  const { canWrite } = useSubscriptionAccess();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [withDeleted, setWithDeleted] = useState(false);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [pendingRestore, setPendingRestore] = useState<Product | null>(null);

  useEffect(() => {
    setPage(1);
  }, [query, categoryFilter, withDeleted]);

  const { data, isLoading } = useGetProducts({
    search: query || undefined,
    category: categoryFilter || undefined,
    withDeleted,
    limit: PRODUCT_LIMIT,
    offset: (page - 1) * PRODUCT_LIMIT,
  });

  return (
    <OrgShell title={t("org.products.title")} scrollable={false} padded={false}>
      <ProductsFilters
        query={query}
        onQueryChange={setQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        withDeleted={withDeleted}
        onWithDeletedChange={setWithDeleted}
      />

      <ProductsTable
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onEdit={setEditProduct}
        onDelete={setPendingDelete}
        onRestore={setPendingRestore}
        onCreateFirst={() => setCreateOpen(true)}
        canWrite={canWrite}
      />

      <FloatingAction onPress={() => setCreateOpen(true)} disabled={!canWrite} />

      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <EditProductModal
        product={editProduct}
        onClose={() => setEditProduct(null)}
      />

      <DeleteProductDialog
        pendingDelete={pendingDelete}
        pendingRestore={pendingRestore}
        onDeleteClose={() => setPendingDelete(null)}
        onRestoreClose={() => setPendingRestore(null)}
      />
    </OrgShell>
  );
}
