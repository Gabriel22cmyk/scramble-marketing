import { NextRequest, NextResponse } from "next/server";
import {
  getClientById,
  addNote,
  generateNoteId,
} from "@/lib/clients-store";
import { ClientNote, NoteType } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = getClientById(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  return NextResponse.json(client.notes ?? []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { content, type = "note", author = "cayde" } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const note: ClientNote = {
      id: generateNoteId(id),
      type: type as NoteType,
      content: content.trim(),
      author: author as "cayde" | "gabriel",
      timestamp: new Date().toISOString(),
    };

    const updated = addNote(id, note);
    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(note, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message ?? "Failed to add note" },
      { status: 500 }
    );
  }
}
