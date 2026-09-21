# PJN LEADFLOW — Frontend

> **React + Vite + Tailwind CSS web application for the PJN LEADFLOW WhatsApp Lead Outreach platform.**

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Icons | Lucide React |
| Charts | Recharts |
| State | React Context API |

---

## 📁 Folder Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.tsx          # Navigation + Outreach CTA
│   │   ├── Topbar.tsx           # Search & action bar
│   │   ├── LeadCard.tsx         # Lead grid card
│   │   ├── LeadTable.tsx        # Lead table row
│   │   ├── MetricsCard.tsx      # Dashboard stat card
│   │   ├── ImportPreviewModal.tsx
│   │   ├── ManualLeadModal.tsx
│   │   ├── EditLeadModal.tsx
│   │   ├── FollowUpModal.tsx
│   │   └── ContactHistoryModal.tsx
│   ├── context/             # Global state
│   │   ├── AuthContext.tsx      # JWT auth state & login/logout
│   │   └── ToastContext.tsx     # Toast notifications
│   ├── pages/               # App screens
│   │   ├── Login.tsx            # Login screen
│   │   ├── Dashboard.tsx        # Main dashboard + CONTINUE OUTREACH hero
│   │   ├── OutreachMode.tsx     # 1-click WhatsApp Outreach Mode
│   │   ├── Leads.tsx            # Lead database (grid + table view)
│   │   ├── FileImport.tsx       # Drag & drop file upload
│   │   ├── Templates.tsx        # Message template manager
│   │   ├── FollowUps.tsx        # Follow-up reminders
│   │   ├── ImportHistory.tsx    # Past import jobs
│   │   └── Settings.tsx         # App settings
│   ├── services/
│   │   └── api.ts               # Axios API client (all backend calls)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── utils/
│   │   └── whatsapp.ts          # WhatsApp URL builder
│   ├── App.tsx              # Routing configuration
│   ├── main.tsx             # React entry point
│   └── index.css            # Tailwind base styles
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## ⚙️ Setup & Installation

### 1. Add Node.js to PATH (this machine)
```powershell
$env:PATH = "C:\Users\Ranjith\nodejs;" + $env:PATH
```

### 2. Install dependencies
```powershell
cd "D:\lead converter\frontend"
npm install
```

### 3. Start dev server
```powershell
npm run dev
```
> App runs at: http://localhost:3000

---

## 📦 Scripts

| Script | Description |
|--------|-------------|
| npm run dev | Start Vite dev server (hot reload) |
| npm run build | Build for production (outputs to dist/) |
| npm run preview | Preview the production build locally |

---

## 🖥️ App Screens

### 🏠 Dashboard
- Live outreach counters: Today's Leads / Contacted / WhatsApp Opened / Remaining
- [ START WHATSAPP OUTREACH ] / [ CONTINUE OUTREACH ] hero button
- Pipeline status pie chart
- Category distribution bar chart
- Today's follow-up reminders

### ⚡ WhatsApp Outreach Mode (Core Feature)
- Shows one lead at a time in a focused card
- Queue progress counter (e.g. 23 / 155 leads)
- Personalized pre-filled message preview
- [ ✏️ Edit Message ] — customize message before sending
- [ 🟢 OPEN WHATSAPP ] — opens WhatsApp with pre-filled message
- [ ✓ Mark Contacted ] — marks lead and auto-advances to next
- [ ⏭ Skip ] — skips lead and advances
- Queue position remembered across browser restarts

### 📋 Leads
- Grid view (cards) and Table view
- Real-time search by business name, phone, city
- Filter by status: Pending / Contacted / WhatsApp Opened / Follow-up / Interested / Converted
- Filter by category
- Bulk actions: Mark Contacted / Delete / Export selected
- Pagination

### 📤 File Import
- Drag & drop or click to upload
- Supported formats: CSV, Excel (.xlsx), PDF, JSON, XML, TXT
- Import preview: total found / duplicates / valid / invalid
- One-click confirm to save all leads

### 📝 Templates
- 17 built-in industry message templates
- Dynamic variables: {{business_name}}, {{city}}, {{category}}
- Create, edit, delete custom templates
- Live message preview

### 📅 Follow-ups
- View all scheduled follow-ups
- Mark as completed
- Filter by date / status

### 📂 Import History
- View all past file uploads
- Stats per import: total / imported / duplicates / errors

### ⚙️ Settings
- Company name & contact info
- Default WhatsApp message template
- Outreach queue preferences

---

## 🔗 Backend Connection

The frontend connects to the backend API at `http://localhost:5000`.

Configured in `vite.config.ts`:
```ts
proxy: {
  '/api': 'http://localhost:5000'
}
```

Make sure the backend server is running before starting the frontend.

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| Primary color | Brand blue (#3B5BDB) |
| WhatsApp button | Green (#25D366) |
| Font | Inter (system UI) |
| Border radius | xl / 2xl / 3xl (rounded cards) |
| Shadows | Tailwind shadow-xs / shadow-md |

---

*PJN Technologies | PJN LEADFLOW v1.0.0*
