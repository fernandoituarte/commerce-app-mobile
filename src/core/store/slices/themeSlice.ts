import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── State Shape ──────────────────────────────────────────────────

type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: "system",
};

// ─── Slice ────────────────────────────────────────────────────────

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleTheme(state) {
      if (state.mode === "light") {
        state.mode = "dark";
      } else if (state.mode === "dark") {
        state.mode = "system";
      } else {
        state.mode = "light";
      }
    },
  },
});

export const { setThemeMode, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
