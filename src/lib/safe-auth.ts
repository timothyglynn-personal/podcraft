/**
 * Safe auth wrapper that returns null instead of throwing
 * when the database isn't configured.
 */
export async function safeAuth() {
  try {
    const { auth } = await import("@/lib/auth");
    return await auth();
  } catch {
    return null;
  }
}
