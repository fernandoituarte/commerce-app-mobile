import React from "react";
import { ScrollView, Pressable, Text, View, StyleSheet } from "react-native";
import { radius, spacing, typography, useTheme } from "@/core/theme";

interface IdName {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: IdName[];
  selectedId: string;
  onSelect: (id: string) => void;
  tags: IdName[];
  selectedTagId: string;
  onSelectTag: (tagId: string) => void;
  allLabel?: string;
}

export function CategoryTabs({
  categories,
  selectedId,
  onSelect,
  tags,
  selectedTagId,
  onSelectTag,
  allLabel = "All",
}: CategoryTabsProps) {
  const theme = useTheme();

  return (
    <View>
      {/* Category tabs (primary) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        bounces={false}
      >
        <Pressable
          onPress={() => { onSelect("all"); onSelectTag("all"); }}
          style={({ pressed }) => [
            styles.tab,
            {
              backgroundColor: selectedId === "all" ? theme.primary : theme.surface,
              borderColor: selectedId === "all" ? theme.primary : theme.border,
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text
            style={[
              typography.bodySm,
              { color: selectedId === "all" ? "#fff" : theme.textMuted, fontWeight: "600" },
            ]}
          >
            {allLabel}
          </Text>
        </Pressable>

        {categories.map((cat) => {
          const active = selectedId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => { onSelect(cat.id); onSelectTag("all"); }}
              style={({ pressed }) => [
                styles.tab,
                {
                  backgroundColor: active ? theme.primary : theme.surface,
                  borderColor: active ? theme.primary : theme.border,
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  typography.bodySm,
                  { color: active ? "#fff" : theme.text, fontWeight: active ? "700" : "400" },
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tag chips (secondary filter) */}
      {tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subRow}
          bounces={false}
        >
          <Pressable
            onPress={() => onSelectTag("all")}
            style={[
              styles.subChip,
              {
                backgroundColor: selectedTagId === "all" ? theme.primarySoft : "transparent",
                borderColor: selectedTagId === "all" ? theme.primary : theme.border,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                { color: selectedTagId === "all" ? theme.primary : theme.textMuted },
              ]}
            >
              {allLabel}
            </Text>
          </Pressable>

          {tags.map((tag) => {
            const active = selectedTagId === tag.id;
            return (
              <Pressable
                key={tag.id}
                onPress={() => onSelectTag(tag.id)}
                style={[
                  styles.subChip,
                  {
                    backgroundColor: active ? theme.primarySoft : "transparent",
                    borderColor: active ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: active ? theme.primary : theme.textMuted, fontWeight: active ? "600" : "400" },
                  ]}
                >
                  {tag.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  subRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  subChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
