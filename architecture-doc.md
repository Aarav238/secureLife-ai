# SecureLife AI — Architecture Document

## 1. Executive Summary

SecureLife AI is an intelligent lead management system built for SecureLife Insurance Brokers. It replaces their manual, 2–3 day lead qualification process with an AI-powered pipeline that captures leads through natural conversation, processes insurance documents automatically, and generates actionable broker insights — reducing lead processing time to minutes.

The system comprises four core modules: an AI chatbot for lead capture, a structured data layer for pipeline management, an LLM-powered document extraction engine, and an intelligent analysis generator. All modules feed into a unified dashboard that gives brokers full pipeline visibility.

---

## 2. System Architecture

### 2.1 High-Level Overview

The system follows a **monolithic Next.js architecture** — a deliberate choice for an MVP that prioritizes development speed and deployment simplicity. All API routes, frontend pages, and AI orchestration logic live within a single Next.js application deployed on Vercel.

**Core Components:**

- **Frontend Layer** — Next.js App Router with React Server Components where possible, client components for interactive elements (chat, dashboard). Styled with Tailwind CSS and shadcn/ui for a polished, consistent UI.
- **API Layer** — Next.js Route Handlers serving as the backend. RESTful endpoints for leads, documents, chat, and analysis. All AI orchestration happens server-side to protect API keys and control costs.
- **AI Orchestration Layer** — Three specialized AI modules (chatbot, extractor, analyzer), each with dedicated prompts, output parsers, and error handling. All use the OpenAI API (GPT-4.1).
- **Data Layer** — PostgreSQL hosted on Supabase, accessed via Prisma ORM. Supabase Storage for file uploads.
- **External Services** — OpenAI API (GPT-4.1) for all LLM operations, Supabase for database and storage, Vercel for hosting.

### 2.2 Why This Stack?

| Decision | Choice | Rationale |
|---|---|---|
| **Monolith vs Microservices** | Monolith | 8-hour build window. Microservices add deployment complexity with zero MVP benefit. Can decompose later. |
| **Next.js vs Separate FE/BE** | Next.js fullstack | Single deploy target, shared types between FE/BE, API routes colocated with pages. Fastest path to a working demo. |
| **Supabase vs Self-hosted PG** | Supabase | Zero-config PostgreSQL with a free tier, built-in storage for file uploads, instant setup. Saves 30+ minutes vs provisioning a database manually. |
| **Prisma vs Raw SQL** | Prisma | Type-safe database access, auto-generated types, declarative schema, easy migrations. Prevents an entire class of bugs. |
| **OpenAI GPT-4.1** | GPT-4.1 | Strong structured extraction, reliable JSON output, excellent instruction following, and cost-effective for the expected volume. The `<extracted_data>` XML tag pattern works well for separating conversational text from structured metadata. |
| **shadcn/ui vs Material UI** | shadcn/ui | Copy-paste components (no heavy dependency), built on Radix primitives, fully customizable with Tailwind, and produces a professional look with minimal effort. |
| **SWR vs Redux/Zustand** | SWR | Lightweight data fetching with built-in caching and revalidation. No global state needed for this MVP — all state is server-derived. |

### 2.3 What This Architecture Does NOT Include (and Why)

- **Authentication/Authorization** — Not needed for MVP. Single-tenant broker tool. Would add Supabase Auth or NextAuth in production.
- **WebSocket/Real-time** — Chat uses request-response pattern. Real-time dashboard updates would use Supabase Realtime subscriptions in production.
- **Queue/Background Jobs** — Document processing is synchronous in MVP. Production would use a job queue (BullMQ, Inngest, or Supabase Edge Functions) for long-running extractions.
- **Rate Limiting** — Not implemented. Production would add rate limiting on chat endpoints to control LLM costs.
- **Caching** — No Redis layer. SWR provides client-side caching. Production would cache frequent dashboard queries.

---

## 3. Data Model

### 3.1 Core Entities

The system has four primary entities with clear ownership relationships:

**Lead** — The central entity. Represents a prospective client from first contact through final broker review. Owns all related data.

**Message** — Individual conversation messages between the chatbot and the lead. Stores role (user/assistant), content, and optionally any metadata extracted by the AI from that specific message.

**Document** — An uploaded insurance document. Stores both the raw file reference and the AI-extracted structured data. Each document belongs to exactly one lead, but a lead may have multiple documents.

**Analysis** — The AI-generated insurance analysis. One-to-one relationship with a lead. Aggregates insights across all of a lead's documents and profile data.

### 3.2 Entity Relationships

```
Lead (1) ──→ (N) Message       # Conversation history
Lead (1) ──→ (N) Document      # Uploaded insurance docs
Lead (1) ──→ (1) Analysis      # AI-generated analysis
```

### 3.3 Lead Lifecycle (Status Machine)

A lead progresses through the following statuses:

```
NEW → QUALIFYING → QUALIFIED → DOCUMENTS_PENDING → DOCUMENTS_UPLOADED → ANALYSIS_READY → REVIEWED → CLOSED_WON / CLOSED_LOST
```

- **NEW** — Lead created (once AI extracts substantive data like name, interest, or contact info — not on first message)
- **QUALIFYING** — Chatbot is actively collecting information
- **QUALIFIED** — Sufficient data collected, qualification score above threshold
- **DOCUMENTS_PENDING** — Lead asked to upload documents
- **DOCUMENTS_UPLOADED** — At least one document uploaded
- **ANALYSIS_READY** — AI analysis generated and ready for broker review
- **REVIEWED** — Broker has reviewed the analysis
- **CLOSED_WON / CLOSED_LOST** — Terminal states

Status transitions are triggered both automatically (by AI extraction logic) and manually (by broker actions on the dashboard).

### 3.4 Key Design Decisions

- **qualificationScore (0–100)** — Computed by the chatbot AI based on five weighted factors: budget clarity, specific need, existing policies, contact info completeness, and urgency. This replaces manual lead scoring.
- **extractedData (JSON)** — Documents store both typed fields (policyNumber, coverageAmount, etc.) and a raw JSON blob. The typed fields enable filtering and display; the JSON blob preserves the full extraction for edge cases.
- **rawResponse on Analysis** — We store the full LLM response for debugging. If the parsed analysis looks wrong, a developer can inspect the raw output without re-running the API call.
- **Cascade deletes** — Deleting a lead removes all messages, documents, and analysis. Appropriate for an MVP; production would soft-delete.

---

## 4. AI Integration Strategy

### 4.1 Architecture Principle: Three Specialized Agents, Not One General Agent

Rather than building one monolithic AI agent, the system uses three purpose-built AI modules, each with a focused prompt, specific output format, and dedicated error handling:

| Module | Purpose | Input | Output |
|---|---|---|---|
| **Chatbot Agent** | Natural lead qualification conversation | User message + conversation history | Conversational reply + structured data extraction |
| **Extractor Agent** | Insurance document data extraction | Raw PDF text | Structured JSON with policy fields |
| **Analyzer Agent** | Insurance gap analysis & recommendations | Lead profile + all extracted documents | Structured analysis JSON |

This separation ensures each prompt is optimized for its task, outputs are predictable and parseable, and failures in one module don't cascade to others.

### 4.2 Model Selection

All modules use **OpenAI GPT-4.1**.

Why not GPT-4o? GPT-4.1 offers improved instruction following and structured output reliability at a competitive price point. For production, we would A/B test GPT-4.1-mini for the chatbot (faster responses, lower cost) and reserve GPT-4.1 for extraction and analysis where accuracy matters most.

### 4.3 Prompt Engineering Approach

**Chatbot prompts** use a role-instruction-rules-output format:
- Role: "You are a friendly insurance advisor for SecureLife"
- Instructions: Specific goals (collect info, qualify, guide to next steps)
- Rules: Behavioral constraints (1–2 questions at a time, don't be pushy)
- Output: Dual output — conversational text for the user, structured XML/JSON block for the system

The structured extraction block uses XML tags (`<extracted_data>`) rather than asking the model to output pure JSON, because this allows GPT-4.1 to generate natural conversational text AND structured data in the same response without mode confusion.

**Extractor prompts** use a strict JSON-only output format with explicit field definitions and null handling instructions. The prompt explicitly states "do NOT hallucinate or guess values" to minimize fabricated data.

**Analyzer prompts** receive pre-structured input (not raw text) and produce categorized output with severity levels, enabling the dashboard to render color-coded risk indicators without additional processing.

### 4.4 Output Validation & Error Handling

Every AI response goes through a validation pipeline:

1. **Response received** — Check for HTTP errors, timeouts, rate limits
2. **Format validation** — Attempt to parse expected format (JSON or XML block extraction)
3. **Schema validation** — Verify required fields exist and types are correct
4. **Reasonableness checks** — Flag obviously wrong values (negative premiums, dates in 1900, etc.)
5. **Retry logic** — On parse failure, retry once with a stricter prompt ("respond ONLY with valid JSON, no other text")
6. **Graceful degradation** — If retry fails, mark as failed with error message, don't crash the pipeline

### 4.5 Cost Management

- **Token budgets** — Chatbot: max 1,024 output tokens per turn. Extractor: max 2,048. Analyzer: max 4,096.
- **Conversation history management** — Full conversation history is sent to maintain context. For production, would truncate to last 20 messages.
- **No unnecessary calls** — Extraction only runs when a broker clicks "Extract". Analysis only runs on explicit request.
- **Logging** — Every API call logs model, token count, and latency for cost monitoring.

---

## 5. API Design

### 5.1 Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/chat` | Send a message, receive AI response + data extraction |
| GET | `/api/leads` | List all leads with filters (status, search) |
| GET | `/api/leads/[id]` | Get full lead detail with messages, docs, analysis |
| PATCH | `/api/leads/[id]` | Update lead fields (status, notes, assignment) |
| DELETE | `/api/leads/[id]` | Delete lead and all related data (cascade) |
| GET | `/api/chat/history` | List all chat sessions |
| GET | `/api/chat/[leadId]` | Load messages for a specific chat session |
| GET | `/api/documents` | List all documents across leads |
| POST | `/api/documents/upload` | Upload a document file for a lead |
| POST | `/api/documents/[id]/extract` | Trigger AI extraction on a document |
| POST | `/api/analysis/[leadId]` | Generate AI analysis for a lead |

### 5.2 Chat Endpoint Flow

```
Client sends: { leadId?: string, message: string, sessionId: string }

Server:
  1. If leadId exists → fetch lead + conversation history, proceed normally
  2. If no leadId → hold conversation in server memory (keyed by sessionId)
  3. Build OpenAI prompt: system prompt + conversation history + new message
  4. Call GPT-4.1
  5. Parse response: split conversational text from <extracted_data> block
  6. Strip any lead-in text referencing the extraction ("Here's the extracted info:")
  7. If substantive data extracted (name/interest/contact) AND no lead yet → create Lead, persist all pending messages
  8. If lead exists → save messages to DB, update Lead fields
  9. Return: { leadId (or null), message: conversationalText, extractedData? }
```

---

## 6. Edge Cases & Failure Modes

### 6.1 Document Processing Failures

| Failure | Handling |
|---|---|
| **Scanned/image PDF** | pdf-parse returns empty text. Detect this (text length < 100 chars) and display a message: "This appears to be a scanned document. OCR processing is not available in this version." Production would integrate Tesseract or a cloud OCR service. |
| **Encrypted/password-protected PDF** | pdf-parse throws. Catch the error, inform the user, mark document as failed. |
| **Non-PDF upload** | Validate MIME type on upload. Reject non-PDF files with a clear message. |
| **Very large documents** | Limit upload size to 10MB. For text extraction, truncate to first 50,000 characters before sending to GPT-4.1 (context window limit). |
| **Extraction returns garbage** | Validate JSON schema after parsing. If >50% of fields are null, flag for manual review rather than showing potentially bad data. |

### 6.2 Chatbot Edge Cases

| Scenario | Handling |
|---|---|
| **User sends gibberish** | GPT-4.1 handles this gracefully by nature. The prompt instructs it to ask for clarification. |
| **User provides contradictory info** | The prompt instructs GPT-4.1 to gently ask for clarification. The latest extraction overwrites previous values. |
| **User asks off-topic questions** | GPT-4.1 is instructed to be helpful but redirect to insurance topics. |
| **Very long conversations (>20 turns)** | For production, truncate conversation history. Keep only the system prompt, first 2 messages (for context), and last 18 messages. |
| **OpenAI API timeout/error** | Return a friendly "I'm having trouble right now, please try again in a moment" message. Do not save the failed exchange to history. |

### 6.3 System-Level Failures

| Failure | Handling |
|---|---|
| **OpenAI API rate limit** | Implement exponential backoff with max 3 retries. After that, queue the request and notify the user. |
| **Database connection failure** | Prisma connection pooling handles transient failures. Persistent failures show a maintenance page. |
| **Supabase Storage outage** | File upload fails gracefully with retry option. Documents page shows upload error state. |
| **Concurrent lead updates** | Prisma's default optimistic concurrency handles this. Last write wins, which is acceptable for an MVP. |

---

## 7. Security Considerations (Production Roadmap)

### 7.1 Current State (MVP)

- **No authentication** — The dashboard and all API routes are publicly accessible. This is a deliberate MVP trade-off; the system assumes a single broker using it locally or on a private network.
- **API keys server-side only** — OpenAI API keys are stored in `.env.local` and never sent to the client. All LLM calls happen in Next.js API routes.
- **Chat is public** — The `/chat` page is intentionally open (it's the lead-facing interface). The dashboard (`/dashboard/*`) is where auth would be needed.

### 7.2 Production Auth Plan

**Phase 1 — Simple password gate (immediate next step):**
- Next.js middleware checks for an auth cookie on all `/dashboard/*` and `/api/*` routes (excluding `/api/chat`)
- If missing, redirect to `/login` with a single hardcoded broker password
- Cookie set with `httpOnly`, `secure`, `sameSite: strict`, 24-hour expiry
- Takes ~30 minutes to implement. No database changes needed.

**Phase 2 — Multi-user auth (production):**
- Supabase Auth with email/password for broker accounts
- Role-based access: `admin` (full access), `broker` (assigned leads only), `viewer` (read-only)
- Row Level Security (RLS) policies in Supabase to ensure brokers only see their assigned leads
- Magic link or OTP login for leads to view their own status
- Session management via Supabase Auth JWT tokens

**Phase 3 — Enterprise auth:**
- SSO integration (SAML/OIDC) for enterprise broker firms
- Multi-tenant data isolation at the organization level
- API key management for third-party integrations

### 7.3 Other Security Requirements for Production

- **Input Sanitization** — All user inputs sanitized before database storage and before inclusion in LLM prompts (prompt injection prevention)
- **File Validation** — Virus scanning on uploaded documents, strict MIME type validation, file size limits
- **Data Encryption** — PII fields encrypted at rest, SSL in transit (Supabase provides this by default)
- **Audit Logging** — Track all broker actions, document access, and status changes
- **Rate Limiting** — Throttle chat and analysis API endpoints to control LLM costs and prevent abuse
- **CORS** — Restrict API access to known origins in production

---

## 8. Scalability Path

The current monolithic architecture supports SecureLife's scale (45 employees, ~50-100 leads/day) comfortably. If the system needed to scale:

**Short-term (100–500 leads/day):**
- Add background job processing for document extraction (Inngest or BullMQ)
- Implement Redis caching for dashboard queries
- Add Supabase Realtime for live dashboard updates

**Medium-term (500–5,000 leads/day):**
- Extract AI orchestration into separate microservice
- Add a queue (SQS or RabbitMQ) between chat API and AI processing
- Implement OCR service (Google Vision or AWS Textract) for scanned documents
- Add multi-tenant support with organization-level data isolation

**Long-term (5,000+ leads/day):**
- Move to event-driven architecture (Kafka/EventBridge)
- Implement model routing — use GPT-4.1-mini for simple chats, GPT-4.1 for extraction, GPT-4o for complex analyses
- Add fine-tuned models for insurance-specific extraction (reduce cost and latency)
- Horizontal scaling with Kubernetes

---

## 9. What I Would Improve With More Time

1. **WhatsApp Integration** — Connect via the WhatsApp Business API (Twilio) so leads can chat from their phone. The chatbot logic is already channel-agnostic; only the transport layer changes.
2. **OCR Pipeline** — Integrate Tesseract or Google Cloud Vision for scanned PDF support. This would handle the majority of real-world insurance documents.
3. **Real-time Chat** — Replace polling with WebSocket or Server-Sent Events for instant message delivery.
4. **Broker Assignment & Notifications** — Auto-assign leads to brokers based on workload/specialty. Email/Slack notifications for new qualified leads.
5. **Analytics Dashboard** — Conversion rates, average qualification time, document processing success rates, cost per lead.
6. **Multi-language Support** — India has many languages. The chatbot prompt can be extended to detect and respond in the user's preferred language (Hindi, Tamil, etc.).
7. **Testing** — Unit tests for AI output parsing, integration tests for the full pipeline, end-to-end tests for critical user flows.
8. **Prompt Versioning** — Track prompt changes and their impact on output quality. Essential for production LLM systems.
