// Admin allowlist for the Scramble management dashboard.
// Only these emails can access the admin (/) view.
export const ADMIN_EMAILS = [
  "helloscrambleteam@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
