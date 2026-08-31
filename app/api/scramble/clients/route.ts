import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";

/**
 * GET /api/scramble/clients
 * Admin route — lists all onboarded Scramble clients (for Gabriel + Herbie).
 * Pulls from scramble_users, newest first.
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("scramble_users")
      .select("id, email, company_name, tier, services, onboarding_complete, google_connected, created_at, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[scramble clients]", error);
      return NextResponse.json({ error: error.message, clients: [] }, { status: 500 });
    }

    const clients = data || [];
    const stats = {
      total: clients.length,
      connected: clients.filter((c) => c.google_connected).length,
      onboarding: clients.filter((c) => !c.onboarding_complete).length,
      seo: clients.filter((c) => c.tier === "seo").length,
      ads: clients.filter((c) => c.tier === "ads").length,
      full: clients.filter((c) => c.tier === "full").length,
    };

    return NextResponse.json({ clients, stats });
  } catch (err) {
    console.error("[scramble clients]", err);
    return NextResponse.json({ error: "Internal error", clients: [] }, { status: 500 });
  }
}
