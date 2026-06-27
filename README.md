# MemoryVault 🔐

An ultra-premium, AI-powered Personal Memory & Physical Storage Cataloging application. Never forget where you stored your passports, keys, warranties, or valuables again. Talk naturally with an integrated AI assistant that reads your database context in real-time, or request storage preservation advice for high-value items.

---

## 📖 About
> **AI-powered physical storage and inventory tracking app built with React, Express.js, MongoDB Atlas, Clerk Auth, and Google Gemini 2.5 RAG chatbot.**

---

## ✨ Features

* **📦 Relational Physical Cataloging**: Add, update, and search physical items, folder pathways, categories, and warranty dates, with inline creation dialogues.
* **🧠 Gemini 2.5 RAG Memory Assistant**: An intelligent chatbot powered by Google Gemini 2.5 Flash. It tokenizes user queries and performs real-time database retrieval (RAG) to answer questions like *"Where did I keep my spare keys?"* naturally and securely.
* **🛡️ Secure Clerk Authentication**: Protected dashboard routes and user-isolated database documents. Automatically syncs user credentials on login to ensure seamless experience.
* **⏰ Expiry & Maintenance Reminders**: Smart notifications check active schedules. Receive browser toast alerts and live sound alarms on expiration/check-in dates.
* **💡 Preservation Advisor**: Query best practices, safety guidelines, and environmental suggestions (temperature, security, protection) for any type of storage asset.
* **🎨 Premium HUD Aesthetics**: Highly-polished design system featuring:
  * A dark cyberpunk color scheme (neon cyan, fuchsia accents, and flowing gradient text layouts).
  * Responsive mobile drawers and desktop layouts.
  * Stacking horizontal slide animations for landing page tabs.
  * A fluid, trailing background spotlight (lighting aura) following the mouse pointer without interfering with readability.

---

## 🛠️ Tech Stack

### Frontend
* **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: Vanilla CSS (custom neon gradients, keyframes, and utility layouts)
* **Authentication**: [Clerk React SDK](https://clerk.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Fonts**: [Google Fonts](https://fonts.google.com/) (Inter, JetBrains Mono)

### Backend
* **Runtime**: [Node.js](https://nodejs.org/)
* **Framework**: [Express.js](https://expressjs.com/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose ODM](https://mongoosejs.com/)
* **Authentication**: [Clerk Express SDK](https://clerk.com/)
* **AI Processing**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
* **Validation**: [Zod](https://zod.dev/)

### Deployment
* **Frontend**: [Vercel](https://vercel.com/)
* **Backend**: [Render](https://render.com/)

---

## 📁 Project Structure

```text
memory-vault/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GlowCard.tsx         # Mouse-tracking glowing card outlines
│   │   │   ├── LandingShowcase.tsx  # Landing page interactive mockup slide system
│   │   │   ├── MemoryDialog.tsx     # Dialog form for catalog additions
│   │   │   └── ReminderNotifier.tsx # Live alarm & push notification scheduler
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx  # Sidebar navigation and protected layout
│   │   ├── lib/
│   │   │   └── api.ts              # Authenticated API fetch helper
│   │   ├── pages/
│   │   │   ├── AIAssistantPage.tsx  # Gemini RAG Chat interface
│   │   │   ├── CategoriesPage.tsx   # Category management CRUD
│   │   │   ├── DashboardPage.tsx    # Analytics, quick actions, recent items
│   │   │   ├── LandingPage.tsx      # Public marketing landing page
│   │   │   ├── MemoriesPage.tsx     # Items list, advanced search and filters
│   │   │   ├── RemindersPage.tsx    # Active countdown checklist
│   │   │   ├── SignInPage.tsx       # Clerk Sign-In page
│   │   │   ├── SignUpPage.tsx       # Clerk Sign-Up page
│   │   │   └── StorageAdvisorPage.tsx # Gemini preservation tips chat
│   │   ├── App.tsx                  # Root router with protected routes
│   │   ├── index.css                # Global styles, neon gradients, animations
│   │   └── main.tsx                 # Entry point wrapping Clerk provider
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                          # Express.js Backend API
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts             # Clerk JWT verification & user upsert
│   │   ├── models/
│   │   │   ├── Category.ts         # Mongoose schema for categories
│   │   │   ├── Memory.ts           # Mongoose schema for stored items
│   │   │   ├── Reminder.ts         # Mongoose schema for reminders
│   │   │   └── User.ts             # Mongoose schema for users
│   │   ├── routes/
│   │   │   ├── advisor.ts          # POST /api/advisor — Gemini preservation tips
│   │   │   ├── categories.ts       # CRUD /api/categories
│   │   │   ├── chat.ts             # POST /api/chat — Gemini RAG assistant
│   │   │   ├── memories.ts         # CRUD /api/memories
│   │   │   └── reminders.ts        # CRUD /api/reminders
│   │   ├── utils/
│   │   │   └── seedCategories.ts   # Default categories seeder
│   │   └── index.ts                # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## ⚙️ Environment Configuration

### Client (`client/.env`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000    # Local dev (or your Render URL for production)
```

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/memoryvault?retryWrites=true&w=majority
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=AIzaSy...
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Vamsi1022K/MemoryVault1.git
cd MemoryVault1
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Configure environment variables
Create `.env` files in both `client/` and `server/` directories using the templates above.

### 4. Run the application locally
```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the frontend dev server
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your web browser.

---

## 🌐 Live Demo

* **Frontend**: [memoryvault-client.vercel.app](https://memoryvault-client.vercel.app)
* **Backend API**: [memoryvault-api-xadt.onrender.com](https://memoryvault-api-xadt.onrender.com)

---

## 📄 License
This project is licensed under the MIT License.
