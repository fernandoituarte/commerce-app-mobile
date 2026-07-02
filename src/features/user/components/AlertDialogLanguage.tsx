import { Linking, Text } from "react-native";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/shared/components/ui/AlertDialog";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/core/theme";
import { t } from "i18next";
import { Button } from "@/shared/components/ui/Button";

export const AlertDialogLanguage = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AlertDialogTrigger onPress={() => setOpen(true)}>
        <Ionicons
          name="arrow-forward-sharp"
          size={18}
          color={colors.primary[600]}
        />
      </AlertDialogTrigger>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("app.settings.language")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("app.settings.languageModalDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              title={t("app.settings.goToSettings")}
              onPress={() => Linking.openSettings()}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
