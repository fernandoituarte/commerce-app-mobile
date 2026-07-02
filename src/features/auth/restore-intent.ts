// In-memory handoff for pre-filling the restore screen after a deactivated-account
// login attempt. Never persisted or logged — consumed once and cleared.
import type { RestoreAccountRequest } from "./types";

let _pending: RestoreAccountRequest | null = null;

export const setRestoreIntent = (creds: RestoreAccountRequest): void => {
  _pending = creds;
};

export const consumeRestoreIntent = (): RestoreAccountRequest | null => {
  const intent = _pending;
  _pending = null;
  return intent;
};
