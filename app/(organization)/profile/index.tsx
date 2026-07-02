import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { OrgShell } from "@/shared/components/OrgShell";
import { Avatar, Badge, Button, Input, Skeleton } from "@/shared/components/ui";
import { radius, spacing, typography, useTheme } from "@/core/theme";
import {
  useGetOrganization,
  useUpdateOrganization,
} from "@/features/organization/hooks/useOrganization";
import { useStripeConnect } from "@/features/stripe-connect/hooks";
import { useAppSelector } from "@/core/store/hooks";
import { orgProfileSchema } from "@/features/organization/validations";
import {
  useGetDomains,
  useCreateDomain,
  useUpdateDomain,
  useDeleteDomain,
} from "@/features/organization-domains/hooks";
import type { OrganizationDomain } from "@/features/organization-domains/types";
import type { ApiError } from "@/shared/types";
import { DomainListItem } from "@/features/organization/components/domain-list-item";
import { DomainAddInput } from "@/features/organization/components/domain-add-input";
import { DomainEditModal } from "@/features/organization/components/domain-edit-modal";
import { DomainDeleteDialog } from "@/features/organization/components/domain-delete-dialog";

type OrgProfileForm = z.infer<typeof orgProfileSchema>;

export default function OrgProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currentOrganizationId } = useAppSelector(
    (state) => state.organization,
  );
  const { data } = useGetOrganization(currentOrganizationId ?? "");

  const { mutate: updateOrg, isPending } = useUpdateOrganization();

  // ─── Stripe Connect ─────────────────────────────────────────────
  const [stripeStatus, setStripeStatus] = useState<"idle" | "pending" | "complete">("idle");

  const {
    mutate: stripeConnect,
    isPending: isStripeLoading,
    error: stripeError,
  } = useStripeConnect();

  function handleStripePress() {
    stripeConnect(undefined, {
      onSuccess: (res) => {
        if (res.status === "complete") setStripeStatus("complete");
        else if (res.status === "pending") setStripeStatus("pending");
      },
    });
  }

  const hasStripeAccount = !!data?.stripeAccountId;
  const maskedStripeId = data?.stripeAccountId
    ? data.stripeAccountId.slice(0, 8) + "..."
    : null;
  const showPending = hasStripeAccount && stripeStatus === "pending";
  // ────────────────────────────────────────────────────────────────

  // ─── Domains ────────────────────────────────────────────────────
  const [editingDomain, setEditingDomain] = useState<OrganizationDomain | null>(
    null,
  );
  const [deletingDomain, setDeletingDomain] =
    useState<OrganizationDomain | null>(null);
  const [addError, setAddError] = useState<string | undefined>();

  const domainsQuery = useGetDomains();
  const { mutate: createDomain, isPending: isCreating } = useCreateDomain();
  const { mutate: updateDomain, isPending: isUpdating } = useUpdateDomain(
    editingDomain?.id ?? "",
  );
  const { mutate: deleteDomain } = useDeleteDomain();

  const domains = Array.isArray(domainsQuery.data)
    ? domainsQuery.data
    : (domainsQuery.data?.items ?? []);

  function handleAddDomain(domain: string, onSuccess: () => void) {
    setAddError(undefined);
    createDomain(
      { domain },
      {
        onSuccess: () => onSuccess(),
        onError: (err) => {
          const apiErr = err as unknown as ApiError;
          if (apiErr.statusCode === 409) {
            setAddError(t("org.profile.domainConflict"));
          }
        },
      },
    );
  }

  function handleEditDomain(_id: string, domain: string) {
    updateDomain(
      { domain },
      {
        onSuccess: () => setEditingDomain(null),
      },
    );
  }

  function handleDeleteDomain(id: string) {
    deleteDomain(id, {
      onSuccess: () => setDeletingDomain(null),
    });
  }
  // ────────────────────────────────────────────────────────────────

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<OrgProfileForm>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: {
      name: "",
      address: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name,
      address: data.address,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
    });
  }, [data, reset]);

  const orgName = watch("name");

  function onSubmit(values: OrgProfileForm) {
    updateOrg(values);
  }

  return (
    <OrgShell title={t("org.profile.title")} scrollable keyboard>
      {/* Logo section */}
      <View
        style={[
          styles.logoCard,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoWrap}>
            <Avatar name={orgName} size="xl" />
            <Pressable
              style={({ pressed }) => [
                styles.cameraBtn,
                { backgroundColor: theme.primary, borderColor: theme.bg },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={t("org.profile.changeLogo")}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </Pressable>
          </View>
          <View style={styles.logoMeta}>
            <Text style={[typography.h3, { color: theme.text }]}>
              {data?.name}
            </Text>
            <Text style={[typography.bodySm, { color: theme.textMuted }]}>
              {t("org.profile.logoHint")}
            </Text>
            <Badge label={t("org.profile.verified")} tone="success" />
          </View>
        </View>
      </View>

      {/* Info section */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <Text
          style={[
            typography.caption,
            {
              color: theme.textMuted,
              letterSpacing: 0.5,
              marginBottom: spacing.md,
            },
          ]}
        >
          {t("org.profile.infoSection").toUpperCase()}
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.name")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.address")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.address?.message}
              multiline
            />
          )}
        />
        <Controller
          control={control}
          name="contactEmail"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.contactEmail")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.contactEmail?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        <Controller
          control={control}
          name="contactPhone"
          render={({ field: { value, onChange, onBlur } }) => (
            <Input
              label={t("org.profile.contactPhone")}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.contactPhone?.message}
              keyboardType="phone-pad"
            />
          )}
        />
      </View>

      {/* Stripe section */}
      <View
        style={[
          styles.section,
          styles.stripeSection,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <View style={styles.stripeHeader}>
          <Ionicons name="card-outline" size={20} color={theme.primary} />
          <Text style={[typography.h3, { color: theme.text }]}>
            {t("org.profile.stripeSection")}
          </Text>
        </View>
        <Text
          style={[
            typography.bodySm,
            { color: theme.textMuted, marginTop: spacing.xs },
          ]}
        >
          {t("org.profile.stripeDescription")}
        </Text>

        {/* Account ID row — only when connected */}
        {hasStripeAccount && (
          <View
            style={[
              styles.stripeId,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={theme.textMuted}
            />
            <Text
              style={[typography.bodySm, { color: theme.textMuted, flex: 1 }]}
              numberOfLines={1}
            >
              {maskedStripeId}
            </Text>
            {showPending ? (
              <Badge label={t("org.profile.stripeSetupIncomplete")} tone="warning" />
            ) : (
              <Badge label={t("org.profile.stripeConnected")} tone="success" />
            )}
          </View>
        )}

        {/* Not connected */}
        {!hasStripeAccount && (
          <Text
            style={[
              typography.bodySm,
              { color: theme.textMuted, marginTop: spacing.md },
            ]}
          >
            {t("org.profile.stripeNotConnected")}
          </Text>
        )}

        {/* Error message */}
        {stripeError && (
          <Text
            style={[
              typography.bodySm,
              { color: theme.danger, marginTop: spacing.sm },
            ]}
          >
            {stripeError.message}
          </Text>
        )}

        {/* Action button */}
        {!hasStripeAccount ? (
          <Button
            title={t("org.profile.stripeConnect")}
            style={{ marginTop: spacing.md }}
            onPress={handleStripePress}
            loading={isStripeLoading}
          />
        ) : showPending ? (
          <Button
            title={t("org.profile.stripeCompleteSetup")}
            style={{ marginTop: spacing.md }}
            onPress={handleStripePress}
            loading={isStripeLoading}
          />
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.stripeBtn,
              { borderColor: theme.primary },
              isStripeLoading && { opacity: 0.5 },
              pressed && !isStripeLoading && { opacity: 0.7 },
            ]}
            onPress={handleStripePress}
            disabled={isStripeLoading}
          >
            {isStripeLoading ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Ionicons name="open-outline" size={16} color={theme.primary} />
                <Text
                  style={[
                    typography.bodySm,
                    { color: theme.primary, fontWeight: "600" },
                  ]}
                >
                  {t("org.profile.stripeManage")}
                </Text>
              </>
            )}
          </Pressable>
        )}
      </View>

      {/* Domains section */}
      <View
        style={[
          styles.section,
          { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
        ]}
      >
        <View style={styles.stripeHeader}>
          <Ionicons name="globe-outline" size={20} color={theme.primary} />
          <Text style={[typography.h3, { color: theme.text }]}>
            {t("org.profile.domainsSection")}
          </Text>
        </View>
        <Text
          style={[
            typography.bodySm,
            { color: theme.textMuted, marginTop: spacing.xs },
          ]}
        >
          {t("org.profile.domainsDescription")}
        </Text>

        {domainsQuery.isLoading ? (
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            <Skeleton height={36} />
            <Skeleton height={36} />
          </View>
        ) : (
          domains.map((domain) => (
            <DomainListItem
              key={domain.id}
              domain={domain}
              isOnly={domains.length === 1}
              onEdit={setEditingDomain}
              onDelete={setDeletingDomain}
            />
          ))
        )}

        <DomainAddInput
          onAdd={handleAddDomain}
          apiError={addError}
          isPending={isCreating}
        />
      </View>

      <Button
        title={t("org.actions.save")}
        style={{ marginTop: spacing.sm }}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      />

      <DomainEditModal
        domain={editingDomain}
        onClose={() => setEditingDomain(null)}
        onSubmit={handleEditDomain}
        isPending={isUpdating}
      />
      <DomainDeleteDialog
        domain={deletingDomain}
        onClose={() => setDeletingDomain(null)}
        onConfirm={handleDeleteDomain}
      />
    </OrgShell>
  );
}

export const styles = StyleSheet.create({
  logoCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  logoWrap: { width: 96, height: 96 },
  cameraBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMeta: { flex: 1, gap: spacing.sm },
  section: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.lg,
  },
  stripeSection: {},
  stripeHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  stripeId: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.md,
  },
  stripeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
