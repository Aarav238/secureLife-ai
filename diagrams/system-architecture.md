# System Architecture Diagram

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Frontend — Browser"]
        direction LR
        LP["Landing Page<br/><code>/</code>"]
        CH["AI Chatbot<br/><code>/chat</code>"]
        DB["Dashboard<br/><code>/dashboard</code>"]
        LD["Lead Detail<br/><code>/dashboard/leads/[id]</code>"]
        LT["Leads Table<br/><code>/dashboard/leads</code>"]
        DT["Documents Table<br/><code>/dashboard/documents</code>"]
    end

    subgraph Server["⚙️ Next.js 16 App Router — Vercel"]

        subgraph API["API Routes"]
            direction LR
            ChatAPI["<b>Chat API</b><br/>POST /api/chat<br/>GET /api/chat/history<br/>GET /api/chat/[leadId]"]
            LeadsAPI["<b>Leads API</b><br/>GET /api/leads<br/>GET /api/leads/[id]<br/>PATCH /api/leads/[id]<br/>DELETE /api/leads/[id]"]
            DocsAPI["<b>Documents API</b><br/>GET /api/documents<br/>POST /api/documents/upload<br/>POST /api/documents/[id]/extract"]
            AnalysisAPI["<b>Analysis API</b><br/>GET /api/analysis/[leadId]<br/>POST /api/analysis/[leadId]"]
        end

        subgraph AILayer["🤖 AI Orchestration Layer"]
            direction LR
            Chatbot["<b>Chatbot Agent</b><br/>chatbot.ts<br/>Lead qualification via<br/>natural conversation"]
            Extractor["<b>Extractor Agent</b><br/>extractor.ts<br/>PDF → structured<br/>policy data"]
            Analyzer["<b>Analyzer Agent</b><br/>analyzer.ts<br/>Coverage gaps, savings,<br/>risk flags, recommendations"]
        end

        subgraph Utilities["🔧 Utilities"]
            direction LR
            PDFParser["<b>PDF Parser</b><br/>pdf-parse v2<br/>Text extraction from PDF"]
            PrismaClient["<b>Prisma ORM v7</b><br/>@prisma/adapter-pg<br/>Type-safe DB access"]
        end
    end

    subgraph External["☁️ External Services"]
        direction LR
        OpenAI["<b>OpenAI API</b><br/>GPT-4.1<br/>All LLM inference"]
        Supabase["<b>Supabase</b><br/>PostgreSQL<br/>Session pooler"]
        FileStore["<b>Local Storage</b><br/>/uploads/<br/>PDF files (MVP)"]
    end

    %% Frontend → API
    CH -->|"send message<br/>receive AI reply"| ChatAPI
    DB -->|"fetch all leads"| LeadsAPI
    LD -->|"fetch/update/delete lead"| LeadsAPI
    LD -->|"upload PDF<br/>trigger extraction"| DocsAPI
    LD -->|"generate analysis"| AnalysisAPI
    LT -->|"fetch + filter leads"| LeadsAPI
    DT -->|"fetch all documents"| DocsAPI

    %% API → AI
    ChatAPI -->|"conversation history<br/>+ user message"| Chatbot
    DocsAPI -->|"raw PDF text"| Extractor
    AnalysisAPI -->|"lead profile<br/>+ extracted docs"| Analyzer

    %% AI → OpenAI
    Chatbot -->|"chat.completions.create"| OpenAI
    Extractor -->|"chat.completions.create"| OpenAI
    Analyzer -->|"chat.completions.create"| OpenAI

    %% API → Data
    ChatAPI --> PrismaClient
    LeadsAPI --> PrismaClient
    DocsAPI --> PrismaClient
    DocsAPI --> PDFParser
    AnalysisAPI --> PrismaClient

    %% Data → External
    PrismaClient -->|"session pooler<br/>port 5432"| Supabase
    DocsAPI -->|"save uploaded PDF"| FileStore
    PDFParser -->|"read PDF buffer"| FileStore

    %% Styling
    classDef frontend fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#1e1b4b
    classDef api fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f
    classDef ai fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef external fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#831843
    classDef util fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#1e293b

    class LP,CH,DB,LD,LT,DT frontend
    class ChatAPI,LeadsAPI,DocsAPI,AnalysisAPI api
    class Chatbot,Extractor,Analyzer ai
    class OpenAI,Supabase,FileStore external
    class PDFParser,PrismaClient util
```

## Data Flow Summary

```mermaid
flowchart LR
    subgraph Inputs["Inputs"]
        User["👤 Prospective Client<br/>Chats via /chat"]
        Broker["🧑‍💼 Insurance Broker<br/>Uses /dashboard"]
        PDF["📄 Policy PDFs<br/>Uploaded by broker"]
    end

    subgraph Processing["AI Processing"]
        Qualify["🤖 Chatbot Agent<br/>Qualifies lead in 2-3 exchanges<br/>Extracts name, contact, interest, budget"]
        Extract["🤖 Extractor Agent<br/>Parses policy documents<br/>Returns structured fields"]
        Analyze["🤖 Analyzer Agent<br/>Cross-references all data<br/>Finds gaps & savings"]
    end

    subgraph Outputs["Outputs"]
        Lead["📋 Qualified Lead<br/>Score 0-100<br/>Status tracked in pipeline"]
        PolicyData["📊 Extracted Policy Data<br/>Provider, coverage, premium<br/>Exclusions, benefits"]
        Report["📈 Analysis Report<br/>Coverage gaps (severity)<br/>Potential savings (₹)<br/>Risk flags & recommendations<br/>Overall score 0-100"]
    end

    User --> Qualify
    Qualify --> Lead
    PDF --> Extract
    Extract --> PolicyData
    Lead & PolicyData --> Analyze
    Analyze --> Report
    Lead & PolicyData & Report --> Broker

    classDef input fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px,color:#1e1b4b
    classDef process fill:#d1fae5,stroke:#059669,stroke-width:2px,color:#064e3b
    classDef output fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f

    class User,Broker,PDF input
    class Qualify,Extract,Analyze process
    class Lead,PolicyData,Report output
```

## Component Responsibilities

| Layer | Component | Responsibility |
|---|---|---|
| **Frontend** | Landing Page (`/`) | Marketing, feature showcase, onboarding CTAs |
| **Frontend** | AI Chatbot (`/chat`) | Real-time conversation with lead, chat history sidebar, session persistence |
| **Frontend** | Dashboard (`/dashboard`) | Pipeline kanban board, stats cards (total, qualified, won, avg score) |
| **Frontend** | Lead Detail (`/dashboard/leads/[id]`) | Full lead view with tabs: info, conversation, documents, analysis |
| **Frontend** | Leads Table (`/dashboard/leads`) | Searchable, filterable list of all leads |
| **Frontend** | Documents Table (`/dashboard/documents`) | All uploaded documents across leads with status |
| **API** | Chat Routes | Message handling, deferred lead creation, session memory, conversation persistence |
| **API** | Lead Routes | Full CRUD operations on leads with cascade delete |
| **API** | Document Routes | PDF upload to local storage, AI extraction trigger with retry |
| **API** | Analysis Routes | AI analysis generation/regeneration, upsert to DB |
| **AI** | Chatbot Agent | Conversational lead qualification + structured data extraction via `<extracted_data>` blocks |
| **AI** | Extractor Agent | PDF raw text → structured policy JSON (policy #, provider, coverage, premium, dates, exclusions, benefits) |
| **AI** | Analyzer Agent | Lead profile + all documents → coverage gaps, savings, risk flags, recommendations, overall score |
| **Data** | Prisma v7 + pg adapter | Type-safe PostgreSQL access via Supabase session pooler |
| **Data** | pdf-parse v2 | PDF binary → raw text extraction |
| **External** | OpenAI GPT-4.1 | All LLM inference (chatbot, extraction, analysis) |
| **External** | Supabase PostgreSQL | Persistent storage for leads, messages, documents, analyses |
| **External** | Local /uploads/ | PDF file storage (MVP; production would use Supabase Storage) |
