# Entity Relationship Diagram

## Database Schema

```mermaid
erDiagram
    Lead ||--o{ Message : "has many"
    Lead ||--o{ Document : "has many"
    Lead ||--o| Analysis : "has one"

    Lead {
        string id PK "cuid()"
        string name "nullable — extracted by chatbot"
        string email "nullable — extracted by chatbot"
        string phone "nullable — extracted by chatbot"
        int age "nullable — extracted by chatbot"
        string city "nullable — extracted by chatbot"
        string occupation "nullable — extracted by chatbot"
        LeadStatus status "default NEW — pipeline stage"
        int qualificationScore "0-100 — AI-computed"
        float monthlyBudget "nullable — in INR"
        int existingPolicies "nullable — count"
        string primaryInterest "Health/Life/Vehicle/Home/Travel"
        string urgency "low / medium / high"
        string source "chatbot / whatsapp / phone"
        string assignedBroker "nullable — broker name"
        string notes "nullable — free text"
        datetime createdAt "auto-generated"
        datetime updatedAt "auto-updated"
    }

    Message {
        string id PK "cuid()"
        string leadId FK "references Lead.id — cascade delete"
        string role "user / assistant / system"
        string content "full message text"
        json metadata "extracted data from this message — nullable"
        datetime createdAt "auto-generated"
    }

    Document {
        string id PK "cuid()"
        string leadId FK "references Lead.id — cascade delete"
        string fileName "original upload filename"
        string fileUrl "local path in /uploads/"
        int fileSize "bytes — nullable"
        string mimeType "application/pdf — nullable"
        string rawText "full text extracted by pdf-parse — nullable"
        json extractedData "complete AI extraction result — nullable"
        DocumentType documentType "enum — nullable"
        string policyNumber "nullable — AI extracted"
        string provider "nullable — e.g. Star Health, LIC"
        string policyType "nullable — e.g. Family Floater"
        float coverageAmount "nullable — in INR"
        float premiumAmount "nullable — in INR"
        string premiumFrequency "monthly / quarterly / yearly"
        datetime startDate "nullable — policy start"
        datetime endDate "nullable — policy end"
        datetime renewalDate "nullable — next renewal"
        json exclusions "array of exclusion strings"
        json benefits "array of benefit strings"
        string processingStatus "pending / processing / completed / failed"
        string processingError "error message if failed — nullable"
        datetime createdAt "auto-generated"
        datetime updatedAt "auto-updated"
    }

    Analysis {
        string id PK "cuid()"
        string leadId FK "unique — references Lead.id — cascade delete"
        string summary "2-3 paragraph overall assessment"
        json coverageGaps "array of area + description + severity"
        json potentialSavings "array of area + estimatedSaving + description"
        json riskFlags "array of flag + severity + description"
        json recommendations "array of action + priority + rationale"
        int overallScore "0-100 insurance health score"
        string rawResponse "full LLM response for debugging — nullable"
        datetime createdAt "auto-generated"
        datetime updatedAt "auto-updated"
    }
```

## Lead Status State Machine

```mermaid
stateDiagram-v2
    [*] --> NEW : Lead created from chatbot<br/>(substantive data extracted)

    NEW --> QUALIFYING : AI begins collecting<br/>name, contact, interest
    QUALIFYING --> QUALIFIED : Qualification score > 60<br/>Budget + need + contact confirmed

    QUALIFIED --> DOCUMENTS_PENDING : AI suggests uploading<br/>existing policy documents
    DOCUMENTS_PENDING --> DOCUMENTS_UPLOADED : At least one PDF<br/>successfully extracted

    DOCUMENTS_UPLOADED --> ANALYSIS_READY : AI analysis generated<br/>gaps, savings, risks, score

    ANALYSIS_READY --> REVIEWED : Broker reviews<br/>analysis and recommendations

    REVIEWED --> CLOSED_WON : Client signs up<br/>for recommended policies
    REVIEWED --> CLOSED_LOST : Client declines<br/>or goes elsewhere

    CLOSED_WON --> [*]
    CLOSED_LOST --> [*]

    note right of QUALIFYING
        Chatbot collects info in 2-3 exchanges.
        Score computed from 5 factors (20 pts each):
        budget, need, policies, contact, urgency
    end note

    note right of ANALYSIS_READY
        AI generates: summary, coverage gaps,
        potential savings, risk flags,
        recommendations, overall score (0-100)
    end note
```

## Document Processing States

```mermaid
stateDiagram-v2
    [*] --> pending : PDF uploaded to /uploads/<br/>Document record created

    pending --> processing : Broker clicks<br/>"Extract Data with AI"
    processing --> completed : GPT-4.1 returns valid JSON<br/>Fields stored in Document record
    processing --> failed : Text too short (scanned PDF)<br/>or JSON parse error

    failed --> processing : Broker retries extraction

    completed --> [*]

    note right of processing
        Pipeline:
        1. pdf-parse extracts raw text
        2. Check text length > 50 chars
        3. Send to GPT-4.1 with extraction prompt
        4. Parse JSON response
        5. Retry once on parse failure
        6. Store 15+ structured fields
    end note
```

## Enum Values

### LeadStatus
| Value | Color | Meaning |
|---|---|---|
| `NEW` | Gray | Just created, minimal data |
| `QUALIFYING` | Blue | Chatbot actively collecting info |
| `QUALIFIED` | Indigo | Score > 60, ready for next step |
| `DOCUMENTS_PENDING` | Amber | Awaiting document upload |
| `DOCUMENTS_UPLOADED` | Teal | At least one doc extracted |
| `ANALYSIS_READY` | Emerald | AI analysis complete |
| `REVIEWED` | Purple | Broker has reviewed |
| `CLOSED_WON` | Green | Deal closed successfully |
| `CLOSED_LOST` | Red | Deal lost |

### DocumentType
| Value | Description |
|---|---|
| `HEALTH_INSURANCE` | Mediclaim, family floater, critical illness, top-up |
| `LIFE_INSURANCE` | Term plan, endowment, ULIP, whole life |
| `VEHICLE_INSURANCE` | Car, two-wheeler, commercial (comprehensive or third-party) |
| `HOME_INSURANCE` | Structure, contents, fire, natural disaster |
| `TRAVEL_INSURANCE` | Domestic, international, student |
| `OTHER` | Any other insurance document |

## JSON Field Structures

### Document.extractedData
```json
{
  "documentType": "HEALTH_INSURANCE",
  "policyNumber": "POL-2024-12345",
  "provider": "Star Health Insurance",
  "policyType": "Family Floater",
  "insuredName": "Aarav Shukla",
  "coverageAmount": 500000,
  "premiumAmount": 12000,
  "premiumFrequency": "yearly",
  "startDate": "2024-01-15",
  "endDate": "2025-01-14",
  "renewalDate": "2025-01-14",
  "exclusions": ["Pre-existing diseases (48 months)", "Cosmetic surgery", "Dental treatment"],
  "benefits": ["Hospitalization", "Day care procedures", "Ambulance charges", "Pre/post hospitalization"],
  "deductible": 5000,
  "nominees": ["Priya Shukla"],
  "additionalNotes": "No-claim bonus of 20% applicable on renewal"
}
```

### Analysis.coverageGaps
```json
[
  {
    "area": "Critical Illness Cover",
    "description": "No standalone critical illness policy despite family history of cardiac issues. Current health policy covers hospitalization but not lump-sum CI payouts.",
    "severity": "high"
  },
  {
    "area": "Life Insurance",
    "description": "No term life policy. As a 23-year-old software engineer, premiums would be very affordable now.",
    "severity": "critical"
  }
]
```

### Analysis.potentialSavings
```json
[
  {
    "area": "Health Insurance Premium",
    "estimatedSaving": "₹4,500/year",
    "description": "Switch from individual plan to family floater — covers spouse at marginal cost increase"
  }
]
```

### Analysis.recommendations
```json
[
  {
    "action": "Purchase a ₹1 crore term life policy",
    "priority": "immediate",
    "rationale": "At age 23, premiums are under ₹800/month. Provides financial security for dependents."
  },
  {
    "action": "Add a super top-up of ₹25 lakh",
    "priority": "short-term",
    "rationale": "Base cover of ₹5 lakh is insufficient for major hospitalization in metro cities."
  }
]
```
