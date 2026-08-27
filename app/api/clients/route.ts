import { NextRequest, NextResponse } from "next/server";
import { readClients, addClient, generateClientId } from "@/lib/clients-store";
import { Client, ClientPackage, ClientNote, SetupChecklist, BusinessBrief, CampaignStrategy } from "@/lib/types";

export async function GET() {
  const clients = readClients();
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      domain,
      package: pkg,
      contactEmail,
      siteUrl,
      analyticsPropertyId,
      adsCustomerId,
      tags,
      businessBrief: briefInput,
    } = body;

    if (!name || !domain || !pkg) {
      return NextResponse.json(
        { error: "name, domain, and package are required" },
        { status: 400 }
      );
    }

    const needsAds = pkg === "seo-ads" || pkg === "ads";

    const briefProvided = briefInput?.description || briefInput?.businessGoals;

    const businessBrief: BusinessBrief = {
      description: briefInput?.description ?? "",
      targetAudience: briefInput?.targetAudience ?? "",
      businessGoals: briefInput?.businessGoals ?? "",
      serviceArea: briefInput?.serviceArea ?? "",
      keyServices: briefInput?.keyServices ?? "",
      competitors: briefInput?.competitors ?? "",
      existingAssets: briefInput?.existingAssets ?? "",
      seoRetainerFee: briefInput?.seoRetainerFee ?? null,
      adsBudget: briefInput?.adsBudget ?? null,
      additionalNotes: briefInput?.additionalNotes ?? "",
      updatedAt: briefInput?.updatedAt ?? new Date().toISOString(),
      updatedBy: briefInput?.updatedBy ?? "gabriel",
    };

    const campaignStrategy: CampaignStrategy = {
      summary: "",
      targetKeywords: "",
      adCampaignStructure: "",
      nextActions: "",
    };

    const setupChecklist: SetupChecklist = {
      clientInfoComplete: true,
      briefReceived: !!briefProvided,
      searchConsoleVerified: !!siteUrl,
      analyticsLinked: !!analyticsPropertyId,
      adsLinked: needsAds ? !!adsCustomerId : false,
      keywordsAdded: false,
      initialAuditDone: false,
      strategyDocumented: false,
      reportScheduled: false,
    };

    const systemNote: ClientNote = {
      id: `note-auto-1`,
      type: "system",
      content: `Client added to Scramble dashboard. ${
        pkg === "seo" ? "SEO" :
        pkg === "seo-ads" ? "SEO + Google Ads" :
        pkg === "ads" ? "Google Ads" : "Content"
      } package activated.${briefProvided ? " Business brief received." : " Business brief pending — Gabriel needs to fill this in."} Onboarding checklist started.`,
      author: "cayde",
      timestamp: new Date().toISOString(),
    };

    const client: Client = {
      id: generateClientId(),
      name: name.trim(),
      domain: domain.trim().toLowerCase().replace(/^https?:\/\//, ""),
      package: pkg as ClientPackage,
      status: "onboarding",
      startDate: new Date().toISOString().slice(0, 10),
      contactEmail: contactEmail ?? undefined,
      tags: tags ?? [],
      siteUrl: siteUrl ?? null,
      analyticsPropertyId: analyticsPropertyId ?? null,
      adsCustomerId: adsCustomerId ?? null,
      businessBrief,
      campaignStrategy,
      setupChecklist,
      notes: [systemNote],
    };

    addClient(client);
    return NextResponse.json(client, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Failed to create client" },
      { status: 500 }
    );
  }
}
