/**
 * Discriminated result returned by every Server Action.
 *
 * `error` is a stable code, not a sentence, so the UI decides the wording and
 * the contract survives copy changes. Because the union is discriminated on
 * `ok`, a caller that checks it gets `data` narrowed automatically - which the
 * previous `{ status: number; message: string; data?: T }` shape could not do.
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: ActionError };

export type ActionError =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "conflict"
  | "unknown";

/** Messages for the codes above, kept in one place for the toasts. */
export const ACTION_ERROR_MESSAGE: Record<ActionError, string> = {
  unauthorized: "You need to sign in first",
  forbidden: "You are not allowed to do that",
  not_found: "That item no longer exists",
  validation: "Please check what you entered",
  conflict: "That action conflicts with the current state",
  unknown: "Something went wrong. Please try again",
};
