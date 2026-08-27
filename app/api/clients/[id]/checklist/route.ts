import { NextRequest, NextResponse } from "next/server";
import { updateChecklist, getClientById } from "@/lib/clients-store";
import { SetupChecklist } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json(client.setupChecklist);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = updateChecklist(id, body as Partial<SetupChecklist>);
    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    return NextResponse.json(updated.setupChecklist);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Failed to update checklist" },
      { status: 500 }
    );
  }
}
