# aSHE XCHNGE

A platform connecting artists with organizations for job opportunities and collaborations.

## Tech Stack

- **Frontend**: React 19, React Router v7, Tailwind CSS v4
- **Backend**: Supabase (auth + database)
- **Build tool**: Vite

## Running Locally

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd ashexchange
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. In your project's **SQL Editor**, run the contents of `supabase/schema.sql` to create the required tables

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your values from **Supabase → Project Settings → API**:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── layout/       # Navbar, Layout wrapper
│   └── ui/           # Reusable UI components (Button, Input)
├── contexts/         # React contexts (AuthContext)
├── lib/              # Supabase client
└── pages/
    ├── auth/         # Login, Signup
    ├── artist/       # Artist profile pages
    ├── org/          # Organization profile pages
    ├── opportunity/  # Opportunity listing, detail, creation
    └── dashboard/    # Artist and org dashboards
```
