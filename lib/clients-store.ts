import fs from "fs";
import path from "path";
import {
  Client,
  ClientNote,
  SetupChecklist,
  BusinessBrief,
  CampaignStrategy,
} from "./types";

const DATA_FILE = path.join(process.cwd(), "data", "clients.json");

const DEFAULT_BRIEF: BusinessBrief = {
  description: "",
  targetAudience: "",
  businessGoals: "",
  serviceArea: "",
  keyServices: "",
  competitors: "",
  existingAssets: "",
  seoRetainerFee: null,
  adsBudget: null,
  additionalNotes: "",
};

const DEFAULT_STRATEGY: CampaignStrategy = {
  summary: "",
  targetKeywords: "",
  adCampaignStructure: "",
  nextActions: "",
};

const DEFAULT_CHECKLIST: SetupChecklist = {
  clientInfoComplete: true,
  briefReceived: false,
  searchConsoleVerified: false,
  analyticsLinked: false,
  adsLinked: false,
  keywordsAdded: false,
  initialAuditDone: false,
  strategyDocumented: false,
  reportScheduled: false,
};

export function readClients(): Client[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, "[]", "utf-8");
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const clients = JSON.parse(raw) as Client[];
    return clients.map((c) => ({
      ...c,
      businessBrief: { ...DEFAULT_BRIEF, ...(c.businessBrief ?? {}) },
      campaignStrategy: { ...DEFAULT_STRATEGY, ...(c.campaignStrategy ?? {}) },
      setupChecklist: { ...DEFAULT_CHECKLIST, ...(c.setupChecklist ?? {}) },
      notes: c.notes ?? [],
    }));
  } catch {
    return [];
  }
}

export function writeClients(clients: Client[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(clients, null, 2), "utf-8");
}

export function getClientById(id: string): Client | undefined {
  return readClients().find((c) => c.id === id);
}

export function addClient(client: Client): void {
  const clients = readClients();
  clients.push(client);
  writeClients(clients);
}

export function updateClient(id: string, updates: Partial<Client>): Client | null {
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  clients[idx] = { ...clients[idx], ...updates };
  writeClients(clients);
  return clients[idx];
}

export function updateBrief(
  clientId: string,
  updates: Partial<BusinessBrief>
): Client | null {
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;
  clients[idx].businessBrief = {
    ...clients[idx].businessBrief,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  // Auto-mark brief as received if key fields are filled
  const brief = clients[idx].businessBrief;
  if (brief.description && brief.businessGoals) {
    clients[idx].setupChecklist.briefReceived = true;
  }
  writeClients(clients);
  return clients[idx];
}

export function updateStrategy(
  clientId: string,
  updates: Partial<CampaignStrategy>
): Client | null {
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;
  clients[idx].campaignStrategy = {
    ...clients[idx].campaignStrategy,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  if (clients[idx].campaignStrategy.summary) {
    clients[idx].setupChecklist.strategyDocumented = true;
  }
  writeClients(clients);
  return clients[idx];
}

export function deleteClient(id: string): boolean {
  const clients = readClients();
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return false;
  writeClients(filtered);
  return true;
}

export function addNote(clientId: string, note: ClientNote): Client | null {
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;
  clients[idx].notes = [note, ...(clients[idx].notes ?? [])];
  writeClients(clients);
  return clients[idx];
}

export function updateChecklist(
  clientId: string,
  updates: Partial<SetupChecklist>
): Client | null {
  const clients = readClients();
  const idx = clients.findIndex((c) => c.id === clientId);
  if (idx === -1) return null;
  clients[idx].setupChecklist = {
    ...clients[idx].setupChecklist,
    ...updates,
  };
  writeClients(clients);
  return clients[idx];
}

export function generateClientId(): string {
  const clients = readClients();
  const maxNum = clients.reduce((max, c) => {
    const match = c.id.match(/client-(\d+)/);
    return match ? Math.max(max, parseInt(match[1])) : max;
  }, 0);
  return `client-${String(maxNum + 1).padStart(3, "0")}`;
}

export function generateNoteId(clientId: string): string {
  const client = getClientById(clientId);
  const count = (client?.notes?.length ?? 0) + 1;
  return `note-${clientId.replace("client-", "")}-${count}`;
}
