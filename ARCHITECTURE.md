# Architecture — SecureLife AI Lead Management System

## System Overview

SecureLife AI is a full-stack AI-powered lead management system for insurance brokers. It qualifies leads through conversational AI, extracts structured data from policy documents, and generates comprehensive coverage analysis.

```
+------------------+      +------------------+      +------------------+
|                  |      |                  |      |                  |
|   Landing Page   +----->+   AI Chatbot     +----->+   Lead Created   |
|   (/)            |      |   (/chat)        |      |   in Database    |
|                  |      |                  |      |                  |
+------------------+      +--------+---------+      +--------+---------+
                                   |                         |
                                   |  Extracts data          |
                                   |  from conversation      |
                                   v                         v
                          +--------+---------+      +--------+---------+
                          |                  |      |                  |
                          |   Dashboard      |      |   Lead Detail    |
                          |   (/dashboard)   +----->+   (/leads/[id])  |
                          |                  |      |                  |
                          +------------------+      +--------+---------+
                                                             |
                                              +--------------+--------------+
                                              |                             |
                                    +---------v---------+         +---------v---------+
                                    |                   |         |                   |
                                    |  Document Upload  |         |  AI Analysis      |
                                    |  + PDF Extraction |         |  Generation       |
                                    |                   |         |                   |
                                    +-------------------+         +-------------------+
```

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety |
| Database | Supabase (PostgreSQL) | Managed Postgres with session pooling |
| ORM | Prisma v7 | Type-safe database access |
| AI/LLM | OpenAI GPT-4.1 | Chatbot, document extraction, analysis |
| PDF Parsing | pdf-parse v2 | Extract text from uploaded PDFs |
| Styling | Tailwind CSS v4 + shadcn/ui | Component library + utility CSS |
| Fonts | Plus Jakarta Sans + DM Sans | Heading + body typography |
| Markdown | react-markdown + remark-gfm | Render AI responses as formatted markdown |
| Deployment | Vercel | Zero-config Next.js hosting |

## Database Schema (ER Diagram)

```
┌──────────────┐       ┌──────────────┐
│     Lead     │       │   Message    │
├──────────────┤       ├──────────────┤
│ id (PK)      │──┐    │ id (PK)      │
│ name         │  │    │ leadId (FK)  │──┐
│ email        │  │    │ role         │  │
│ phone        │  │    │ content      │  │
│ age          │  │    │ metadata     │  │
│ city         │  ├───<│ createdAt    │  │
│ occupation   │  │    └──────────────┘  │
│ status       │  │                      │
│ qual.Score   │  │    ┌──────────────┐  │
│ monthlyBudget│  │    │  Document    │  │
│ existPolicies│  │    ├──────────────┤  │
│ primaryInt.  │  │    │ id (PK)      │  │
│ urgency      │  ├───<│ leadId (FK)  │──┘
│ source       │  │    │ fileName     │
│ createdAt    │  │    │ fileUrl      │
│ updatedAt    │  │    │ rawText      │
└──────────────┘  │    │ extractedData│
                  │    │ documentType │
                  │    │ policyNumber │
                  │    │ provider     │
                  │    │ coverageAmt  │
                  │    │ premiumAmt   │
                  │    │ processStat. │
                  │    │ createdAt    │
                  │    └──────────────┘
                  │
                  │    ┌──────────────┐
                  │    │  Analysis    │
                  │    ├──────────────┤
                  └───<│ id (PK)      │
                       │ leadId (FK)  │ (unique)
                       │ summary      │
                       │ coverageGaps │
                       │ potSavings   │
                       │ riskFlags    │
                       │ recommend.   │
                       │ overallScore │
                       │ createdAt    │
                       └──────────────┘
```

**Relations:**
- Lead 1 → N Messages (cascade delete)
- Lead 1 → N Documents (cascade delete)
- Lead 1 → 1 Analysis (cascade delete)

## Project Structure

```
securelife-ai/
├── prisma/
│   └── schema.prisma              # Database schema with enums
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, toaster)
│   │   ├── page.tsx               # Landing page
│   │   ├── chat/
│   │   │   └── page.tsx           # Chatbot interface page
│   │   ├── dashboard/
│   │   │   ├── page.tsx           # Pipeline kanban board
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx       # Leads table with search/filter
│   │   │   │   └── [id]/page.tsx  # Lead detail (info, docs, analysis)
│   │   │   └── documents/
│   │   │       └── page.tsx       # All documents table
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── route.ts       # POST: send message, get AI response
│   │       │   ├── history/
│   │       │   │   └── route.ts   # GET: list chat sessions
│   │       │   └── [leadId]/
│   │       │       └── route.ts   # GET: load messages for a session
│   │       ├── leads/
│   │       │   ├── route.ts       # GET: list all leads
│   │       │   └── [id]/
│   │       │       └── route.ts   # GET/PATCH/DELETE single lead
│   │       ├── documents/
│   │       │   ├── route.ts       # GET: list all documents
│   │       │   ├── upload/
│   │       │   │   └── route.ts   # POST: upload PDF
│   │       │   └── [id]/extract/
│   │       │       └── route.ts   # POST: AI extraction
│   │       └── analysis/
│   │           └── [leadId]/
│   │               └── route.ts   # GET/POST: generate/fetch analysis
│   ├── components/
│   │   ├── ui/                    # shadcn/ui primitives
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx  # Main chat with history sidebar
│   │   │   ├── MessageBubble.tsx  # User/assistant message bubbles
│   │   │   └── StreamingMarkdown.tsx # Markdown renderer for AI
│   │   └── dashboard/
│   │       ├── Sidebar.tsx        # App navigation sidebar
│   │       ├── PipelineBoard.tsx  # Kanban board by status
│   │       ├── LeadCard.tsx       # Lead card in pipeline
│   │       ├── StatusBadge.tsx    # Color-coded status badges
│   │       ├── DocumentUpload.tsx # Upload + extraction UI
│   │       └── AnalysisPanel.tsx  # AI analysis display
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── chatbot.ts        # Chatbot system prompt + OpenAI call
│   │   │   ├── extractor.ts      # Document extraction prompt + call
│   │   │   └── analyzer.ts       # Coverage analysis prompt + call
│   │   ├── pdf/
│   │   │   └── parser.ts         # PDF text extraction via pdf-parse
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── utils.ts              # shadcn utility (cn)
│   └── types/
│       └── index.ts              # Shared TypeScript types
├── uploads/                       # Uploaded PDFs (local storage for MVP)
├── .env.local                     # DATABASE_URL, OPENAI_API_KEY
└── ARCHITECTURE.md                # This file
```

## AI Pipeline

### 1. Chatbot — Lead Qualification

**Model:** OpenAI GPT-4.1
**Prompt strategy:** Conversational advisor that bundles 2-4 questions per message for efficient data collection (target: qualify in 2-3 exchanges).

```
User message
    ↓
Build conversation history from DB
    ↓
Send to GPT-4.1 with system prompt
    ↓
Parse response: split conversational text from <extracted_data> JSON block
    ↓
Strip internal data from user-facing reply
    ↓
Update Lead record with extracted fields (name, email, score, etc.)
    ↓
Return clean reply to frontend
```

**Lead creation logic:**
- First few messages (greetings) → no lead created, conversation held in server memory
- Once substantive data is extracted (name, interest, email, or phone) → Lead created, all pending messages persisted to DB
- Subsequent messages → Lead updated incrementally

**Insurance categories guided by chatbot:**
Health, Life, Vehicle, Home, Travel

### 2. Document Extractor

**Model:** OpenAI GPT-4.1

```
PDF upload → save to /uploads/
    ↓
pdf-parse extracts raw text
    ↓
If text < 50 chars → fail (likely scanned PDF)
    ↓
Send text to GPT-4.1 with extraction prompt
    ↓
Parse JSON response (with retry on failure)
    ↓
Store structured fields: policy number, provider, coverage, premium, dates, exclusions, benefits
    ↓
Update Document record + Lead status → DOCUMENTS_UPLOADED
```

### 3. Analysis Engine

**Model:** OpenAI GPT-4.1

```
Aggregate: Lead profile + all extracted document data
    ↓
Send to GPT-4.1 with analyst prompt
    ↓
Parse JSON response containing:
  - Summary (2-3 paragraphs)
  - Coverage gaps (with severity: low/medium/high/critical)
  - Potential savings (with ₹ estimates)
  - Risk flags (with severity)
  - Recommendations (with priority: immediate/short-term/long-term)
  - Overall insurance health score (0-100)
    ↓
Upsert Analysis record + Lead status → ANALYSIS_READY
```

## Lead Lifecycle

```
NEW → QUALIFYING → QUALIFIED → DOCUMENTS_PENDING → DOCUMENTS_UPLOADED → ANALYSIS_READY → REVIEWED → CLOSED_WON / CLOSED_LOST
```

| Status | Trigger |
|---|---|
| NEW | Lead created from chatbot |
| QUALIFYING | AI begins extracting data from conversation |
| QUALIFIED | Sufficient info collected (score > 60) |
| DOCUMENTS_PENDING | AI suggests document upload |
| DOCUMENTS_UPLOADED | At least one document extracted successfully |
| ANALYSIS_READY | AI analysis generated |
| REVIEWED | Broker manually reviews |
| CLOSED_WON / CLOSED_LOST | Broker marks outcome |

## API Routes

| Method | Route | Purpose |
|---|---|---|
| POST | /api/chat | Send message, get AI response |
| GET | /api/chat/history | List all chat sessions |
| GET | /api/chat/[leadId] | Load messages for a session |
| GET | /api/leads | List all leads with relations |
| GET | /api/leads/[id] | Get single lead with all data |
| PATCH | /api/leads/[id] | Update lead fields/status |
| DELETE | /api/leads/[id] | Delete lead (cascades) |
| GET | /api/documents | List all documents |
| POST | /api/documents/upload | Upload PDF file |
| POST | /api/documents/[id]/extract | Trigger AI extraction |
| GET | /api/analysis/[leadId] | Get analysis for a lead |
| POST | /api/analysis/[leadId] | Generate/regenerate analysis |

## Frontend Pages

| Route | Component | Description |
|---|---|---|
| / | Landing page | Hero, features, how-it-works, CTA |
| /chat | ChatInterface | AI chatbot with history sidebar |
| /dashboard | PipelineBoard | Kanban board + stats cards |
| /dashboard/leads | Leads table | Searchable/filterable list |
| /dashboard/leads/[id] | Lead detail | Info, conversation, documents, analysis tabs |
| /dashboard/documents | Documents table | All uploaded documents across leads |

## Key Design Decisions

1. **Deferred lead creation** — Leads are only created when the AI extracts substantive data (name/interest/contact), not on first message. Prevents empty leads from casual greetings.

2. **Server-side conversation memory** — Pre-lead conversations are held in a `Map` on the server. Once a lead is created, all messages are bulk-inserted to the DB.

3. **Chat persistence** — `leadId` and `sessionId` stored in localStorage. On page reload, messages are fetched from the API to restore the conversation.

4. **Cascading deletes** — All Prisma relations use `onDelete: Cascade`. Deleting a lead removes its messages, documents, and analysis.

5. **Defensive AI parsing** — All AI responses are parsed with try/catch, JSON extraction handles markdown code blocks, and extraction retries once on failure.

6. **Local file storage** — PDFs are stored in `/uploads/` for MVP simplicity instead of Supabase Storage.

7. **Prisma v7 + pg adapter** — Uses `@prisma/adapter-pg` for direct PostgreSQL connections via Supabase session pooler.
