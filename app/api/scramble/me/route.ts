import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * GET /api/scramble/me?email=...
 * Returns the scramble_users profile for an email.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("scramble_users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[scramble me GET]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/**
 * PATCH /api/scramble/me
 * Updates a scramble_users profile.
 * Body: { email, ...fieldsToUpdate }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    // Whitelist updatable fields
    const allowed: Record<string, any> = {};
    if ("company_name" in updates) allowed.company_name = updates.company_name;
    if ("tier" in updates) allowed.tier = updates.tier;
    if ("services" in updates) allowed.services = updates.services;
    if ("onboarding_complete" in updates) allowed.onboarding_complete = updates.onboarding_complete;
    if ("google_connected" in updates) allowed.google_connected = updates.google_connected;
    allowed.updated_at = new Date().toISOString();

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("scramble_users")
      .update(allowed)
      .eq("email", email)
      .select()
      .single();

    if (error) {
      console.error("[scramble me PATCH]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error("[scramble me PATCH]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
