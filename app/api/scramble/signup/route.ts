import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase";
import { servicesForTier, TierKey } from "@/lib/tiers";

/**
 * POST /api/scramble/signup
 * Creates a scramble_users profile after Supabase auth signup.
 *
 * Body: { authUserId, email, companyName, tier }
 */
export async function POST(request: NextRequest) {
  try {
    const { authUserId, email, companyName, tier } = await request.json();

    if (!email || !companyName || !tier) {
      return NextResponse.json(
        { error: "email, companyName and tier are required" },
        { status: 400 }
      );
    }

    const validTiers: TierKey[] = ["seo", "ads", "full"];
    if (!validTiers.includes(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const services = servicesForTier(tier);
    const supabase = createAdminSupabaseClient();

    const { data, error } = await supabase
      .from("scramble_users")
      .upsert(
        [
          {
            auth_user_id: authUserId || null,
            email,
            company_name: companyName,
            tier,
            services,
            onboarding_complete: false,
            google_connected: false,
            is_active: true,
          },
        ],
        { onConflict: "email" }
      )
      .select()
      .single();

    if (error) {
      console.error("[scramble signup]", error);
      return NextResponse.json(
        { error: error.message || "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error("[scramble signup]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
