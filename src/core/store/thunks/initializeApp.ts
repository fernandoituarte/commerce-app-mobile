import { createAsyncThunk } from "@reduxjs/toolkit";
import { storage } from "../../../shared/utils/storage";
import { restoreSession, setLoading } from "../../../features/auth/store/authSlice";
import { setThemeMode } from "../slices/themeSlice";
import { userService } from "../../../features/user/api/user.service";
import { setProfile, setProfileLoadAttempted } from "../../../features/user/store/userSlice";
import { logger } from "../../config/logger";

// ─── App Initializer ──────────────────────────────────────────────
// Reads persisted values from SecureStore / AsyncStorage and
// hydrates the Redux store before the first render guard runs.
//
// The profile fetch after restoreSession is critical: restoreSession
// only carries tokens — auth.user is left null. Without the profile,
// the org bootstrap (which reads user.profile.id for the per-user
// storage key) would have no userId and could not restore the last-used
// org. setProfileLoadAttempted() is dispatched in the finally block so
// the bootstrap knows it is safe to run even when the fetch fails.

export const initializeApp = createAsyncThunk(
  "app/initialize",
  async (_, { dispatch }) => {
    try {
      const [accessToken, refreshToken, themeMode] = await Promise.all([
        storage.getAccessToken(),
        storage.getRefreshToken(),
        storage.getThemeMode(),
      ]);

      if (accessToken && refreshToken) {
        dispatch(restoreSession({ accessToken, refreshToken }));

        try {
          const profileResponse = await userService.getProfile();
          dispatch(setProfile(profileResponse.user));
          logger.log("INIT", `Profile restored — id:${profileResponse.user.id}`);
        } catch (profileErr: unknown) {
          // Non-fatal. Possible causes:
          //  • Both tokens expired → 401 interceptor cannot refresh → will
          //    dispatch logout() → isAuthenticated becomes false → org
          //    bootstrap exits cleanly, no spinner.
          //  • Network error → bootstrap falls back to first-org selection.
          // setProfileLoadAttempted() in the finally block unblocks the
          // bootstrap in either case.
          logger.warn("INIT", "Startup profile fetch failed — org bootstrap will use first-org fallback", profileErr);
        } finally {
          // Always signal the bootstrap: the profile attempt is done.
          dispatch(setProfileLoadAttempted());
        }
      } else {
        dispatch(setLoading(false));
      }

      if (themeMode === "light" || themeMode === "dark" || themeMode === "system") {
        dispatch(setThemeMode(themeMode));
      }
    } catch {
      dispatch(setLoading(false));
    }
  }
);
