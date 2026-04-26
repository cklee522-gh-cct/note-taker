# Note Taker App — Implementation Plan

## 1. Project Overview

A simple note-taking application with authentication and persistent storage. Users can sign up, sign in, create notes, and have them saved to the database.

### Tech Stack
- **Frontend:** Next.js 14+ (App Router)
- **Backend/Auth/DB:** Supabase (Postgres + Auth)
- **Styling:** Tailwind CSS

---

## 2. Supabase Database Schema

### Tables

#### `profiles`
Extends Supabase auth.users

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, FK → auth.users |
| display_name | text | |
| created_at | timestamptz | default now() |

#### `notes`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id, not null |
| title | text | default 'Untitled' |
| content | text | default '' |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | default now() |

### Row Level Security (RLS)
- **Profiles:** Users can only read/update their own profile
- **Notes:** Users can only read/write their own notes (`auth.uid() = user_id`)

---

## 3. Authentication Flow

### Supabase Auth Configuration
- Email/password authentication
- Protected routes via Next.js middleware

### Auth Pages
- `/login` — Sign in page
- `/signup` — Registration page

### Protected Routes
- `/app/*` — All app routes require authentication
- Middleware checks session and redirects to `/login` if unauthenticated

---

## 4. Application Structure

### Pages
```
/                     → Landing page (marketing)
/login                → Sign in
/signup               → Sign up
/app                  → Notes list
/app/[noteId]         → Note editor
```

### Component Architecture
```
components/
├── ui/                    → Base UI components (Button, Input, etc.)
├── layout/
│   └── AppShell.tsx       → Main layout wrapper
├── notes/
│   ├── NoteList.tsx       → List of user's notes
│   ├── NoteEditor.tsx     → Title + content editor
│   └── NoteCard.tsx       → Single note preview
└── auth/
    ├── LoginForm.tsx
    └── SignupForm.tsx
```

---

## 5. Landing Page

A simple marketing page introducing the app with:
- Hero section (app name, tagline, CTA)
- Brief description of features
- "Sign Up" and "Log In" buttons
- Footer

---

## 6. Notes Editor

### Features
- Title field (single line)
- Content field (multi-line textarea)
- Auto-save on change (debounced 500ms) OR manual save button
- Delete note button
- Back to notes list

### Notes List
- Display all notes owned by the current user
- Show title and content preview
- Sort by `updated_at` (most recent first)
- "New Note" button to create a blank note
- Click a note to open the editor

---

## 7. Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Next.js app with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up Supabase client (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Create Supabase project and schema
- [ ] Configure RLS policies
- [ ] Set up environment variables

### Phase 2: Authentication
- [ ] Create auth pages (login, signup)
- [ ] Implement Supabase Auth integration
- [ ] Set up protected routes middleware
- [ ] Create user profile on signup (database trigger)
- [ ] Add logout functionality

### Phase 3: Landing Page
- [ ] Build marketing landing page at `/`
- [ ] Add CTAs linking to `/signup` and `/login`

### Phase 4: Notes
- [ ] Notes list page (`/app`)
- [ ] Create note functionality
- [ ] Note editor page (`/app/[noteId]`)
- [ ] Save note (title + content) to Supabase
- [ ] Delete note functionality

### Phase 5: Polish
- [ ] Empty states (no notes yet)
- [ ] Loading states
- [ ] Error handling
- [ ] Responsive design

---

## 8. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 9. Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0"
  }
}
```