# CalendarX — Google Calendar Clone

A **high-fidelity, full-stack Google Calendar clone** built with React (TypeScript) + Node.js (Express) + MongoDB. Features a premium dark-mode UI, smooth animations, collision detection, recurring events, and full CRUD.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Backend

```bash
cd server
npm install
# Edit .env if needed (MONGODB_URI)
npm run dev
```

Server starts at **http://localhost:5000**

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

App starts at **http://localhost:5173**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│                   CLIENT                    │
│  React 18 + TypeScript + Vite               │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Header   │ │ Sidebar  │ │CalendarView│  │
│  └──────────┘ └──────────┘ └────────────┘  │
│        ┌──────────────────────────┐         │
│        │  CalendarContext (state) │         │
│        └──────────────────────────┘         │
│                    Axios                    │
└─────────────────┬───────────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────────┐
│                  SERVER                     │
│  Express + TypeScript                       │
│  Routes → Controllers → Mongoose Models     │
└─────────────────┬───────────────────────────┘
                  │ Mongoose ODM
┌─────────────────▼───────────────────────────┐
│               MONGODB                       │
│  events collection                          │
│  Indexed on: startTime, endTime             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Technology Choices

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + TypeScript | Type safety, component reusability |
| Build Tool | Vite | Extremely fast HMR |
| Styling | Tailwind CSS + CSS vars | Utility-first + custom design tokens |
| Animations | Framer Motion | Production-quality motion |
| HTTP | Axios | Interceptors, error handling |
| Backend | Express + TypeScript | Fast REST API |
| Database | MongoDB + Mongoose | Flexible schema, date querying |
| Dates | date-fns | Lightweight, tree-shakeable |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events?start=&end=` | Fetch events in time range |
| POST | `/api/events` | Create event (collision check) |
| PATCH | `/api/events/:id` | Update event (collision check) |
| DELETE | `/api/events/:id` | Delete event |
| GET | `/health` | Health check |

**Collision Override:** Append `?force=true` to POST/PATCH to save despite overlap.

---

## 📊 Database Schema

```typescript
Event {
  _id: ObjectId
  title: string (required)
  description?: string
  startTime: Date (UTC, required)
  endTime: Date (UTC, required)
  location?: string
  color?: string          // hex color
  isRecurring: boolean
  recurrenceRule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    endDate?: Date
  }
  createdAt: Date
  updatedAt: Date
}

// Compound index: { startTime: 1, endTime: 1 }
```

> All timestamps stored in **UTC**. The frontend displays them in the user's **local timezone** via JavaScript's native `Date` object.

---

## ✨ Features

- **3 Calendar Views** — Month, Week, Day
- **Event CRUD** — Create, edit, delete with animated modal
- **Collision Detection** — Warns on overlap, allows "Save anyway"
- **Recurring Events** — Daily / Weekly / Monthly
- **Color-coded Events** — 8 color options per event
- **Real-time Now Indicator** — Red line showing current time
- **Mini Calendar** — Sidebar date picker
- **Animated Transitions** — Framer Motion view switching
- **Responsive** — Works on all screen sizes
- **Premium Dark UI** — Glassmorphism, custom design tokens

---

## 🎨 UI & Animations

- **Framer Motion** `AnimatePresence` for modal enter/exit & view transitions
- **CSS custom properties** for consistent theming
- **Glassmorphism** (backdrop-filter blur) on panels
- **Now indicator** CSS `::before` pseudo-element as dot
- **Color pulse glow** (box-shadow) on accent elements
- **Hover micro-animations** on all interactive elements

---

## 🔮 Future Enhancements

1. **Drag-and-drop** event rescheduling (@dnd-kit already installed)
2. **OAuth** Google sign-in
3. **Event resize** by dragging the bottom handle
4. **iCal import/export**
5. **Push notifications** for upcoming events
6. **Offline mode** with IndexedDB sync
7. **Multi-user** calendar sharing

---

## 📁 Project Structure

```
.
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── CalendarView.tsx
│   │   │   ├── MonthView.tsx
│   │   │   ├── WeekView.tsx
│   │   │   ├── DayView.tsx
│   │   │   └── EventModal.tsx
│   │   ├── context/
│   │   │   └── CalendarContext.tsx
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
│
└── server/                  # Express backend
    ├── src/
    │   ├── models/
    │   │   └── Event.ts
    │   ├── controllers/
    │   │   └── eventController.ts
    │   ├── routes/
    │   │   └── eventRoutes.ts
    │   └── index.ts
    ├── .env
    └── package.json
```
