# ✅ To-Do App

A clean, modern To-Do web application built with **Next.js**, **Supabase**, and **Tailwind CSS**.

🌐 **Live:** [todo-app-hxdi.vercel.app](https://todo-app-hxdi.vercel.app/login)

---

## Features

- 🔐 **Authentication** — Email/password sign up, log in, and log out
- ✅ **Task Management** — Add, complete, and delete tasks
- 🔍 **Filtering** — View All / Active / Completed tasks
- 📊 **Task Counter** — Remaining tasks displayed in real time
- ☁️ **Cloud Persistence** — Tasks sync across sessions and devices
- 📱 **Responsive UI** — Works on desktop and mobile

---

## Tech Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Framework    | Next.js 16 (App Router) |
| Language     | TypeScript              |
| Styling      | Tailwind CSS v4         |
| Auth & DB    | Supabase                |
| Deployment   | Vercel                  |

---

## Project Structure

```
src/
├── app/          # Next.js App Router pages & API routes
├── context/      # React context providers (auth, tasks)
└── lib/          # Supabase client & utility helpers
```

---

## Environment Variables

The app requires the following environment variables (configured in Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Database Schema

The Supabase schema is defined in [`supabase-schema.sql`](./supabase-schema.sql). Run it in the **Supabase SQL Editor** to set up the required tables.

---

## License

MIT
