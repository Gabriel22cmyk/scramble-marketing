import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateStrategy } from "@/lib/clients-store";
import { CampaignStrategy } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client.campaignStrategy);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateStrategy(id, body as Partial<CampaignStrategy>);
    if (!updated) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(updated.campaignStrategy);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Failed to update strategy" },
      { status: 500 }
    );
  }
}
