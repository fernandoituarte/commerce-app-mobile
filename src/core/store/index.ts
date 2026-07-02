import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/store/authSlice";
import userReducer from "../../features/user/store/userSlice";
import subscriptionReducer from "../../features/subscription/store/subscriptionSlice";
import organizationReducer from "../../features/organization/store/organizationSlice";
import themeReducer from "./slices/themeSlice";
import reactotron from "../config/ReactotronConfig";
import { initializeApp } from "./thunks/initializeApp";

// ─── Store ────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    subscription: subscriptionReducer,
    organization: organizationReducer,
    theme: themeReducer,
  },
  enhancers: (getDefaultEnhancers) =>
    __DEV__ && reactotron.createEnhancer
      ? getDefaultEnhancers().concat(reactotron.createEnhancer())
      : getDefaultEnhancers(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

store.dispatch(initializeApp());

// ─── Types ────────────────────────────────────────────────────────

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
