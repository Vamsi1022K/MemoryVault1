# MemoryVault 🔐

An ultra-premium, AI-powered Personal Memory & Physical Storage Cataloging application. Never forget where you stored your passports, keys, warranties, or valuables again. Talk naturally with an integrated AI assistant that reads your database context in real-time, or request storage preservation advice for high-value items.

---

## 📖 GitHub Repository About / Bio
> **AI-powered physical storage and inventory tracking app built with Next.js, PostgreSQL (Supabase), Prisma, Clerk Auth, and Gemini 2.5 RAG chatbot.**

---

## ✨ Features

* **📦 Relational Physical Cataloging**: Add, update, and search physical items, folder pathways, categories, and warranty dates, with inline creation dialogues.
* **🧠 Gemini 2.5 RAG Memory Assistant**: An intelligent chatbot powered by Google Gemini 2.5 Flash. It tokenizes user queries and performs real-time database retrieval (RAG) to answer questions like *"Where did I keep my spare keys?"* naturally and securely.
* **🛡️ Secure Clerk Authentication**: Protected dashboard routes and user-isolated database rows. Automatically syncs user credentials on login to ensure seamless experience.
* **⏰ Expiry & Maintenance Reminders**: Smart notifications check active schedules. Receive browser toast alerts and live sound alarms on expiration/check-in dates.
* **💡 Preservation Advisor**: Query best practices, safety guidelines, and environmental suggestions (temperature, security, protection) for any type of storage asset.
* **🎨 Premium HUD Aesthetics**: Highly-polished design system featuring:
  * A dark cyberpunk color scheme (neon cyan, fuchsia accents, and flowing gradient text layouts).
  * Responsive mobile drawers and desktop layouts.
  * Stacking horizontal slide animations for landing page tabs.
  * A fluid, trailing background spotlight (lighting aura) following the mouse pointer without interfering with readability.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js (App Router)](https://nextjs.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **Database & ORM**: PostgreSQL ([Supabase](https://supabase.com/)) & [Prisma ORM](https://www.prisma.io/)
* **Authentication**: [Clerk Auth](https://clerk.com/)
* **AI Processing**: [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 📁 Key File Structure

```text
├── app/
│   ├── (auth)/                  # Clerk Sign-In / Sign-Up pages
│   ├── (dashboard)/             # Protected User Dashboard routes
│   │   ├── ai-assistant/        # Gemini RAG Chat interface
│   │   ├── dashboard/           # Analytics, quick action add, recent items
│   │   ├── memories/            # Items list, advanced search and filters
│   │   ├── reminders/           # Active countdown checklist
│   │   └── storage-advisor/     # Gemini preservation tips chat
│   ├── api/                     # Backend API handlers for CRUD and AI endpoints
│   ├── globals.css              # Custom neon gradients, keyframes and utility layouts
│   └── layout.tsx               # Root Layout wrapping Clerk and CustomCursor
├── components/
│   ├── custom-cursor.tsx        # Liquid trailing background spotlight and pointer ring
│   ├── glow-card.tsx            # Mouse-tracking glowing card outlines
│   ├── landing-showcase.tsx     # Landing page interactive mockup slide system
│   └── memory-dialog.tsx        # Dialog form for catalog additions
├── prisma/
│   ├── schema.prisma            # PostgreSQL schemas (User, Memory, Category, Reminder)
│   └── seed.ts                  # Default categories seeder
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory and configure the following credentials:

```env
# Database Connection (Supabase PostgreSQL pooler URL)
DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/postgres?pgbouncer=true"

# Clerk Authentication API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...
```

---

## 🚀 Getting Started

### 1. Clone the repository & Install dependencies
```bash
git clone https://github.com/yourusername/memory-vault.git
cd memory-vault
npm install
```

### 2. Setup your Database and ORM
Run Prisma migrations to push the schema to your database, and seed standard category inputs:
```bash
# Push database schemas
npx prisma db push

# Generate client
npx prisma generate

# Seed default category tags
npx prisma db seed
```

### 3. Run the application locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📄 License
This project is licensed under the MIT License.
