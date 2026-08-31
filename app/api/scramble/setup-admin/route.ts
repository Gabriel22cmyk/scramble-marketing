import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";

/**
 * POST /api/scramble/setup-admin
 * One-time helper to create the Scramble team admin account.
 * Protected by a setup secret so it can't be abused.
 *
 * Body: { email, password, setupKey }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, setupKey } = await request.json();

    // Require the setup key to match the service role prefix (simple gate).
    const expectedKey = process.env.ADMIN_SETUP_KEY;
    if (!expectedKey || setupKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdminEmail(email)) {
      return NextResponse.json({ error: "Not an allowed admin email" }, { status: 403 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Create the auth user with email confirmed (admin API)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) {
      // If already exists, update the password instead
      if (error.message?.toLowerCase().includes("already")) {
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u) => u.email === email);
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, { password, email_confirm: true });
          return NextResponse.json({ ok: true, updated: true });
        }
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, created: true, userId: data.user?.id });
  } catch (err) {
    console.error("[setup-admin]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
