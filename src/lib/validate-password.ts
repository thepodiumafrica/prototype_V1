// Ported exactly from ThePodium_v5.html's validatePw().
export function validatePassword(pw: string): string | null {
  if (pw.length < 10) return "Min 10 characters";
  if (!/[A-Z]/.test(pw)) return "Need an uppercase letter";
  if (!/[0-9\W_]/.test(pw)) return "Need a number or symbol";
  return null;
}

// Ported exactly from ThePodium_v5.html's doSignUp() username check.
export function validateUsername(username: string): string | null {
  if (!username) return "Username required";
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(username)) {
    return "3–24 chars, letters/numbers/underscores";
  }
  return null;
}
