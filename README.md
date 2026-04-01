# SecureLife AI — Insurance Lead Management System

AI-powered lead management platform for insurance brokers. Qualifies leads through conversational AI, extracts policy data from documents, and generates comprehensive coverage analysis.

## Features

- **AI Chatbot** — Conversational lead qualification using GPT-4.1. Tracks 10 required fields (name, city, age, occupation, interest, existing policies, budget, email, phone, urgency) and progressively collects them across 2-4 natural exchanges. Lead data is stored incrementally after every message.
- **Pipeline Dashboard** — Kanban board tracking leads through: New → Qualifying → Qualified → Docs Pending → Docs Uploaded → Analysis Ready → Reviewed → Won/Lost
- **Document Intelligence** — Upload insurance PDFs to Supabase Storage, extract structured data (policy number, provider, coverage, premium, exclusions, benefits, nominees) via AI
- **Smart Analysis** — AI-generated coverage gap analysis, potential savings, risk flags, and prioritized recommendations with an overall insurance health score (0-100)
- **Broker Auth** — Supabase Auth (email/password) protects the dashboard and sensitive APIs. Chat stays public for leads
- **Chat History** — Persistent conversations with session switching, stored in database
- **Markdown Rendering** — AI responses rendered with proper formatting, code highlighting, tables

## Tech Stack

- **Framework:** Next.js 16.2.1 (Turbopack) + TypeScript
- **Database:** Supabase (PostgreSQL) via Prisma v7 with `@prisma/adapter-pg`
- **Auth:** Supabase Auth via `@supabase/ssr`
- **File Storage:** Supabase Storage
- **AI:** OpenAI GPT-4.1 (chatbot, document extraction, coverage analysis)
- **PDF Parsing:** pdf-parse 2.4.5
- **UI:** Tailwind CSS v4 + shadcn/ui (base-nova style)
- **Fonts:** Plus Jakarta Sans + DM Sans + JetBrains Mono

## Setup

### Prerequisites

- Node.js 18+
- Supabase project (free tier works)
- OpenAI API key

### Installation

```bash
git clone <repo-url>
cd securelife-ai
npm install
```

### Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string** → copy the **Session Pooler** URL
3. Go to **Settings → API** → copy the **Project URL**, **anon public key**, and **service_role key**
4. Go to **Storage** → click **New Bucket** → name it `documents` → set it to **Public**
5. Go to **Authentication → Providers** → ensure **Email** is enabled
6. Create a broker user via **Authentication → Users → Add User**, or use the signup form at `/login`

### Environment Variables

Create `.env.local` in the project root:

```env
# Database — Supabase Session Pooler connection string
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

| Variable | Where to Find | Purpose |
|---|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Session Pooler | PostgreSQL connection via Prisma |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | GPT-4.1 for chatbot, extraction, analysis |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Supabase client initialization |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key | Client-side auth & session management |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (secret) | Server-side file uploads to Supabase Storage |
| `NEXT_PUBLIC_APP_URL` | Your deployment URL | App base URL |

### Database Setup

```bash
npx prisma db push
npx prisma generate
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. **Lead visits** `/chat` → talks to the AI advisor about insurance needs
2. **AI collects info** progressively — name, city, age, interest, budget, etc. across 2-4 exchanges
3. **Lead auto-created** in the database once substantive data (name or interest) is captured
4. **Broker logs in** at `/login` → sees the lead on the `/dashboard` pipeline
5. **Uploads policy PDFs** in the lead's Documents tab
6. **Extracts data** with AI → policy number, coverage, premiums, benefits, exclusions, nominees
7. **Generates analysis** → coverage gaps, risk flags, savings, recommendations, health score
8. **Updates status** → marks lead as Reviewed, Won, or Lost

## Pages

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page with features, how-it-works, CTA |
| `/chat` | Public | AI chatbot with history sidebar |
| `/login` | Public | Broker login/signup (redirects to dashboard if authenticated) |
| `/dashboard` | Protected | Pipeline kanban board with stats |
| `/dashboard/leads` | Protected | Leads table with search and filter |
| `/dashboard/leads/[id]` | Protected | Lead detail — info, conversation, documents, analysis |
| `/dashboard/documents` | Protected | All documents across leads |

## API Routes

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/chat` | Public | Chat with AI, auto-create leads |
| `GET` | `/api/chat/[leadId]` | Public | Load conversation history |
| `GET` | `/api/chat/history` | Public | List chat sessions |
| `GET` | `/api/leads` | Protected | List all leads |
| `GET/PATCH/DELETE` | `/api/leads/[id]` | Protected | Lead CRUD |
| `GET` | `/api/documents` | Protected | List documents |
| `POST` | `/api/documents/upload` | Protected | Upload PDF |
| `POST` | `/api/documents/[id]/extract` | Protected | AI extraction |
| `GET/POST` | `/api/analysis/[leadId]` | Protected | AI coverage analysis |
| `POST` | `/api/auth/logout` | — | Sign out |

## Architecture & Diagrams

- [APP_DOCUMENTATION.md](./APP_DOCUMENTATION.md) — Detailed technical docs: schema, AI integration, scoring, auth, flows
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, database schema, AI pipeline
- [architecture-doc.md](./architecture-doc.md) — Extended architecture with edge cases, security, scalability

### Mermaid Diagrams

- [System Architecture](./diagrams/system-architecture.md) — High-level architecture, layered view, data flow
- [ER Diagram](./diagrams/er-diagram.md) — Database schema, lead status state machine, document processing states
- [Lead Capture Flow](./diagrams/lead-capture-flow.md) — End-to-end sequence, lead creation decision flow, extraction pipeline

> All diagrams use Mermaid syntax and render natively on GitHub.

## Scripts

```bash
npm run dev       # Dev server (Turbopack)
npm run build     # prisma generate && next build
npm run start     # Production server
npm run lint      # ESLint
```

## Deployment

### Vercel

1. Push to GitHub
2. Import in Vercel
3. Add all env vars from `.env.local` in **Settings → Environment Variables**
4. Build command is already `prisma generate && next build`

### Important Notes

- Next.js 16 uses `proxy.ts` instead of `middleware.ts` for route-level guards
- The `documents` Supabase Storage bucket must be **public** so the extraction API can fetch files by URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is required for auth to work in production
- Never commit `.env.local` — it's already in `.gitignore`
