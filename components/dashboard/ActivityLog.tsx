"use client";

import { useState } from "react";
import {
  Wrench,
  FileText,
  AlertTriangle,
  Settings,
  BarChart3,
  Plus,
  Bot,
  User,
  X,
  Send,
} from "lucide-react";
import { ClientNote, NoteType } from "@/lib/types";
import { relativeTime, formatDateTime } from "@/lib/utils";

interface ActivityLogProps {
  clientId: string;
  notes: ClientNote[];
  onNoteAdded?: (note: ClientNote) => void;
}

const TYPE_CONFIG: Record<
  NoteType,
  { icon: typeof Wrench; color: string; label: string }
> = {
  action: { icon: Wrench, color: "text-primary bg-primary-dim", label: "Action taken" },
  note: { icon: FileText, color: "text-text-muted bg-bg-border", label: "Note" },
  alert: { icon: AlertTriangle, color: "text-warning bg-warning-dim", label: "Alert" },
  system: { icon: Settings, color: "text-text-dim bg-bg-tertiary", label: "System" },
  report: { icon: BarChart3, color: "text-accent bg-accent-dim", label: "Report" },
};

const NOTE_TYPE_OPTIONS: { value: NoteType; label: string }[] = [
  { value: "action", label: "Action Taken" },
  { value: "note", label: "Note" },
  { value: "report", label: "Report" },
  { value: "alert", label: "Alert" },
];

function AuthorBadge({ author }: { author: "cayde" | "gabriel" }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium"
      style={{
        background:
          author === "cayde"
            ? "var(--color-primary-dim)"
            : "var(--color-accent-dim)",
        color:
          author === "cayde"
            ? "var(--color-primary)"
            : "var(--color-accent)",
      }}
    >
      {author === "cayde" ? (
        <Bot className="w-2.5 h-2.5" />
      ) : (
        <User className="w-2.5 h-2.5" />
      )}
      {author === "cayde" ? "Cayde" : "Gabriel"}
    </span>
  );
}

export default function ActivityLog({ clientId, notes, onNoteAdded }: ActivityLogProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({ content: "", type: "note" as NoteType, author: "cayde" as "cayde" | "gabriel" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localNotes, setLocalNotes] = useState<ClientNote[]>(notes);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNote),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save note");
      }
      const created: ClientNote = await res.json();
      const updated = [created, ...localNotes];
      setLocalNotes(updated);
      onNoteAdded?.(created);
      setNewNote({ content: "", type: "note", author: "cayde" });
      setShowAddForm(false);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="section-title">Activity Log</h3>
          <p className="section-subtitle mt-0.5">
            Everything done for this client — the audit trail Gabriel can show clients
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-secondary flex items-center gap-1.5 text-sm"
        >
          {showAddForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Log Entry
            </>
          )}
        </button>
      </div>

      {/* Add note form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 p-4 rounded-xl bg-bg-tertiary border"
          style={{ borderColor: "var(--color-primary)", borderWidth: "1px", borderStyle: "solid" }}
        >
          <div className="flex gap-2 mb-3">
            <select
              value={newNote.type}
              onChange={(e) => setNewNote((n) => ({ ...n, type: e.target.value as NoteType }))}
              className="input w-auto text-sm"
            >
              {NOTE_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={newNote.author}
              onChange={(e) => setNewNote((n) => ({ ...n, author: e.target.value as "cayde" | "gabriel" }))}
              className="input w-auto text-sm"
            >
              <option value="cayde">Cayde (Agent)</option>
              <option value="gabriel">Gabriel</option>
            </select>
          </div>

          <textarea
            value={newNote.content}
            onChange={(e) => setNewNote((n) => ({ ...n, content: e.target.value }))}
            placeholder="Describe what was done, decided, or noticed…"
            rows={3}
            className="input resize-none text-sm mb-3"
            autoFocus
          />

          {error && (
            <p className="text-xs text-danger mb-2">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newNote.content.trim()}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? "Saving…" : "Save Entry"}
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {localNotes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-text-muted">No activity logged yet.</p>
          <p className="text-xs text-text-dim mt-1">
            Use "Log Entry" to record actions, notes, and updates for this client.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-4 top-2 bottom-2 w-px"
            style={{ background: "var(--color-bg-border)" }}
          />

          <div className="flex flex-col gap-4">
            {localNotes.map((note) => {
              const config = TYPE_CONFIG[note.type];
              const Icon = config.icon;

              return (
                <div key={note.id} className="flex gap-4 relative">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                        {config.label}
                      </span>
                      <AuthorBadge author={note.author} />
                      <span className="text-xs text-text-dim" title={formatDateTime(note.timestamp)}>
                        {relativeTime(note.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
