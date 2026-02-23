# 🏛️ GovTech AI — Intelligence Suite for African Governance

AI-powered governance platform for African nations. Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Prisma**.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC)

---

## ✨ Features

- 🌍 **Multi-country dashboard** — Cameroon, DRC, Gabon, Congo
- 📊 **Real-time analytics** — Budget tracking, KPI monitoring, project oversight
- 🔒 **Enterprise security** — Role-based access, audit logging, rate limiting
- 🌐 **Bilingual** — French / English
- 📱 **Responsive design** — Mobile-first, modern UI
- 🏗️ **Full API** — RESTful endpoints for all government operations

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/peupleaelionor/GovTech-.git
cd GovTech-

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

---

## 🌐 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/peupleaelionor/GovTech-)

### Manual Deploy

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel project settings:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your database connection string | ✅ |
| `NEXTAUTH_SECRET` | A strong random secret (32+ chars) | ✅ |
| `NEXTAUTH_URL` | Your Vercel domain (e.g. `https://your-app.vercel.app`) | ✅ |

4. Deploy!

> **Note:** For production, use a hosted database (e.g., [Turso](https://turso.tech) or [Neon](https://neon.tech)) instead of SQLite.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   └── performance/      # Performance components
├── lib/                   # Utilities
│   ├── auth/             # Authentication config
│   ├── db.ts             # Database client
│   ├── security/         # Rate limiting, audit logging
│   └── validation/       # Zod schemas
├── hooks/                 # Custom React hooks
├── providers/             # Context providers
└── middleware.ts          # Edge middleware
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 16](https://nextjs.org) | React framework |
| [TypeScript](https://typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [shadcn/ui](https://ui.shadcn.com) | UI components |
| [Prisma](https://prisma.io) | Database ORM |
| [NextAuth.js](https://next-auth.js.org) | Authentication |
| [Recharts](https://recharts.org) | Data visualization |
| [Framer Motion](https://framer.com/motion) | Animations |
| [Zod](https://zod.dev) | Schema validation |

---

## 📜 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run db:push   # Push Prisma schema to database
npm run db:generate # Generate Prisma client
```

---

## 📝 License

This project is private and proprietary.

---

Built with ❤️ for African governance
