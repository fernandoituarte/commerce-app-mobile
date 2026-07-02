import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { NumPad } from "../sections/NumPad";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import { useOrderDetails } from "@/features/orders/hooks";
import { useCloseOrder } from "@/features/orders/hooks";
import { getOrderActions } from "@/features/orders/utils/getOrderActions";
import { useGetPaymentMethods } from "@/features/payment-methods/hooks";
import {
  useOrderPayments,
  useCreateManualPayment,
  useCancelPayment,
} from "@/features/payments/hooks";
import { Currency, FailureReason, PaymentStatus } from "@/features/payments/types";
import type { Payment } from "@/features/payments/types";

// ─── Failure reason → i18n key map ───────────────────────────────
// Single source of truth: every FailureReason value maps to one key
// under pos.payment.failureReason.* in each locale.
const FAILURE_REASON_KEY: Record<FailureReason, string> = {
  [FailureReason.ORDER_CANCELLED]:          "pos.payment.failureReason.ORDER_CANCELLED",
  [FailureReason.STAFF_CANCEL]:             "pos.payment.failureReason.STAFF_CANCEL",
  [FailureReason.WRONG_AMOUNT]:             "pos.payment.failureReason.WRONG_AMOUNT",
  [FailureReason.WRONG_PAYMENT_METHOD]:     "pos.payment.failureReason.WRONG_PAYMENT_METHOD",
  [FailureReason.CUSTOMER_CANCELLED]:       "pos.payment.failureReason.CUSTOMER_CANCELLED",
  [FailureReason.DUPLICATE_PAYMENT]:        "pos.payment.failureReason.DUPLICATE_PAYMENT",
  [FailureReason.PAYMENT_FAILED]:           "pos.payment.failureReason.PAYMENT_FAILED",
  [FailureReason.CHECKOUT_SESSION_EXPIRED]: "pos.payment.failureReason.CHECKOUT_SESSION_EXPIRED",
  [FailureReason.PAYMENT_CANCELED]:         "pos.payment.failureReason.PAYMENT_CANCELED",
};

const TERMINAL_PAYMENT_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.CANCELLED,
  PaymentStatus.REFUNDED,
  PaymentStatus.FAILED,
  PaymentStatus.EXPIRED,
]);

// ─── helpers ─────────────────────────────────────────────────────

function applyKey(current: string, key: string): string {
  if (key === "⌫") return current.length > 1 ? current.slice(0, -1) : "0";
  if (key === "." && current.includes(".")) return current;
  if (current === "0" && key !== ".") return key;
  const next = current + key;
  const parts = next.split(".");
  if (parts[1] !== undefined && parts[1].length > 2) return current;
  return next;
}

// ─── PaymentRow ───────────────────────────────────────────────────
// canCancel = canWrite && canEditItems (order is open).
// Backend doesn't guard cancel-on-completed-order, so the frontend
// is the only barrier.

interface PaymentRowProps {
  payment: Payment;
  canCancel: boolean;
  onCancel: () => void;
  isCancelling: boolean;
}

function PaymentRow({ payment, canCancel, onCancel, isCancelling }: PaymentRowProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const amountDollars = payment.amount / 100;
  const isTerminal = TERMINAL_PAYMENT_STATUSES.has(payment.status);
  const reasonKey = payment.failureReason ? FAILURE_REASON_KEY[payment.failureReason] : null;

  const cancelledDate = payment.cancelledAt
    ? new Date(payment.cancelledAt).toLocaleDateString(i18n.language, { month: "short", day: "numeric" })
    : null;

  const handleCancelPress = () => {
    Alert.alert(
      t("pos.payment.cancel.title"),
      t("pos.payment.cancel.message", { amount: amountDollars.toFixed(2) }),
      [
        { text: t("pos.payment.cancel.dismiss"), style: "cancel" },
        {
          text: t("pos.payment.cancel.confirm"),
          style: "destructive",
          onPress: onCancel,
        },
      ],
    );
  };

  return (
    <View style={[
      rowStyles.row,
      {
        backgroundColor: isTerminal ? theme.surface : theme.surfaceAlt,
        borderColor: isTerminal ? theme.danger + "40" : theme.border,
        opacity: isTerminal ? 0.8 : 1,
      },
    ]}>
      <View style={[rowStyles.iconWrap, { backgroundColor: isTerminal ? theme.danger + "18" : theme.primarySoft }]}>
        <Ionicons
          name={isTerminal ? "close-circle-outline" : "card-outline"}
          size={16}
          color={isTerminal ? theme.danger : theme.primary}
        />
      </View>
      <View style={rowStyles.info}>
        <Text style={[typography.bodySm, { color: theme.text, fontWeight: "500" }]} numberOfLines={1}>
          {payment.paymentMethodName ?? "—"}
        </Text>
        {reasonKey ? (
          <Text style={[typography.caption, { color: theme.danger }]} numberOfLines={1}>
            {t(reasonKey)}{cancelledDate ? ` · ${cancelledDate}` : ""}
          </Text>
        ) : (
          <Text style={[typography.caption, { color: theme.textMuted }]}>
            {payment.status}
          </Text>
        )}
      </View>
      <Text style={[typography.body, { color: isTerminal ? theme.textMuted : theme.text, fontWeight: "600", textDecorationLine: isTerminal ? "line-through" : "none" }]}>
        ${amountDollars.toFixed(2)}
      </Text>

      {/* Cancel X — only on active (non-terminal) payments when order is open */}
      {canCancel && !isTerminal && (
        <Pressable
          onPress={handleCancelPress}
          disabled={isCancelling}
          hitSlop={8}
          style={({ pressed }) => [
            rowStyles.cancelBtn,
            { backgroundColor: theme.danger + "18" },
            pressed && { opacity: 0.6 },
          ]}
        >
          {isCancelling ? (
            <ActivityIndicator size={12} color={theme.danger} />
          ) : (
            <Ionicons name="close" size={14} color={theme.danger} />
          )}
        </Pressable>
      )}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  cancelBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── PaymentPanel ─────────────────────────────────────────────────

interface PaymentPanelProps {
  orderId: string;
  canWrite: boolean;
  onClose?: () => void;
}

export function PaymentPanel({ orderId, canWrite, onClose }: PaymentPanelProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { data: order } = useOrderDetails(orderId);
  const { data: paymentMethods } = useGetPaymentMethods({});
  const { allPayments, payments, amountPaid, isLoading: isLoadingPayments } = useOrderPayments(orderId);
  const createPayment = useCreateManualPayment();
  const cancelPayment = useCancelPayment();
  const { state: closeState, close: completeOrder } = useCloseOrder(orderId);

  const orderTotal = order?.total ?? 0;
  const remaining = Math.max(0, orderTotal - amountPaid);

  const { canComplete, canEditItems } = getOrderActions(order, amountPaid);
  // Cancel X is only shown when the order is open and the user can write.
  const canCancel = canWrite && canEditItems;

  const [amount, setAmount] = useState(() => remaining.toFixed(2));
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);
  const [paymentMethodName, setPaymentMethodName] = useState<string | null>(null);
  // Track which payment is currently being cancelled so its row shows a spinner.
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const entered = parseFloat(amount) || 0;

  // Amount validation — overpayment not allowed.
  // Backend has no such guard; this is frontend-only. Flagged for backend enforcement.
  const amountExceedsRemaining = entered > remaining + 0.001;
  const amountValid = entered > 0 && !amountExceedsRemaining;

  const canAddPayment =
    canWrite &&
    canEditItems &&
    paymentMethodId !== null &&
    paymentMethodName !== null &&
    amountValid &&
    !createPayment.isPending;

  const isCompleting = closeState.phase === "paying" || closeState.phase === "patching";

  const handleKey = (key: string) => setAmount((prev) => applyKey(prev, key));

  const handleAddPayment = () => {
    if (!canAddPayment || !order) return;

    const currency = (order.currency?.toLowerCase() ?? "eur") as Currency;
    createPayment.mutate(
      {
        orderId,
        amount: entered,
        currency,
        paymentMethodId: paymentMethodId!,
        paymentMethodName: paymentMethodName!,
      },
      {
        onSuccess: () => {
          setPaymentMethodId(null);
          setPaymentMethodName(null);
          setAmount("0");
        },
        onError: (err: any) => {
          Alert.alert(t("pos.payment.errors.addFailed"), err?.message);
        },
      },
    );
  };

  const handleCancelPayment = (payment: Payment) => {
    setCancellingId(payment.id);
    cancelPayment.mutate(
      {
        id: payment.id,
        data: { failureReason: FailureReason.WRONG_AMOUNT },
      },
      {
        onSuccess: () => setCancellingId(null),
        onError: (err: any) => {
          setCancellingId(null);
          console.log("Cancel payment failed:", err);
        },
      },
    );
  };


  const handleCompleteOrder = () => {
    if (!canComplete || !canWrite || isCompleting) return;
    completeOrder();
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }]}>
        <Pressable
          onPress={onClose}
          hitSlop={8}
          style={({ pressed }) => [pressed && { opacity: 0.5 }]}
        >
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <Text style={[typography.h3, { color: theme.text, flex: 1 }]}>
          {t("pos.payment.title")}
        </Text>
        {order && (
          <Text style={[typography.bodySm, { color: theme.textMuted }]}>#{order.orderNumber}</Text>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Order summary + remaining */}
        <View style={[styles.summaryCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.payment.orderTotal")}</Text>
            <Text style={[typography.h3, { color: theme.text }]}>${orderTotal.toFixed(2)}</Text>
          </View>

          {amountPaid > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>{t("pos.payment.paid")}</Text>
              <Text style={[typography.body, { color: theme.success }]}>−${amountPaid.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            {canComplete ? (
              <>
                <View style={styles.paidBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  <Text style={[typography.bodySm, { color: theme.success, fontWeight: "700" }]}>
                    {t("pos.payment.paidInFull")}
                  </Text>
                </View>
                <Text style={[typography.h3, { color: theme.success }]}>$0.00</Text>
              </>
            ) : (
              <>
                <Text style={[typography.caption, { color: theme.textMuted }]}>
                  {t("pos.payment.remaining")}
                </Text>
                <Text style={[typography.h2, { color: theme.text }]}>${remaining.toFixed(2)}</Text>
              </>
            )}
          </View>
        </View>

        {/* Recorded payments list */}
        {isLoadingPayments ? (
          <ActivityIndicator color={theme.primary} style={{ alignSelf: "center" }} />
        ) : allPayments.length > 0 ? (
          <View style={styles.paymentsList}>
            <Text style={[typography.caption, { color: theme.textMuted, letterSpacing: 0.5 }]}>
              {t("pos.payment.recordedPayments").toUpperCase()}
            </Text>
            {allPayments.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                canCancel={canCancel}
                isCancelling={cancellingId === p.id}
                onCancel={() => handleCancelPayment(p)}
              />
            ))}
          </View>
        ) : null}

        {/* Add payment section — hidden when already fully paid */}
        {!canComplete && canWrite && canEditItems && (
          <>
            {/* Amount display */}
            <View style={[
              styles.amountCard,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: amountExceedsRemaining ? theme.danger : theme.border,
              },
            ]}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                {t("pos.payment.enterAmount")}
              </Text>
              <View style={styles.amountRow}>
                <Text style={[styles.amountText, { color: theme.text }]}>$</Text>
                <Text style={[
                  styles.amountText,
                  {
                    color: amountExceedsRemaining
                      ? theme.danger
                      : entered >= remaining - 0.001 && entered > 0
                        ? theme.success
                        : theme.text,
                  },
                ]}>
                  {amount}
                </Text>
              </View>

              {/* Over-remaining error */}
              {amountExceedsRemaining && (
                <View style={[styles.errorPill, { backgroundColor: theme.danger + "18" }]}>
                  <Ionicons name="warning-outline" size={13} color={theme.danger} />
                  <Text style={[typography.caption, { color: theme.danger, fontWeight: "600" }]}>
                    {t("pos.payment.errors.exceedsRemaining", { remaining: remaining.toFixed(2) })}
                  </Text>
                </View>
              )}
            </View>

            {/* Payment method grid */}
            <Text style={[typography.caption, { color: theme.textMuted, letterSpacing: 0.5 }]}>
              {t("pos.payment.method").toUpperCase()}
            </Text>
            <View style={styles.methodGrid}>
              {paymentMethods?.items.map((pm) => {
                const active = paymentMethodId === pm.id;
                return (
                  <Pressable
                    key={pm.id}
                    onPress={() => {
                      setPaymentMethodId(pm.id);
                      setPaymentMethodName(pm.name);
                    }}
                    style={({ pressed }) => [
                      styles.methodBtn,
                      {
                        backgroundColor: active ? theme.primary : theme.surfaceAlt,
                        borderColor: active ? theme.primary : theme.border,
                      },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text
                      style={[
                        typography.caption,
                        { color: active ? "#fff" : theme.text, fontWeight: active ? "700" : "400" },
                      ]}
                    >
                      {pm.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Quick-amount shortcuts */}
            <View style={styles.quickRow}>
              {[remaining, remaining / 2].filter((v) => v > 0.001).map((v, i) => (
                <Pressable
                  key={i}
                  onPress={() => setAmount(v.toFixed(2))}
                  style={({ pressed }) => [
                    styles.quickBtn,
                    { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[typography.caption, { color: theme.primary, fontWeight: "600" }]}>
                    {i === 0 ? t("pos.payment.exactAmount") : t("pos.payment.halfAmount")} ${v.toFixed(2)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Numpad */}
            <NumPad onKey={handleKey} />
          </>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: theme.surfaceAlt, borderTopColor: theme.border }]}>
        {canComplete ? (
          /* Balance is zero — "Complete Order" */
          <Pressable
            onPress={handleCompleteOrder}
            disabled={!canWrite || isCompleting}
            style={({ pressed }) => [
              styles.confirmBtn,
              {
                backgroundColor: canWrite && !isCompleting ? theme.success : theme.border,
                borderColor: canWrite && !isCompleting ? theme.success : theme.border,
              },
              pressed && canWrite && !isCompleting && { opacity: 0.8 },
            ]}
          >
            {isCompleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={20} color={canWrite ? "#fff" : theme.textMuted} />
            )}
            <Text style={[styles.confirmText, { color: canWrite && !isCompleting ? "#fff" : theme.textMuted }]}>
              {closeState.phase === "patch_failed"
                ? t("pos.detail.close.retry")
                : t("pos.payment.completeOrder")}
            </Text>
          </Pressable>
        ) : (
          /* Balance remains — "Add Payment" */
          <Pressable
            onPress={handleAddPayment}
            disabled={!canAddPayment}
            style={({ pressed }) => [
              styles.confirmBtn,
              {
                backgroundColor: canAddPayment ? theme.primary : theme.surface,
                borderColor: canAddPayment ? theme.primary : theme.border,
              },
              pressed && canAddPayment && { opacity: 0.8 },
            ]}
          >
            {createPayment.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={canAddPayment ? "#fff" : theme.textMuted}
              />
            )}
            <Text style={[styles.confirmText, { color: canAddPayment ? "#fff" : theme.textMuted }]}>
              {t("pos.payment.addPayment")}
            </Text>
          </Pressable>
        )}

        {/* Partial-failure retry banner */}
        {closeState.phase === "patch_failed" && (
          <Pressable
            onPress={() => closeState.phase === "patch_failed" && closeState.retry()}
            style={[styles.retryBanner, { backgroundColor: (theme as any).warning ?? "#f59e0b" }]}
          >
            <Ionicons name="warning-outline" size={15} color="#fff" />
            <Text style={[typography.caption, { color: "#fff", fontWeight: "600", flex: 1 }]}>
              {t("pos.detail.close.patchFailed")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.xs },
  paidBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentsList: { gap: spacing.sm },
  amountCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: "center",
    gap: spacing.sm,
  },
  amountRow: { flexDirection: "row", alignItems: "flex-end", gap: 4 },
  amountText: { fontSize: 40, fontWeight: "800", lineHeight: 48 },
  errorPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  methodBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    minWidth: "45%",
    flex: 1,
  },
  quickRow: { flexDirection: "row", gap: spacing.sm },
  quickBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  confirmText: { fontSize: 17, fontWeight: "800" },
  retryBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
});
