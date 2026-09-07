import type { DictKey } from "@/lib/i18n/dictionary";

// Ported exactly from ThePodium_v5.html's validatePw(). Returns a
// dictionary key rather than English text -- these run in client
// components that already have a `t()` from useLocale(), so the caller
// translates: `const err = validatePassword(pw); if (err) setError(t(err));`
export function validatePassword(pw: string): DictKey | null {
  if (pw.length < 10) return "pwTooShort";
  if (!/[A-Z]/.test(pw)) return "pwNeedUppercase";
  if (!/[0-9\W_]/.test(pw)) return "pwNeedNumberOrSymbol";
  return null;
}

// Ported exactly from ThePodium_v5.html's doSignUp() username check.
export function validateUsername(username: string): DictKey | null {
  if (!username) return "usernameRequired";
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return "usernameFormat";
  }
  return null;
}

// Client-side mirror of the server-side check inside handle_new_user() --
// this is just for immediate form feedback, not the real enforcement.
// The trigger re-checks the submitted date_of_birth itself and rolls back
// the whole sign-up if it's missing or under 13, so this can't be
// bypassed by skipping the client check.
export function validateAge(dateOfBirth: string): DictKey | null {
  if (!dateOfBirth) return "dobRequired";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "dobInvalid";
  const thirteenYearsAgo = new Date();
  thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
  if (dob > thirteenYearsAgo) {
    return "dobTooYoung";
  }
  return null;
}
