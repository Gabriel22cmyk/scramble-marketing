import { NextRequest, NextResponse } from "next/server";
import { getClientById, updateBrief } from "@/lib/clients-store";
import { BusinessBrief } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
  return NextResponse.json(client.businessBrief);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateBrief(id, body as Partial<BusinessBrief>);
    if (!updated) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    return NextResponse.json(updated.businessBrief);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Failed to update brief" },
      { status: 500 }
    );
  }
}
