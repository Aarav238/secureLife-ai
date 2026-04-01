# SecureLife AI — Insurance Lead Management System

AI-powered lead management platform for insurance brokers. Qualifies leads through conversational AI, extracts policy data from documents, and generates comprehensive coverage analysis.

## Features

- **AI Chatbot** — Conversational lead qualification using GPT-4.1. Collects name, contact, insurance needs, and budget in 2-3 natural exchanges
- **Pipeline Dashboard** — Kanban board tracking leads through: New → Qualifying → Qualified → Docs Pending → Docs Uploaded → Analysis Ready → Reviewed → Won/Lost
- **Document Intelligence** — Upload insurance PDFs to Supabase Storage, extract structured data (policy number, provider, coverage, premium, exclusions, benefits) via AI
- **Smart Analysis** — AI-generated coverage gap analysis, potential savings, risk flags, and prioritized recommendations with an overall insurance health score
- **Chat History** — Persistent conversations with session switching, stored in database
- **Markdown Rendering** — AI responses rendered with proper formatting, code highlighting, tables

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL) via Prisma v7
- **File Storage:** Supabase Storage
- **AI:** OpenAI GPT-4.1
- **PDF Parsing:** pdf-parse
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Fonts:** Plus Jakarta Sans + DM Sans + JetBrains Mono

## Setup

### Prerequisites

- Node.js 18+
- Supabase project (free tier)
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
3. Go to **Settings → API** → copy the **Project URL** and **service_role key** (not anon key)
4. Go to **Storage** → click **New Bucket** → name it `documents` → set it to **Public**

### Environment Variables

Create `.env.local` in the project root:

```env
# Database — Supabase Session Pooler connection string
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Supabase — for file storage
NEXT_PUBLIC_SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

| Variable | Where to Find | Purpose |
|---|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string → Session Pooler | PostgreSQL connection via Prisma |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) | GPT-4.1 for chatbot, extraction, analysis |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | Supabase client initialization |
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

1. Visit `/chat` → Talk to the AI advisor about your insurance needs
2. The AI collects your info and creates a lead automatically (after substantive data like name/interest is shared)
3. Visit `/dashboard` → See the lead in the pipeline kanban board
4. Click the lead → Upload policy PDFs in the **Documents** tab
5. Click "Extract Data with AI" to parse the document via GPT-4.1
6. Go to **Analysis** tab → Click "Generate Analysis" for coverage gaps, savings, and recommendations

## Architecture & Diagrams

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design, database schema, AI pipeline, API docs
- [architecture-doc.md](./architecture-doc.md) — Detailed architecture document with edge cases, security roadmap, scalability path

### Mermaid Diagrams

- [System Architecture](./diagrams/system-architecture.md) — High-level architecture, layered view, data flow
- [ER Diagram](./diagrams/er-diagram.md) — Database schema, lead status state machine, document processing states, JSON structures
- [Lead Capture Flow](./diagrams/lead-capture-flow.md) — End-to-end sequence diagram, lead creation decision flow, document extraction pipeline

> All diagrams use Mermaid syntax and render natively on GitHub.

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with features, how-it-works, CTA |
| `/chat` | AI chatbot with history sidebar |
| `/dashboard` | Pipeline kanban board with stats |
| `/dashboard/leads` | Leads table with search and filter |
| `/dashboard/leads/[id]` | Lead detail — info, conversation, documents, analysis |
| `/dashboard/documents` | All documents across leads |

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

Set all environment variables from `.env.local` in the Vercel dashboard under **Settings → Environment Variables**.

### Important Notes

- The `documents` Supabase Storage bucket must be **public** so the extraction API can fetch files by URL
- Never commit `.env.local` — it's already in `.gitignore`
- The `/uploads/` folder is for local dev only and is gitignored — production uses Supabase Storage
