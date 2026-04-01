# SecureLife AI — Insurance Lead Management System

AI-powered lead management platform for insurance brokers. Qualifies leads through conversational AI, extracts policy data from documents, and generates comprehensive coverage analysis.

## Features

- **AI Chatbot** — Conversational lead qualification using GPT-4.1. Collects name, contact, insurance needs, and budget in 2-3 natural exchanges
- **Pipeline Dashboard** — Kanban board tracking leads through: New → Qualifying → Qualified → Docs Pending → Docs Uploaded → Analysis Ready → Reviewed → Won/Lost
- **Document Intelligence** — Upload insurance PDFs, extract structured data (policy number, provider, coverage, premium, exclusions, benefits) via AI
- **Smart Analysis** — AI-generated coverage gap analysis, potential savings, risk flags, and prioritized recommendations with an overall insurance health score
- **Chat History** — Persistent conversations with session switching, stored in database
- **Markdown Rendering** — AI responses rendered with proper formatting, code highlighting, tables

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL) via Prisma v7
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

### Environment Variables

Create `.env.local`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
OPENAI_API_KEY="sk-proj-..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Use the **Session Pooler** connection string from Supabase (Settings → Database → Connection string).

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
2. The AI collects your info and creates a lead automatically
3. Visit `/dashboard` → See the lead in the pipeline
4. Click the lead → Upload policy PDFs in the Documents tab
5. Click "Extract Data with AI" to parse the document
6. Go to Analysis tab → Click "Generate Analysis" for coverage gaps, savings, and recommendations

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design, database schema, AI pipeline, and API documentation.

## Deployment

Deploy to Vercel:

```bash
npm run build
vercel --prod
```

Set environment variables in Vercel dashboard.
