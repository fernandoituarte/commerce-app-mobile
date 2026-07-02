import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserProfile } from "../types";

// ─── State Shape ──────────────────────────────────────────────────

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  // True once initializeApp has finished its one-shot profile fetch
  // (success OR failure). The org bootstrap waits on this flag so it
  // can run exactly once, with the userId in hand if the fetch succeeded.
  profileLoadAttempted: boolean;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  profileLoadAttempted: false,
};

// ─── Slice ────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
      state.isLoading = false;
    },
    updateProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearProfile(state) {
      state.profile = null;
      state.isLoading = false;
      state.profileLoadAttempted = false;
    },
    setUserLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setProfileLoadAttempted(state) {
      state.profileLoadAttempted = true;
    },
  },
});

export const {
  setProfile,
  updateProfile,
  clearProfile,
  setUserLoading,
  setProfileLoadAttempted,
} = userSlice.actions;
export default userSlice.reducer;
