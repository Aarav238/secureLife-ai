# SecureLife AI - Application Documentation

An AI-powered insurance lead management platform built with Next.js 16, OpenAI GPT-4.1, Prisma, and Supabase.

---

## Tech Stack


| Layer            | Technology                                                          |
| ---------------- | ------------------------------------------------------------------- |
| Framework        | Next.js 16.2.1 (Turbopack)                                          |
| Language         | TypeScript 5                                                        |
| Database         | PostgreSQL via Supabase                                             |
| ORM              | Prisma 7.6 with `@prisma/adapter-pg`                                |
| AI               | OpenAI GPT-4.1                                                      |
| Auth             | Supabase Auth (email/password) via `@supabase/ssr`                  |
| File Storage     | Supabase Storage                                                    |
| PDF Parsing      | pdf-parse 2.4.5 (pdfjs-dist 5.x)                                    |
| UI Components    | shadcn/ui (base-nova style) with `@base-ui/react`                   |
| Styling          | Tailwind CSS v4, CSS variables (OKLCH)                              |
| State Management | React hooks, SWR for data fetching                                  |
| Fonts            | Plus Jakarta Sans (headings), DM Sans (body), JetBrains Mono (code) |


---

## Directory Structure

```
securelife-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analysis/[leadId]/route.ts     # Generate & fetch AI analysis
│   │   │   ├── auth/logout/route.ts           # Logout endpoint
│   │   │   ├── chat/
│   │   │   │   ├── route.ts                    # Main chat endpoint
│   │   │   │   ├── [leadId]/route.ts           # Load messages for a lead
│   │   │   │   └── history/route.ts            # List all chat sessions
│   │   │   ├── documents/
│   │   │   │   ├── route.ts                    # List all documents
│   │   │   │   ├── upload/route.ts             # Upload PDF to Supabase
│   │   │   │   └── [id]/extract/route.ts       # AI-powered PDF extraction
│   │   │   └── leads/
│   │   │       ├── route.ts                    # List all leads
│   │   │       └── [id]/route.ts               # Get, update, delete a lead
│   │   ├── chat/page.tsx                       # AI chatbot interface (public)
│   │   ├── login/
│   │   │   ├── page.tsx                        # Login/signup page
│   │   │   └── actions.ts                      # Server actions: login, signup, logout
│   │   ├── dashboard/
│   │   │   ├── page.tsx                        # Pipeline Kanban board (protected)
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx                    # Leads table with filters
│   │   │   │   └── [id]/page.tsx               # Lead detail (tabs: info, chat, docs, analysis)
│   │   │   └── documents/page.tsx              # All documents listing
│   │   ├── layout.tsx                          # Root layout with fonts & theme
│   │   ├── page.tsx                            # Landing page
│   │   └── globals.css                         # Tailwind theme & CSS variables
│   ├── components/
│   │   ├── AuthNavLinks.tsx                    # Auth-aware nav (shows Dashboard or Login)
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx               # Chat UI with session history
│   │   │   ├── MessageBubble.tsx               # Message display component
│   │   │   └── StreamingMarkdown.tsx           # Markdown renderer with syntax highlighting
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx                     # Navigation sidebar with user email + logout
│   │   │   ├── PipelineBoard.tsx               # Kanban board by lead status
│   │   │   ├── LeadCard.tsx                    # Lead card in pipeline columns
│   │   │   ├── DocumentUpload.tsx              # Upload, extract, view extraction details
│   │   │   ├── AnalysisPanel.tsx               # Coverage analysis display
│   │   │   └── StatusBadge.tsx                 # Colored status indicator
│   │   └── ui/                                 # shadcn/ui primitives
│   │       ├── button.tsx, card.tsx, badge.tsx, dialog.tsx
│   │       ├── input.tsx, select.tsx, textarea.tsx, tabs.tsx
│   │       ├── table.tsx, scroll-area.tsx, separator.tsx
│   │       ├── avatar.tsx, tooltip.tsx, sheet.tsx, progress.tsx
│   │       ├── dropdown-menu.tsx, sonner.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── chatbot.ts                      # GPT-4.1 conversation + lead extraction
│   │   │   ├── extractor.ts                    # PDF structured data extraction
│   │   │   └── analyzer.ts                     # Coverage gap analysis
│   │   ├── pdf/
│   │   │   └── parser.ts                       # PDF text extraction via pdf-parse
│   │   ├── supabase/
│   │   │   ├── server.ts                       # Server-side Supabase client (cookie sessions)
│   │   │   └── client.ts                       # Browser-side Supabase client
│   │   ├── prisma.ts                           # Prisma client singleton
│   │   ├── supabase.ts                         # Supabase admin client (service role)
│   │   └── utils.ts                            # cn() utility (clsx + tailwind-merge)
│   ├── types/
│   │   └── index.ts                            # Shared TypeScript types
│   └── proxy.ts                                # Auth guard (Next.js 16 proxy/middleware)
├── prisma/
│   ├── schema.prisma                           # Database models & enums
│   └── migrations/                             # Migration history
├── prisma.config.ts                            # Prisma adapter config
├── next.config.ts                              # serverExternalPackages for pdf-parse
├── components.json                             # shadcn/ui config
├── tsconfig.json                               # TypeScript config
└── package.json                                # Dependencies & scripts
```

---

## Database Schema

### Enums

**LeadStatus:** `NEW` → `QUALIFYING` → `QUALIFIED` → `DOCUMENTS_PENDING` → `DOCUMENTS_UPLOADED` → `ANALYSIS_READY` → `REVIEWED` → `CLOSED_WON` / `CLOSED_LOST`

**DocumentType:** `HEALTH_INSURANCE`, `LIFE_INSURANCE`, `VEHICLE_INSURANCE`, `HOME_INSURANCE`, `TRAVEL_INSURANCE`, `OTHER`

### Models

#### Lead


| Field              | Type          | Description                          |
| ------------------ | ------------- | ------------------------------------ |
| id                 | String (cuid) | Primary key                          |
| name, email, phone | String?       | Contact info                         |
| age                | Int?          | Age                                  |
| city, occupation   | String?       | Demographics                         |
| status             | LeadStatus    | Pipeline stage (default: NEW)        |
| qualificationScore | Int?          | AI-assigned score 0-100              |
| monthlyBudget      | Float?        | Insurance budget                     |
| existingPolicies   | Int?          | Number of current policies           |
| primaryInterest    | String?       | Insurance type they're interested in |
| urgency            | String?       | How soon they need coverage          |
| source             | String?       | "chatbot" or other                   |
| assignedBroker     | String?       | Broker name                          |
| notes              | String?       | Manual notes                         |
| conversations      | Message[]     | Chat messages                        |
| documents          | Document[]    | Uploaded files                       |
| analysis           | Analysis?     | AI coverage analysis (1:1)           |


#### Message


| Field    | Type          | Description                     |
| -------- | ------------- | ------------------------------- |
| id       | String (cuid) | Primary key                     |
| leadId   | String        | FK → Lead                       |
| role     | String        | "user" or "assistant"           |
| content  | String        | Message text                    |
| metadata | Json?         | Extracted data from AI response |


#### Document


| Field                           | Type          | Description                               |
| ------------------------------- | ------------- | ----------------------------------------- |
| id                              | String (cuid) | Primary key                               |
| leadId                          | String        | FK → Lead                                 |
| fileName                        | String        | Original filename                         |
| fileUrl                         | String        | Supabase Storage URL                      |
| fileSize                        | Int?          | File size in bytes                        |
| mimeType                        | String?       | MIME type                                 |
| rawText                         | String?       | Extracted PDF text                        |
| extractedData                   | Json?         | Full AI extraction response               |
| documentType                    | DocumentType? | Insurance type enum                       |
| insuredName                     | String?       | Policy holder name                        |
| policyNumber                    | String?       | Policy number                             |
| provider                        | String?       | Insurance provider                        |
| policyType                      | String?       | Specific policy type                      |
| coverageAmount                  | Float?        | Coverage amount                           |
| premiumAmount                   | Float?        | Premium amount                            |
| premiumFrequency                | String?       | monthly / quarterly / yearly              |
| startDate, endDate, renewalDate | DateTime?     | Policy dates                              |
| exclusions                      | Json?         | Array of exclusion strings                |
| benefits                        | Json?         | Array of benefit strings                  |
| nominees                        | Json?         | Array of nominee names                    |
| processingStatus                | String        | pending / processing / completed / failed |
| processingError                 | String?       | Error message if failed                   |


#### Analysis


| Field            | Type            | Description                                |
| ---------------- | --------------- | ------------------------------------------ |
| id               | String (cuid)   | Primary key                                |
| leadId           | String (unique) | FK → Lead (1:1)                            |
| summary          | String          | 2-3 paragraph assessment                   |
| coverageGaps     | Json            | `[{ area, description, severity }]`        |
| potentialSavings | Json            | `[{ area, estimatedSaving, description }]` |
| riskFlags        | Json            | `[{ flag, severity, description }]`        |
| recommendations  | Json            | `[{ action, priority, rationale }]`        |
| overallScore     | Int?            | Insurance health score (0-100)             |
| rawResponse      | String?         | Full AI response text                      |


---

## API Routes

### Auth


| Method | Endpoint           | Purpose                        |
| ------ | ------------------ | ------------------------------ |
| `POST` | `/api/auth/logout` | Sign out and redirect to login |


### Chat


| Method | Endpoint             | Purpose                                          |
| ------ | -------------------- | ------------------------------------------------ |
| `POST` | `/api/chat`          | Send message, get AI response, auto-create leads |
| `GET`  | `/api/chat/[leadId]` | Load full conversation for a lead                |
| `GET`  | `/api/chat/history`  | List all chatbot-created sessions (sidebar)      |


### Documents


| Method | Endpoint                      | Purpose                                                 |
| ------ | ----------------------------- | ------------------------------------------------------- |
| `GET`  | `/api/documents`              | List all documents with lead info                       |
| `POST` | `/api/documents/upload`       | Upload PDF (FormData: file + leadId) → Supabase Storage |
| `POST` | `/api/documents/[id]/extract` | Download PDF → extract text → AI structuring → save     |


### Leads


| Method   | Endpoint          | Purpose                                            |
| -------- | ----------------- | -------------------------------------------------- |
| `GET`    | `/api/leads`      | List all leads with summary data                   |
| `GET`    | `/api/leads/[id]` | Full lead detail (conversations, docs, analysis)   |
| `PATCH`  | `/api/leads/[id]` | Update lead fields (status, notes, etc.)           |
| `DELETE` | `/api/leads/[id]` | Delete lead (cascades to messages, docs, analysis) |


### Analysis


| Method | Endpoint                 | Purpose                                    |
| ------ | ------------------------ | ------------------------------------------ |
| `POST` | `/api/analysis/[leadId]` | Generate AI analysis from lead + documents |
| `GET`  | `/api/analysis/[leadId]` | Fetch stored analysis                      |


---

## Authentication

Broker-side authentication is handled by **Supabase Auth** with email/password login via the `@supabase/ssr` package.

### Architecture


| File                                   | Purpose                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------- |
| `src/proxy.ts`                         | Route-level auth guard (Next.js 16 proxy, replaces middleware)                        |
| `src/lib/supabase/server.ts`           | Server-side Supabase client (uses cookies for session)                                |
| `src/lib/supabase/client.ts`           | Browser-side Supabase client                                                          |
| `src/app/login/page.tsx`               | Login page wrapper with Suspense                                                      |
| `src/app/login/login-form.tsx`         | Login/signup form component                                                           |
| `src/app/login/actions.ts`             | Server actions for login, signup, logout                                              |
| `src/app/api/auth/logout/route.ts`     | Logout API route (used by sidebar form)                                               |
| `src/components/AuthNavLinks.tsx`      | Auth-aware nav links (shows "Dashboard" + avatar if logged in, "Broker Login" if not) |
| `src/components/dashboard/Sidebar.tsx` | Shows logged-in user email, avatar initial, and logout button                         |


> **Note:** Next.js 16 renamed `middleware.ts` to `proxy.ts` and the exported function from `middleware()` to `proxy()`. The functionality is identical.

### Route Protection


| Route               | Auth?                                        | Why                                      |
| ------------------- | -------------------------------------------- | ---------------------------------------- |
| `/`                 | Public                                       | Landing page                             |
| `/chat`             | Public                                       | Lead-facing chatbot                      |
| `/login`            | Public (redirects to dashboard if logged in) | Broker login                             |
| `/dashboard/`**     | Protected                                    | Redirects to `/login` if unauthenticated |
| `/api/chat/**`      | Public                                       | Chatbot needs this                       |
| `/api/leads/**`     | Protected                                    | Returns 401 if unauthenticated           |
| `/api/documents/**` | Protected                                    | Returns 401 if unauthenticated           |
| `/api/analysis/**`  | Protected                                    | Returns 401 if unauthenticated           |


### How It Works

1. **Proxy** (`src/proxy.ts`) runs on every matched route, refreshing the Supabase session cookie
2. If the user is not authenticated and hits a protected page → redirect to `/login?redirect=/original-path`
3. If the user is not authenticated and hits a protected API → return `{ error: "Unauthorized" }` with 401
4. If the user is authenticated and hits `/login` → redirect to `/dashboard`
5. **Logout** is a form POST to `/api/auth/logout` which clears the session and redirects to `/login`

### Supabase Setup Required

1. Go to your Supabase project dashboard → **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Copy your **anon/public key** from **Settings** → **API** → `anon` `public` key
4. Add it to `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Create a broker user via the Supabase dashboard (**Authentication** → **Users** → **Add User**) or use the signup form

---

## AI Integration

All AI calls use **OpenAI GPT-4.1** via the `openai` SDK.

### 1. Chatbot (`src/lib/ai/chatbot.ts`)

**Purpose:** Natural conversational lead qualification.

**How it works:**

- System prompt defines an insurance advisor persona
- AI asks 2-4 bundled questions per response (not one-at-a-time)
- Uses `response_format: { type: "json_object" }` — AI returns a JSON object with `reply` (message text) and `extractedData` (collected fields)
- Extracted fields: name, email, phone, age, city, occupation, primaryInterest, existingPolicies, monthlyBudget, urgency, qualificationScore, statusUpdate
- Lead is auto-created in DB once substantive data (name or interest) is captured
- Pre-lead messages are sent from the frontend as `pendingHistory` (stateless — no server-side memory map)

**Completion check:** The AI tracks 10 required fields (name, city, age, occupation, primaryInterest, existingPolicies, monthlyBudget, email, phone, urgency) via a `missingFields` array in the extracted data. It will **not** wrap up or give final recommendations until all fields are collected — instead it naturally weaves missing questions into the conversation. If a user dodges a question, the AI tries once more with a different angle before moving on.

**Lead state injection:** On every message, the chat route reads the current lead record from the database and injects it into the system prompt as a "CURRENT LEAD STATE" block. This tells the AI exactly which fields are already collected (with their values) and which are still missing — so it doesn't have to guess from conversation text. This ensures the AI always asks for the right things, even if the conversation is long or fields were partially captured.

**Progressive data storage:** After every single message exchange, `buildUpdateData()` extracts only the non-null fields from the AI response and runs `prisma.lead.update()` to merge them into the existing record. Existing fields stay untouched — the lead profile grows incrementally with each message.

### 2. Document Extractor (`src/lib/ai/extractor.ts`)

**Purpose:** Structure unstructured PDF text into typed insurance data.

**Extracted fields:**

- documentType, policyNumber, provider, policyType
- insuredName, coverageAmount, premiumAmount, premiumFrequency
- startDate, endDate, renewalDate
- exclusions (array), benefits (array), deductible, nominees (array)
- additionalNotes

**Resilience:** If JSON parsing fails on first attempt, retries with a stricter prompt.

### 3. Coverage Analyzer (`src/lib/ai/analyzer.ts`)

**Purpose:** Generate actionable insurance analysis from lead profile + documents.

**Input:** Lead demographics + all extracted document data.

**Output:**

- **Summary:** 2-3 paragraph assessment of coverage posture
- **Coverage Gaps:** Areas where coverage is missing/insufficient (`severity: low|medium|high|critical`)
- **Potential Savings:** Cost optimization opportunities with estimated amounts in INR
- **Risk Flags:** Concerns about current coverage (`severity: low|medium|high|critical`)
- **Recommendations:** Prioritized actions (`priority: immediate|short-term|long-term`)
- **Overall Score:** 0-100 insurance health score

---

## End-to-End Flows

### Flow 1: Chatbot Lead Qualification

```
User visits /chat (public)
  └→ ChatInterface loads, shows greeting
      └→ User types message
          └→ POST /api/chat { message }
              └→ GPT-4.1 responds naturally + extracts data
              └→ Lead state injected into prompt (what's filled vs missing)
                  └→ If name or interest found: CREATE Lead in DB
                      └→ Save all messages to DB
                          └→ Return { leadId, message, extractedData }
                              └→ Client stores leadId in localStorage
                                  └→ Lead appears on /dashboard pipeline (status: NEW)
```

### Flow 2: Document Upload & Extraction

```
Broker logs in → /dashboard/leads/[id] → Documents tab
  └→ Click "Upload" → Select PDF file
      └→ POST /api/documents/upload { file, leadId }
          └→ File saved to Supabase Storage
              └→ Document record created (status: pending)
                  └→ Click "Extract with AI"
                      └→ POST /api/documents/[id]/extract
                          └→ Download from Supabase → pdf-parse → raw text
                              └→ GPT-4.1 extracts structured JSON
                                  └→ Save to Document fields + extractedData blob
                                      └→ Lead status → DOCUMENTS_UPLOADED
                                          └→ "View all extracted data" opens detail dialog
```

### Flow 3: AI Coverage Analysis

```
Broker on lead detail → Analysis tab
  └→ Click "Generate Analysis"
      └→ POST /api/analysis/[leadId]
          └→ Fetch lead profile + all completed documents
              └→ Compile context for GPT-4.1
                  └→ AI returns structured analysis JSON
                      └→ Upsert Analysis record
                          └→ Lead status → ANALYSIS_READY
                              └→ UI shows: summary, gaps, savings, risks, recommendations, score
```

### Lead Lifecycle

```
NEW → QUALIFYING → QUALIFIED → DOCUMENTS_PENDING → DOCUMENTS_UPLOADED → ANALYSIS_READY → REVIEWED → CLOSED_WON / CLOSED_LOST
```


| Stage               | Trigger                                                       |
| ------------------- | ------------------------------------------------------------- |
| NEW                 | Lead auto-created from chatbot                                |
| QUALIFYING          | AI detects partial data                                       |
| QUALIFIED           | AI assigns high qualification score / all 10 fields collected |
| DOCUMENTS_UPLOADED  | Document extraction completes                                 |
| ANALYSIS_READY      | AI analysis generated                                         |
| REVIEWED / CLOSED_* | Broker manually updates status                                |


---

## Scoring System

Both scores are **AI-determined by GPT-4.1** — there is no hardcoded algorithm in the codebase. The AI assigns scores based on prompt-defined criteria.

### 1. Qualification Score (0-100) — Chatbot

Assigned by the chatbot AI after each message exchange, based on how much information the lead has shared. The system prompt defines a **5-factor rubric**, each worth up to 20 points:


| Factor                      | Points | What triggers it                                                        |
| --------------------------- | ------ | ----------------------------------------------------------------------- |
| Budget clarity              | +20    | Lead mentions a monthly budget or price range                           |
| Specific need               | +20    | Lead identifies a specific insurance type (health, life, vehicle, etc.) |
| Existing policies to review | +20    | Lead mentions having current policies or documents to upload            |
| Contact info provided       | +20    | Lead shares name, email, phone, or city                                 |
| Urgency                     | +20    | Lead indicates how soon they need coverage                              |


**Examples:**

- "I need insurance" → ~10 (vague interest only)
- "I need health insurance, budget ~₹2k/month" → ~40 (specific need + budget)
- "I'm Rahul from Mumbai, 28, looking for health insurance, budget ₹2k, have an existing LIC policy" → ~80-100

The score is extracted from a hidden `<extracted_data>` JSON block in each AI response and saved to `Lead.qualificationScore`.

### 2. Overall Insurance Health Score (0-100) — Analysis

Assigned by the analyzer AI when generating a coverage analysis. This score represents **how well-covered the client currently is** based on their uploaded documents and profile.

The prompt does **not** define an explicit rubric — GPT-4.1 determines the score holistically from:

- **Coverage completeness:** Are all major risk areas covered (health, life, assets)?
- **Coverage adequacy:** Are sum insured amounts sufficient for the client's profile?
- **Coverage gaps:** Number and severity of identified gaps (critical gaps lower the score significantly)
- **Risk flags:** Issues like policy lapses, inadequate nominees, or exclusion concerns
- **Document quality:** How much extractable, verifiable data exists

**Rough interpretation:**

- **80-100:** Well-covered, minor optimizations possible
- **60-79:** Decent coverage, some notable gaps
- **40-59:** Significant gaps or inadequate coverage
- **0-39:** Critically under-insured

The score is saved to `Analysis.overallScore` and displayed on the lead detail page.

---

## Frontend Pages


| Route                   | Auth      | Description                                                        |
| ----------------------- | --------- | ------------------------------------------------------------------ |
| `/`                     | Public    | Landing page with hero, features, how-it-works, CTA                |
| `/chat`                 | Public    | AI chatbot interface for lead qualification                        |
| `/login`                | Public    | Broker login/signup (redirects to dashboard if authenticated)      |
| `/dashboard`            | Protected | Kanban pipeline board with stats cards                             |
| `/dashboard/leads`      | Protected | Filterable/searchable leads table                                  |
| `/dashboard/leads/[id]` | Protected | Lead detail with tabs: overview, conversation, documents, analysis |
| `/dashboard/documents`  | Protected | Global view of all uploaded documents                              |


---

## Design System

### Colors

- **Primary:** Indigo-600 (buttons, links, active states)
- **Background:** White / Slate-50 (dashboard), Slate-950 (landing, login)
- **Text:** Slate-800 (primary), Slate-500 (secondary)
- **Status colors:** Amber (pending), Blue (processing), Emerald (completed/success), Red (failed/error)
- **Sidebar:** Slate-950 (dark)

### Typography

- **Headings:** Plus Jakarta Sans — geometric, modern (500-800 weight)
- **Body:** DM Sans — clean, readable (400-700 weight)
- **Code:** JetBrains Mono (400-500 weight)

### Component Patterns

- Rounded-xl cards with subtle borders and shadows
- Dot + text status badges
- SVG file type icons with color-coded extension labels
- Drag-and-drop upload zone with progress animation
- Scrollable detail dialogs with organized sections
- Gradient orb backgrounds on dark pages (landing, login)

---

## Environment Variables


| Variable                        | Required | Description                                            |
| ------------------------------- | -------- | ------------------------------------------------------ |
| `DATABASE_URL`                  | Yes      | Supabase PostgreSQL connection string (Session Pooler) |
| `OPENAI_API_KEY`                | Yes      | OpenAI API key for GPT-4.1                             |
| `NEXT_PUBLIC_SUPABASE_URL`      | Yes      | Supabase project URL                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes      | Supabase anon/public key (for auth & client-side)      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Yes      | Supabase service role key (server-side file ops)       |
| `NEXT_PUBLIC_APP_URL`           | No       | App base URL (defaults to localhost:3000)              |


---

## Scripts

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # prisma generate && next build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## Deployment Notes

- **Build command** runs `prisma generate` before `next build` to ensure the Prisma client is generated on Vercel
- `**serverExternalPackages`** in `next.config.ts` prevents Turbopack from bundling `pdf-parse` and `pdfjs-dist` (they need Node.js native modules)
- **Supabase Storage** requires a public bucket named `documents` for file uploads
- **Prisma** connects via `@prisma/adapter-pg` using the Supabase connection pooler URL
- **Next.js 16** uses `proxy.ts` instead of `middleware.ts` — the file must export a named `proxy()` function, not `middleware()`
- **Environment variables** must include `NEXT_PUBLIC_SUPABASE_ANON_KEY` for auth to work in production

