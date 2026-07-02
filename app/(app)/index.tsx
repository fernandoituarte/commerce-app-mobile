import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PosTopBar } from "@/features/pos/components/layout/PosTopBar";
import { PosBottomNav, type PosTab } from "@/features/pos/components/layout/PosBottomNav";
import { PosThreeCol } from "@/features/pos/components/layout/PosThreeCol";
import { OrdersPanel } from "@/features/pos/components/panels/OrdersPanel";
import { OrderDetailPanel } from "@/features/pos/components/panels/OrderDetailPanel";
import { ProductsPanel } from "@/features/pos/components/panels/ProductsPanel";
import { PaymentPanel } from "@/features/pos/components/panels/PaymentPanel";
import { useTheme } from "@/core/theme";
import { useSubscriptionAccess } from "@/features/subscription/hooks/useSubscriptionAccess";

type RightPanel = "products" | "payment";

export default function POSScreen() {
  const theme = useTheme();
  const { canWrite } = useSubscriptionAccess();

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [rightPanel, setRightPanel] = useState<RightPanel>("products");
  const [activeTab, setActiveTab] = useState<PosTab>("products");

  const handleOrderSelect = (id: string) => {
    setSelectedOrderId(id);
    setRightPanel("products");
    if (!theme.isTablet) setActiveTab("detail");
  };

  const handleCharge = () => {
    setRightPanel("payment");
    if (!theme.isTablet) setActiveTab("detail");
  };

  const handleClosePayment = () => {
    setRightPanel("products");
  };

  const handleOrderCreated = (id: string) => {
    setSelectedOrderId(id);
    if (!theme.isTablet) setActiveTab("detail");
  };

  const handleOrderClosed = () => {
    setSelectedOrderId("");
    setRightPanel("products");
    if (!theme.isTablet) setActiveTab("orders");
  };

  // After a successful add, switch to the detail tab on mobile so the
  // user sees the updated order immediately.
  const handleAddToOrder = () => {
    if (!theme.isTablet) setActiveTab("products");
  };

  // ── Tablet: 3-column layout ──────────────────────────────────────
  if (theme.isTablet) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
        <PosTopBar />
        <PosThreeCol
          left={
            <OrdersPanel
              selectedId={selectedOrderId}
              onSelect={handleOrderSelect}
              onOrderCreated={handleOrderCreated}
            />
          }
          center={
            <OrderDetailPanel
              orderId={selectedOrderId}
              canWrite={canWrite}
              onOpenPaymentPanel={handleCharge}
              onOrderClosed={handleOrderClosed}
            />
          }
          right={
            rightPanel === "payment" ? (
              <PaymentPanel orderId={selectedOrderId} canWrite={canWrite} onClose={handleClosePayment} />
            ) : (
              <ProductsPanel
                selectedOrderId={selectedOrderId}
                canWrite={canWrite}
                onAddToOrder={handleAddToOrder}
              />
            )
          }
        />
      </SafeAreaView>
    );
  }

  // ── Mobile: stacked panels with bottom nav ───────────────────────
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      <PosTopBar onMenuPress={() => {}} />

      <View style={styles.content}>
        {activeTab === "orders" && (
          <OrdersPanel
            selectedId={selectedOrderId}
            onSelect={handleOrderSelect}
            onOrderCreated={handleOrderCreated}
          />
        )}

        {activeTab === "detail" && rightPanel === "products" && (
          <OrderDetailPanel
            orderId={selectedOrderId}
            canWrite={canWrite}
            onOpenPaymentPanel={handleCharge}
            onBack={() => setActiveTab("orders")}
            onOrderClosed={handleOrderClosed}
          />
        )}

        {activeTab === "detail" && rightPanel === "payment" && (
          <PaymentPanel orderId={selectedOrderId} canWrite={canWrite} onClose={handleClosePayment} />
        )}

        {activeTab === "products" && (
          <ProductsPanel
            selectedOrderId={selectedOrderId}
            canWrite={canWrite}
            onAddToOrder={handleAddToOrder}
          />
        )}
      </View>

      <PosBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "detail") setRightPanel("products");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
