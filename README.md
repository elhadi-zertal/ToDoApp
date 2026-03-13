# To-Do App

A clean, modern To-Do web application built with **Next.js**, **Supabase**, and **Tailwind CSS**.

## Features

- 🔐 Email / password auth (sign up, log in, log out)
- ✅ Add, complete, and delete tasks
- 🔍 Filter by All / Active / Completed
- 📊 Remaining-tasks counter
- ☁️ Cloud storage — tasks persist across sessions and devices
- 🎨 Responsive dark/light mode UI

## Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd ToDoApp
npm install
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase-schema.sql` from this repo
3. Go to **Settings → API** and copy your **URL** and **anon key**

### 3. Environment variables

Create `.env.local` (or rename `.env.local` already in the repo):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add the two environment variables above in the Vercel dashboard
4. Deploy 🚀

## Tech Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Framework      | Next.js 15 (App Router) |
| Language       | TypeScript            |
| Styling        | Tailwind CSS          |
| Auth & DB      | Supabase              |
| Deployment     | Vercel                |
