// Ported from ThePodium_v5.html's avatarHtml(). The hue is deterministic
// from the username; light/dark color values are handled in CSS (see
// .avatar rules in globals.css) so this renders correctly under SSR
// without knowing the current theme at render time.
function hueFor(username: string): number {
  let sum = 0;
  for (const c of username) sum += c.charCodeAt(0);
  return sum % 360;
}

export function Avatar({
  username,
  size = 36,
}: {
  username: string;
  size?: number;
}) {
  const initials = username.slice(0, 2).toUpperCase();
  const hue = hueFor(username);

  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        minWidth: size,
        fontSize: Math.round(size * 0.34),
        ["--avatar-hue" as string]: hue,
      }}
    >
      {initials}
    </div>
  );
}
