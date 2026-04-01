const STORAGE_KEY = "securelife-chat";

export function clearChatIfMatchesLead(deletedLeadId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.leadId === deletedLeadId) {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
}
