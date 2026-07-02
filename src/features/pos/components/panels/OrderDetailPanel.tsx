import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  PanResponder,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import {
  useOrderDetails,
  useUpdateOrder,
  useUpdateOrderItem,
  useRemoveOrderItem,
  useCloseOrder,
  useSendToKitchen,
} from "@/features/orders/hooks";
import { getOrderActions } from "@/features/orders/utils/getOrderActions";
import { useOrderPayments } from "@/features/payments/hooks";
import { useGetProductById } from "@/features/products/product/hooks";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import {
  AddItemModal,
  type AddItemModalConfig,
} from "@/features/pos/components/modals/AddItemModal";
import {
  VoidOrderModal,
  type VoidFormValues,
} from "@/features/pos/components/modals/VoidOrderModal";
import { NewOrderModal } from "@/features/pos/components/panels/NewOrderModal";
import type { OrderItem } from "@/features/orders/types";
import { OrderStatus, OrderItemStatus } from "@/features/orders/types";
import type { Extra, Ingredient } from "@/features/products/product/types";
import { useGetPaymentMethods } from "@/features/payment-methods/hooks";
import type { Currency } from "@/features/payments/types";

const REVEAL_WIDTH = 72;
const SWIPE_THRESHOLD = 40;

// ─── ItemEditSheet ───────────────────────────────────────────────────────────

interface EditSheetProps {
  item: OrderItem;
  onClose: () => void;
  onConfirm: (config: AddItemModalConfig) => void;
  isPending: boolean;
}

function ItemEditSheet({ item, onClose, onConfirm, isPending }: EditSheetProps) {
  const { data: product, isLoading, isError } = useGetProductById(item.productId ?? "");

  if (__DEV__) {
    console.log(
      "[POS-sheet] ItemEditSheet — productId:", item.productId,
      "| isLoading:", isLoading,
      "| isError:", isError,
      "| product:", product?.name ?? "none",
    );
  }

  const initialExtraIds = useMemo(() => {
    if (!product) return new Set<string>();
    const validIds = new Set(product.extras.map((pe) => pe.id));
    return new Set(
      item.extras
        .map((e) => e.extraId)
        .filter((id): id is string => Boolean(id) && validIds.has(id)),
    );
  }, [item.extras, product]);

  const initialRemovedIngredientIds = useMemo(() => {
    if (!product) return new Set<string>();
    const validIds = new Set(product.ingredients.map((pi) => pi.id));
    return new Set(
      item.removedIngredients
        .map((r) => r.ingredientId)
        .filter((id): id is string => Boolean(id) && validIds.has(id)),
    );
  }, [item.removedIngredients, product]);

  if (!item.productId) {
    if (__DEV__)
      console.warn("[POS-sheet] productId is missing on OrderItem — backend mapOrderResponse must include it.");
    return null;
  }

  if (isLoading || !product) return null;

  return (
    <AddItemModal
      mode="edit"
      product={product}
      open={true}
      onClose={onClose}
      onConfirm={onConfirm}
      isPending={isPending}
      initialQuantity={item.quantity}
      initialExtraIds={initialExtraIds}
      initialRemovedIngredientIds={initialRemovedIngredientIds}
    />
  );
}

// ─── SwipeableItemRow ────────────────────────────────────────────────────────

const ITEM_STATUS_COLORS: Record<OrderItemStatus, { bg: string; text: string }> = {
  [OrderItemStatus.NEW]:              { bg: "#e5e7eb", text: "#6b7280" },
  [OrderItemStatus.SENT_TO_KITCHEN]: { bg: "#fef3c7", text: "#b45309" },
  [OrderItemStatus.PREPARED]:        { bg: "#d1fae5", text: "#065f46" },
};

interface RowProps {
  item: OrderItem;
  canWrite: boolean;
  canEditItems: boolean;
  isPending: boolean;
  onEditItem: () => void;
  onDelete: () => void;
}

function SwipeableItemRow({ item, canWrite, canEditItems, isPending, onEditItem, onDelete }: RowProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const isOpen = useRef(false);
  const canEditRef = useRef(canWrite && canEditItems);

  useEffect(() => {
    canEditRef.current = canWrite && canEditItems;
  }, [canWrite, canEditItems]);

  const snapTo = (toValue: number) => {
    isOpen.current = toValue !== 0;
    Animated.spring(translateX, { toValue, useNativeDriver: true, bounciness: 3 }).start();
  };

  const closeRow = () => snapTo(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        canEditRef.current &&
        Math.abs(dx) > 8 &&
        Math.abs(dx) > Math.abs(dy) * 1.5,
      onPanResponderGrant: () => {
        const base = isOpen.current ? -REVEAL_WIDTH : 0;
        translateX.setOffset(base);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, { dx }) => {
        const base = isOpen.current ? -REVEAL_WIDTH : 0;
        const clamped = Math.min(0, Math.max(base + dx, -REVEAL_WIDTH));
        translateX.setValue(clamped - base);
      },
      onPanResponderRelease: (_, { dx, vx }) => {
        translateX.flattenOffset();
        const wasOpen = isOpen.current;
        const effective = (wasOpen ? -REVEAL_WIDTH : 0) + dx;
        if (!wasOpen && (effective < -SWIPE_THRESHOLD || vx < -0.5)) {
          snapTo(-REVEAL_WIDTH);
        } else if (wasOpen && (effective > -REVEAL_WIDTH + SWIPE_THRESHOLD || vx > 0.3)) {
          snapTo(0);
        } else {
          snapTo(wasOpen ? -REVEAL_WIDTH : 0);
        }
      },
      onPanResponderTerminate: () => {
        translateX.flattenOffset();
        snapTo(0);
      },
    }),
  ).current;

  const handleDeletePress = () => {
    Alert.alert(
      t("pos.detail.item.delete.title"),
      t("pos.detail.item.delete.message", { name: item.name }),
      [
        { text: t("pos.detail.item.delete.cancel"), style: "cancel", onPress: closeRow },
        { text: t("pos.detail.item.delete.confirm"), style: "destructive", onPress: () => { closeRow(); onDelete(); } },
      ],
    );
  };

  const canInteract = canWrite && canEditItems && !isPending;

  return (
    <View style={swipeStyles.container}>
      <View style={[swipeStyles.deleteBack, { width: REVEAL_WIDTH, backgroundColor: theme.danger }]}>
        <Pressable
          onPress={handleDeletePress}
          style={swipeStyles.deleteBtn}
          disabled={!canInteract}
          hitSlop={4}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
        </Pressable>
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={[swipeStyles.animatedRow, { backgroundColor: theme.surfaceAlt, transform: [{ translateX }] }]}
      >
        <Pressable
          onPress={canInteract ? () => { closeRow(); onEditItem(); } : undefined}
          style={({ pressed }) => [
            swipeStyles.rowPressable,
            pressed && canInteract && { opacity: 0.7 },
          ]}
        >
          <View style={swipeStyles.info}>
            <Text style={[typography.body, { color: theme.text, fontWeight: "500" }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.extras.length > 0 && (
              <Text style={[typography.caption, { color: theme.textMuted }]} numberOfLines={1}>
                + {item.extras.map((e) => e.name).join(", ")}
              </Text>
            )}
            {item.removedIngredients.length > 0 && (
              <Text style={[typography.caption, { color: theme.danger }]} numberOfLines={1}>
                — {item.removedIngredients.map((r) => r.name).join(", ")}
              </Text>
            )}
            {canWrite && (
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>
                ×{item.quantity}
              </Text>
            )}
          </View>
          <View style={swipeStyles.rightSide}>
            {!canWrite && (
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                ×{item.quantity}
              </Text>
            )}
            {item.status && ITEM_STATUS_COLORS[item.status] && (
              <View style={[swipeStyles.statusBadge, { backgroundColor: ITEM_STATUS_COLORS[item.status].bg }]}>
                <Text style={[typography.caption, { color: ITEM_STATUS_COLORS[item.status].text, fontWeight: "600" }]}>
                  {t(`pos.detail.itemStatus.${item.status}`)}
                </Text>
              </View>
            )}
            <Text style={[typography.body, swipeStyles.price, { color: theme.text }]}>
              ${item.total.toFixed(2)}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const swipeStyles = StyleSheet.create({
  container: { overflow: "hidden" },
  deleteBack: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtn: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
  animatedRow: { backgroundColor: "transparent" },
  rowPressable: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  info: { flex: 1 },
  rightSide: { alignItems: "flex-end", gap: 2 },
  price: { fontWeight: "600", minWidth: 52, textAlign: "right" },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
});

// ─── OrderDetailPanel ────────────────────────────────────────────────────────

interface OrderDetailPanelProps {
  orderId: string;
  canWrite: boolean;
  /** Opens the PaymentPanel for split-bill / multi-payment flow. */
  onOpenPaymentPanel?: () => void;
  onBack?: () => void;
  /** Called after a successful complete or void — parent should clear selection. */
  onOrderClosed?: () => void;
}

export function OrderDetailPanel({
  orderId,
  canWrite,
  onOpenPaymentPanel,
  onBack,
  onOrderClosed,
}: OrderDetailPanelProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data: order, isLoading } = useOrderDetails(orderId);
  const { data: paymentMethods } = useGetPaymentMethods({});
  const { amountPaid, payments: recordedPayments } = useOrderPayments(orderId);
  const editMutation = useUpdateOrderItem();
  const deleteMutation = useRemoveOrderItem();
  const voidMutation = useUpdateOrder(orderId);
  const kitchenMutation = useSendToKitchen(orderId);
  const { state: closeState, close: closeOrder, reset: resetClose } = useCloseOrder(orderId);
  const isPending = editMutation.isPending || deleteMutation.isPending;

  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [voidOpen, setVoidOpen] = useState(false);
  const [editOrderOpen, setEditOrderOpen] = useState(false);

  // Reset all state when the selected order changes — prevents error/state bleed.
  useEffect(() => {
    resetClose();
    voidMutation.reset();
    kitchenMutation.reset();
    setEditingItem(null);
    setVoidOpen(false);
    setEditOrderOpen(false);
    setSelectedMethodId(null);
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent once the order reaches a terminal state so it can clear selection.
  useEffect(() => {
    if (closeState.phase === "done") onOrderClosed?.();
  }, [closeState.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const orderTotal = order?.total ?? 0;
  const remaining = Math.max(0, orderTotal - amountPaid);
  const fullyPaid = remaining <= 0.001 && recordedPayments.length > 0;

  // Thread amountPaid into getOrderActions — canComplete = active && fully paid.
  const { canComplete, canVoid, canEditItems } = getOrderActions(order, amountPaid);
  const hasUnsentItems = order?.items.some((i) => i.status === OrderItemStatus.NEW) ?? false;

  const handleKitchen = () => {
    if (!order || !canWrite) return;
    kitchenMutation.mutate(undefined, {
      onError: () => Alert.alert(t("pos.detail.kitchenError")),
    });
  };

  const selectedMethod = paymentMethods?.items.find((m) => m.id === selectedMethodId);
  const isClosing = closeState.phase === "paying" || closeState.phase === "patching";

  // ─── complete / pay logic ───────────────────────────────────────
  // Three sub-cases for the complete button press:
  //   A. fullyPaid (remaining ≤ 0) — just PATCH, no new payment.
  //   B. remaining > 0 and a method is selected — quick-pay: record remaining, then PATCH.
  //   C. remaining > 0 and no method — button disabled (hint shown).
  const completeEnabled =
    canWrite &&
    !isClosing &&
    (canComplete || (remaining > 0.001 && Boolean(selectedMethod)));

  const completeLabel = (() => {
    if (closeState.phase === "patch_failed") return t("pos.detail.close.retry");
    if (remaining > 0.001 && selectedMethod) {
      return t("pos.detail.payAndComplete", { amount: remaining.toFixed(2) });
    }
    return t("pos.detail.completeOrder");
  })();

  const handleCompleteOrder = () => {
    if (!order || !canWrite || isClosing) return;

    if (closeState.phase === "patch_failed") {
      closeState.retry();
      return;
    }

    if (fullyPaid || !selectedMethod) {
      // Path A: balance already zero — skip payment, just PATCH.
      closeOrder();
      return;
    }

    // Path B: quick-pay the remaining balance, then PATCH.
    const currency = (order.currency?.toLowerCase() ?? "eur") as Currency;
    closeOrder({
      orderId: order.id,
      amount: remaining,
      currency,
      paymentMethodId: selectedMethod.id,
      paymentMethodName: selectedMethod.name,
    });
  };

  const handleVoidConfirm = (values: VoidFormValues) => {
    if (!order || !canWrite) return;
    voidMutation.mutate(
      {
        status: OrderStatus.CANCELLED,
        voidReason: values.voidReason,
        voidReasonDetails: values.voidReasonDetails,
      },
      {
        onSuccess: () => { setVoidOpen(false); onOrderClosed?.(); },
        onError: () => Alert.alert(t("pos.void.errors.failed")),
      },
    );
  };

  const handleConfirmEdit = ({ quantity, selectedExtras, removedIngredients }: AddItemModalConfig) => {
    if (!editingItem) return;
    editMutation.mutate(
      {
        orderId,
        itemId: editingItem.id,
        dto: {
          quantity,
          extras: selectedExtras.map((e: Extra) => ({
            extraId: e.id,
            name: e.name,
            price: e.price,
            quantity: 1,
          })),
          removedIngredients: removedIngredients.map((i: Ingredient) => ({
            ingredientId: i.id,
            ingredientName: i.name,
          })),
        },
      },
      {
        onSuccess: () => setEditingItem(null),
        onError: () => Alert.alert(t("pos.addItem.error")),
      },
    );
  };

  const handleDelete = (itemId: string) => {
    deleteMutation.mutate(
      { orderId, itemId },
      { onError: () => Alert.alert(t("pos.detail.item.deleteError")) },
    );
  };

  // ─── empty / loading states ─────────────────────────────────────

  if (!orderId) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.bg }]}>
        <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
        <Text style={[typography.h3, { color: theme.textMuted }]}>{t("pos.detail.noOrder")}</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.empty, { backgroundColor: theme.bg }]}>
        <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
        <Text style={[typography.h3, { color: theme.textMuted }]}>{t("pos.detail.noOrder")}</Text>
      </View>
    );
  }

  // ─── main render ────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <Pressable onPress={onBack} hitSlop={10} style={({ pressed }) => [pressed && { opacity: 0.5 }]}>
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </Pressable>
          )}
          <View>
            <Text style={[typography.h3, { color: theme.text }]}>#{order.orderNumber}</Text>
            {order.customerName ? (
              <Text style={[typography.caption, { color: theme.textMuted }]}>{order.customerName}</Text>
            ) : null}
          </View>
          <OrderStatusBadge status={order.status} />
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </View>
        <View style={styles.actions}>
          {/* Print — placeholder, no logic yet */}
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons name="print-outline" size={16} color={theme.textMuted} />
            <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.detail.print")}</Text>
          </Pressable>

          {/* Edit — pre-fill customerName; only when order is editable */}
          {canEditItems && (
            <Pressable
              onPress={() => canWrite && setEditOrderOpen(true)}
              disabled={!canWrite}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                !canWrite && { opacity: 0.4 },
                pressed && canWrite && { opacity: 0.6 },
              ]}
            >
              <Ionicons name="create-outline" size={16} color={theme.textMuted} />
              <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.detail.edit")}</Text>
            </Pressable>
          )}

          {/* Kitchen — visible whenever the order has unsent items */}
          {hasUnsentItems && (
            <Pressable
              onPress={handleKitchen}
              disabled={!canWrite || kitchenMutation.isPending}
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                (!canWrite || kitchenMutation.isPending) && { opacity: 0.4 },
                pressed && canWrite && !kitchenMutation.isPending && { opacity: 0.6 },
              ]}
            >
              {kitchenMutation.isPending
                ? <ActivityIndicator size={14} color={theme.textMuted} />
                : <Ionicons name="arrow-redo-outline" size={16} color={theme.textMuted} />}
              <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.detail.kitchen")}</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* BODY */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!canEditItems && (
          <View style={[styles.cancelledBanner, { backgroundColor: theme.danger + "18", borderColor: theme.danger + "40" }]}>
            <Ionicons name="ban-outline" size={15} color={theme.danger} />
            <Text style={[typography.caption, { color: theme.danger, flex: 1 }]}>
              {t("pos.detail.cancelledNotice")}
            </Text>
          </View>
        )}

        {order.items.length === 0 ? (
          <View style={styles.noItems}>
            <Text style={[typography.bodySm, { color: theme.textMuted }]}>{t("pos.detail.noItems")}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={[styles.itemsCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
              {order.items.map((item, idx) => (
                <View key={item.id ?? String(idx)}>
                  <SwipeableItemRow
                    item={item}
                    canWrite={canWrite}
                    canEditItems={canEditItems}
                    isPending={isPending}
                    onEditItem={() => setEditingItem(item)}
                    onDelete={() => handleDelete(item.id)}
                  />
                  {idx < order.items.length - 1 && (
                    <View style={[styles.itemDivider, { backgroundColor: theme.border }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FOOTER */}
      <View style={[styles.footer, { backgroundColor: theme.surfaceAlt, borderTopColor: theme.border }]}>
        {/* Totals + remaining */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={[typography.body, { color: theme.textMuted }]}>{t("pos.detail.total")}</Text>
            <Text style={[typography.body, { color: theme.text }]}>${orderTotal.toFixed(2)}</Text>
          </View>

          {recordedPayments.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[typography.bodySm, { color: theme.textMuted }]}>{t("pos.detail.amountPaid")}</Text>
              <Text style={[typography.bodySm, { color: theme.success }]}>−${amountPaid.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.summaryDivider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            {fullyPaid ? (
              <>
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  <Text style={[typography.bodySm, { color: theme.success, fontWeight: "700" }]}>
                    {t("pos.detail.paidInFull")}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: theme.success }]}>$0.00</Text>
              </>
            ) : (
              <>
                <Text style={[typography.h3, { color: theme.text }]}>{t("pos.detail.remaining")}</Text>
                <Text style={[typography.h3, { color: theme.text }]}>${remaining.toFixed(2)}</Text>
              </>
            )}
          </View>
        </View>

        <View style={[styles.itemDivider, { backgroundColor: theme.border }]} />

        {/* Partial-failure retry banner */}
        {closeState.phase === "patch_failed" && (
          <Pressable
            onPress={() => closeState.retry()}
            style={[styles.retryBanner, { backgroundColor: theme.warning ?? "#f59e0b" }]}
          >
            <Ionicons name="warning-outline" size={16} color="#fff" />
            <Text style={[typography.caption, styles.retryBannerText]}>
              {t("pos.detail.close.patchFailed")}
            </Text>
          </Pressable>
        )}

        {/* Quick-pay method chips — shown only when balance remains */}
        {!fullyPaid && canWrite && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} contentContainerStyle={styles.paymentMethodsRow}>
            {paymentMethods?.items.map((cat) => {
              const active = selectedMethodId === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedMethodId(active ? null : cat.id)}
                  style={({ pressed }) => [
                    styles.paymentMethodChip,
                    {
                      backgroundColor: active ? theme.primarySoft : theme.surface,
                      borderColor: active ? theme.primary : theme.border,
                    },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[typography.bodySm, { color: active ? theme.primary : theme.text, fontWeight: active ? "700" : "400" }]}>
                    {cat.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}


        <View style={[styles.itemDivider, { backgroundColor: theme.border }]} />

        <View style={styles.footerBtnRow}>
          {/* Void button — hidden on cancelled/completed orders */}
          {canVoid && (
            <Pressable
              onPress={() => setVoidOpen(true)}
              disabled={!canWrite || voidMutation.isPending}
              style={({ pressed }) => [
                styles.footerBtn,
                { backgroundColor: canWrite ? theme.danger : theme.border },
                pressed && canWrite && { opacity: 0.8 },
              ]}
            >
              <Ionicons name="close-outline" size={30} color="#fff" />
            </Pressable>
          )}

          {/* Complete / Pay & Complete */}
          <Pressable
            onPress={handleCompleteOrder}
            disabled={!completeEnabled}
            style={({ pressed }) => [
              styles.footerBtn,
              styles.footerBtnClose,
              { backgroundColor: completeEnabled ? theme.success : theme.border },
              pressed && completeEnabled && { opacity: 0.8 },
            ]}
          >
            {isClosing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark-outline" size={25} color="#fff" />
            )}
            <Text style={[styles.footerBtnLabel, styles.footerBtnCloseLabel]}>{completeLabel}</Text>
          </Pressable>

          {/* Split-payment shortcut → opens PaymentPanel */}
          {onOpenPaymentPanel && (
            <Pressable
              onPress={onOpenPaymentPanel}
              style={({ pressed }) => [
                styles.footerBtn,
                styles.footerBtnAdvanced,
                { backgroundColor: theme.surface, borderColor: theme.border },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Ionicons name="calculator-outline" size={25} color={theme.text} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Edit order modal (customerName) */}
      <NewOrderModal
        mode="edit"
        open={editOrderOpen}
        onClose={() => setEditOrderOpen(false)}
        orderId={orderId}
        initialCustomerName={order.customerName ?? ""}
        onOrderUpdated={() => setEditOrderOpen(false)}
      />

      {/* Edit item modal */}
      {editingItem && (
        <ItemEditSheet
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onConfirm={handleConfirmEdit}
          isPending={editMutation.isPending}
        />
      )}

      {/* Void order modal */}
      <VoidOrderModal
        open={voidOpen}
        isLoading={voidMutation.isPending}
        onClose={() => setVoidOpen(false)}
        onConfirm={handleVoidConfirm}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  section: { gap: spacing.sm },
  itemsCard: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    overflow: "hidden",
  },
  itemDivider: { height: StyleSheet.hairlineWidth },
  noItems: { paddingVertical: spacing.xl, alignItems: "center" },
  summaryCard: { gap: spacing.xs },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  summaryDivider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.xs },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  paymentMethodsRow: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  paymentMethodChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footerBtnRow: { flexDirection: "row", alignItems: "stretch", gap: spacing.sm },
  footerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 52,
    borderRadius: radius.sm,
  },
  footerBtnClose: { flex: 3, height: 52 },
  footerBtnAdvanced: { borderWidth: StyleSheet.hairlineWidth },
  footerBtnLabel: { color: "#fff", fontSize: 13, fontWeight: "700" },
  footerBtnCloseLabel: { fontSize: 15, fontWeight: "800" },
  retryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  retryBannerText: { color: "#fff", fontWeight: "600", flex: 1 },
});
