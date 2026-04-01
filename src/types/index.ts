import type { Lead, Message, Document, Analysis } from "@prisma/client";

export type { Lead, Message, Document, Analysis };

export type LeadWithRelations = Lead & {
  conversations: Message[];
  documents: Document[];
  analysis: Analysis | null;
};

export interface ChatRequest {
  leadId?: string;
  message: string;
}

export interface ChatResponse {
  leadId: string;
  message: string;
  extractedData?: Record<string, unknown>;
}

export interface ExtractedLeadData {
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  city?: string;
  occupation?: string;
  primaryInterest?: string;
  existingPolicies?: number;
  monthlyBudget?: number;
  urgency?: string;
  qualificationScore?: number;
  statusUpdate?: string;
}
