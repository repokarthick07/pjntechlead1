# PJN LEADFLOW — Backend API

> **Production-grade Node.js + Express REST API for the PJN LEADFLOW WhatsApp Lead Outreach platform.**

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v20 |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma |
| Database | SQLite (dev.db) → PostgreSQL (production) |
| Auth | JWT (JSON Web Tokens) |
| File Parsing | pdf-parse, fast-xml-parser, xlsx |
| Phone Normalization | libphonenumber-js |
| Export Engine | pdfkit, xlsx, json2csv |
| Dev Server | ts-node-dev |

---

## 📁 Folder Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # Database schema (all models)
│   ├── dev.db               # SQLite database file
│   └── seed.ts              # Seeds default user, templates & sample leads
├── src/
│   ├── controllers/         # Route handlers
│   │   ├── authController.ts
│   │   ├── importController.ts
│   │   ├── leadsController.ts
│   │   ├── outreachController.ts
│   │   ├── templateController.ts
│   │   ├── followUpController.ts
│   │   ├── dashboardController.ts
│   │   ├── settingsController.ts
│   │   └── exportController.ts
│   ├── parsers/             # Multi-format file ingestion engines
│   │   ├── csvParser.ts
│   │   ├── jsonParser.ts
│   │   ├── xmlParser.ts
│   │   ├── pdfParser.ts
│   │   ├── excelParser.ts
│   │   ├── txtParser.ts
│   │   └── fieldMapper.ts   # Column alias dictionary
│   ├── services/            # Business logic
│   │   ├── phoneNormalizer.ts   # E.164 normalization
│   │   ├── templateEngine.ts    # Message rendering + 17 industry templates
│   │   └── duplicateDetector.ts # Import preview & dedup logic
│   ├── utils/               # Exporters
│   │   ├── csvExporter.ts
│   │   ├── excelExporter.ts
│   │   └── pdfExporter.ts
│   ├── middleware/          # Auth & error middleware
│   ├── routes/              # Express route definitions
│   ├── __tests__/
│   │   └── leadflow.test.ts # 8 unit tests (all passing)
│   └── server.ts            # App entry point
├── uploads/                 # Uploaded lead files (auto-created)
├── .env                     # Environment variables
├── package.json
└── tsconfig.json
```

---

## ⚙️ Setup & Installation

### 1. Add Node.js to PATH (this machine)
```powershell
$env:PATH = "C:\Users\Ranjith\nodejs;" + $env:PATH
```

### 2. Install dependencies
```powershell
cd "D:\lead converter\backend"
npm install
```

### 3. Push database schema
```powershell
npx prisma db push
```

### 4. Seed default data
```powershell
npx ts-node prisma/seed.ts
```

### 5. Start dev server
```powershell
npm run dev
```
> Server runs at: http://localhost:5000

---

## 🔑 Default Login

| Field | Value |
|-------|-------|
| Email | admin@pjntechnologies.com |
| Password | admin123 |

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login & get JWT |
| GET | /api/leads | List leads (search, filter, paginate) |
| POST | /api/import/upload | Upload file (PDF/CSV/Excel/JSON/XML/TXT) |
| POST | /api/import/confirm | Save parsed leads to DB |
| GET | /api/outreach/session | Get current lead card + queue position |
| POST | /api/outreach/mark-contacted | Mark contacted, advance queue |
| GET | /api/export/csv | Export as CSV |
| GET | /api/export/excel | Export as Excel |
| GET | /api/export/pdf | Export as PDF |
| GET | /api/dashboard/metrics | Summary stats |

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| npm run dev | Start with hot-reload |
| npm run build | Compile TypeScript |
| npm start | Run compiled production build |
| npm test | Run Jest unit tests |
| npx prisma studio | Visual database browser |

---

## 🗄️ Database Models

| Model | Purpose |
|-------|---------|
| User | Admin accounts |
| Lead | Business contacts |
| MessageTemplate | WhatsApp message templates |
| ContactHistory | Interaction timeline per lead |
| FollowUp | Scheduled follow-up reminders |
| ImportJob | File upload history |
| OutreachQueueSession | Persistent queue position |
| Settings | Per-user configuration |

---

## 🔒 Security
- JWT Bearer token auth on all routes
- bcrypt password hashing
- Prisma ORM parameterized queries (SQL injection safe)
- File upload MIME type validation

---

*PJN Technologies | PJN LEADFLOW v1.0.0*
