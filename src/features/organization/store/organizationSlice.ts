import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Organization, OrganizationMembership } from "../types";

// ─── State Shape ──────────────────────────────────────────────────

interface OrganizationState {
  currentOrganizationId: string | null;
  membership: OrganizationMembership | null;
  organization: Organization | null;
  isLoading: boolean;
}

const initialState: OrganizationState = {
  currentOrganizationId: null,
  membership: null,
  organization: null,
  isLoading: false,
};

// ─── Slice ────────────────────────────────────────────────────────

const organizationSlice = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setCurrentOrganizationId(state, action: PayloadAction<string | null>) {
      state.currentOrganizationId = action.payload;
    },
    setMembership(state, action: PayloadAction<OrganizationMembership>) {
      state.currentOrganizationId = action.payload.organization.id;
      state.membership = action.payload;
      state.isLoading = false;
    },
    setOrganization(state, action: PayloadAction<Organization>) {
      state.organization = action.payload;
      state.isLoading = false;
    },
    updateOrganization(state, action: PayloadAction<Partial<Organization>>) {
      if (state.organization) {
        state.organization = { ...state.organization, ...action.payload };
      }
    },
    clearOrganization(state) {
      state.organization = null;
      state.isLoading = false;
    },
    setOrganizationLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setMembership, setOrganization, updateOrganization, clearOrganization, setOrganizationLoading, setCurrentOrganizationId } =
  organizationSlice.actions;
export default organizationSlice.reducer;
