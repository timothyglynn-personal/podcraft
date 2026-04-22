import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars
  results.envVars = {
    SUPABASE_DB_URL: !!process.env.SUPABASE_DB_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "not set",
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    RESEND_KEY_PREFIX: process.env.RESEND_API_KEY?.slice(0, 6) || "not set",
  };

  // Test 1: Raw SQL query to verify table exists
  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(process.env.SUPABASE_DB_URL!);
    const tableCheck = await sql`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    results.test1_tables = {
      status: "pass",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tables: tableCheck.map((r: any) => r.table_name),
    };
    await sql.end();
  } catch (e) {
    results.test1_tables = { status: "fail", error: String(e) };
  }

  // Test 2: Raw SQL INSERT into verificationToken
  try {
    const postgres = (await import("postgres")).default;
    const sql = postgres(process.env.SUPABASE_DB_URL!);
    await sql`
      INSERT INTO "verificationToken" (identifier, token, expires)
      VALUES ('test-debug-user', 'debug-token-123', NOW() + INTERVAL '1 hour')
      ON CONFLICT DO NOTHING
    `;
    // Clean up
    await sql`DELETE FROM "verificationToken" WHERE token = 'debug-token-123'`;
    results.test2_rawInsert = { status: "pass" };
    await sql.end();
  } catch (e) {
    results.test2_rawInsert = { status: "fail", error: String(e) };
  }

  // Test 3: Drizzle ORM insert into verificationTokens
  try {
    const { getDb } = await import("@/lib/db");
    const { verificationTokens } = await import("@/lib/db/schema");
    const db = getDb();
    await db.insert(verificationTokens).values({
      identifier: "drizzle-test-debug-user",
      token: "drizzle-debug-token-456",
      expires: new Date(Date.now() + 3600000),
    });
    // Clean up
    const { eq } = await import("drizzle-orm");
    await db.delete(verificationTokens).where(eq(verificationTokens.token, "drizzle-debug-token-456"));
    results.test3_drizzleInsert = { status: "pass" };
  } catch (e) {
    results.test3_drizzleInsert = { status: "fail", error: String(e) };
  }

  // Test 4: Resend API - send a test email
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailResult = await resend.emails.send({
      from: `PodCraft <${["onboarding", "resend.dev"].join("@")}>`,
      to: ["delivered", "resend.dev"].join("@"), // Resend test address
      subject: "PodCraft Auth Debug Test",
      html: "<p>This is a test email from PodCraft auth debug.</p>",
    });
    results.test4_resendEmail = { status: "pass", id: emailResult.data?.id, error: emailResult.error };
  } catch (e) {
    results.test4_resendEmail = { status: "fail", error: String(e) };
  }

  // Test 5: DrizzleAdapter createVerificationToken
  try {
    const { DrizzleAdapter } = await import("@auth/drizzle-adapter");
    const { getDb } = await import("@/lib/db");
    const { users, accounts, sessions, verificationTokens } = await import("@/lib/db/schema");
    const adapter = DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    });
    if (adapter.createVerificationToken) {
      const vt = await adapter.createVerificationToken({
        identifier: "adapter-test-debug-user",
        token: "adapter-debug-token-789",
        expires: new Date(Date.now() + 3600000),
      });
      results.test5_adapterCreateToken = { status: "pass", result: vt };
      // Clean up
      if (adapter.useVerificationToken) {
        await adapter.useVerificationToken({
          identifier: "adapter-test-debug-user",
          token: "adapter-debug-token-789",
        });
      }
    } else {
      results.test5_adapterCreateToken = { status: "fail", error: "createVerificationToken not found on adapter" };
    }
  } catch (e) {
    results.test5_adapterCreateToken = { status: "fail", error: String(e) };
  }

  // Test 6: Full auth initialization test
  try {
    const { auth } = await import("@/lib/auth");
    const session = await auth();
    results.test6_authInit = { status: "pass", hasSession: !!session };
  } catch (e) {
    results.test6_authInit = { status: "fail", error: String(e) };
  }

  return NextResponse.json(results, { status: 200 });
}
