import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthTokens } from "../types";

// ─── State Shape ──────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
};

// ─── Slice ────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState() {
      return initialState;
    },
    setCredentials(
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>,
    ) {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    restoreSession(state, action: PayloadAction<AuthTokens>) {
      state.tokens = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading, restoreSession, resetAuthState } =
  authSlice.actions;
export default authSlice.reducer;
