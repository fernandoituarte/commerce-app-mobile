import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Subscription } from "../types";

// ─── State Shape ──────────────────────────────────────────────────

interface SubscriptionState {
  subscription: Subscription | null;
  isLoading: boolean;
}

const initialState: SubscriptionState = {
  subscription: null,
  isLoading: false,
};

// ─── Slice ────────────────────────────────────────────────────────

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setSubscription(state, action: PayloadAction<Subscription>) {
      state.subscription = action.payload;
      state.isLoading = false;
    },
    updateSubscription(state, action: PayloadAction<Partial<Subscription>>) {
      if (state.subscription) {
        state.subscription = { ...state.subscription, ...action.payload };
      }
    },
    clearSubscription(state) {
      state.subscription = null;
      state.isLoading = false;
    },
    setSubscriptionLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setSubscription, updateSubscription, clearSubscription, setSubscriptionLoading } =
  subscriptionSlice.actions;
export default subscriptionSlice.reducer;
