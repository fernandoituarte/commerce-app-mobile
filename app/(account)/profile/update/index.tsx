import React, { useEffect, useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Button,
  Input,
  ScreenContainer,
  ScreenHeader,
} from "@/shared/components/ui";
import { radius, spacing, useTheme } from "@/core/theme";
import { useUpdateProfile, useUserProfile } from "@/features/user/hooks/useUser";

export default function ProfileUpdateScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { data } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name ?? "");
      setPhone(data.user.phone ?? "");
    }
  }, [data?.user]);

  const handleSave = () => {
    updateProfile.mutate(
      { name: name.trim() || undefined, phone: phone.trim() || undefined },
      {
        onSuccess: () => router.back(),
        onError: () => Alert.alert(t("account.profileUpdate.error")),
      },
    );
  };

  return (
    <ScreenContainer scroll keyboard>
      <ScreenHeader title={t("account.profileUpdate.title")} />

      <View style={styles.avatarRow}>
        <View style={styles.avatarWrap}>
          <Avatar name={name} size="xl" />
        </View>
      </View>

      <Input
        label={t("account.profileUpdate.name")}
        placeholder={t("account.profileUpdate.namePlaceholder")}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      <Input
        label={t("account.profileUpdate.phone")}
        placeholder={t("account.profileUpdate.phonePlaceholder.default")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <View style={{ marginTop: spacing.md }}>
        <Button
          title={t("account.actions.save")}
          loading={updateProfile.isPending}
          onPress={handleSave}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  avatarRow: {
    alignItems: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    position: "relative",
  },
  cameraBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
