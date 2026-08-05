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

// Client-side mirror of the server-side check inside handle_new_user() --
// this is just for immediate form feedback, not the real enforcement.
// The trigger re-checks the submitted date_of_birth itself and rolls back
// the whole sign-up if it's missing or under 13, so this can't be
// bypassed by skipping the client check.
export function validateAge(dateOfBirth: string): string | null {
  if (!dateOfBirth) return "Date of birth required";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "Enter a valid date";
  const thirteenYearsAgo = new Date();
  thirteenYearsAgo.setFullYear(thirteenYearsAgo.getFullYear() - 13);
  if (dob > thirteenYearsAgo) {
    return "You must be at least 13 years old to join";
  }
  return null;
}
