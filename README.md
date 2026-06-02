# CourtBook - Tennis Court Booking App

A full-stack web application for browsing and booking tennis courts. Built with React, Supabase, and Tailwind CSS.

**Live Demo:** [tenniscourtbooker.netlify.app](https://tenniscourtbooker.netlify.app)

## Features

- **Court Browsing** - Browse 6 tennis courts with search by name/location and filter by surface type (hard, clay, grass)
- **Time Slot Booking** - Pick a date and book 1-hour slots from 7 AM to 8 PM with real-time availability
- **User Authentication** - Sign up / sign in with email & password or Google OAuth
- **Forgot Password** - Password reset flow via email link
- **My Bookings** - View upcoming and past bookings, cancel anytime
- **User Profile** - View account details, booking stats, favorite court, and change password
- **Slot Protection** - Booked slots are greyed out; unique constraint prevents double-booking
- **Row-Level Security** - Users can only modify their own bookings (enforced at the database level)
- **Responsive Design** - Works on mobile, tablet, and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **Hosting** | Netlify |

## Project Structure

```
src/
  components/         # Reusable UI components
    CourtCard.tsx       # Court listing card
    Navbar.tsx          # Navigation bar with auth state
    TimeSlotPicker.tsx  # Hourly time slot grid
    ProtectedRoute.tsx  # Auth route guard
  context/
    AuthContext.tsx      # Auth state provider
  pages/
    HomePage.tsx        # Court listing with search & filter
    CourtDetailPage.tsx # Court info + booking form
    MyBookingsPage.tsx  # User's bookings with cancel
    AuthPage.tsx        # Sign in / sign up / forgot password
    ResetPasswordPage.tsx # Set new password after reset
    ProfilePage.tsx     # User profile & settings
  hooks/
    useBookings.ts      # Supabase booking queries
  data/
    courts.ts           # Static court seed data
  lib/
    supabase.ts         # Supabase client init
  types.ts              # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account

### 1. Clone the repo

```bash
git clone https://github.com/youngNwis31/tennis-court-booker.git
cd tennis-court-booker
npm install
```

### 2. Set up Supabase

Create a new Supabase project, then run this SQL in the SQL Editor:

```sql
create table bookings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  court_id text not null,
  date date not null,
  start_hour integer not null check (start_hour between 7 and 20),
  created_at timestamptz default now() not null,
  unique (court_id, date, start_hour)
);

alter table bookings enable row level security;

create policy "Bookings are viewable by everyone"
  on bookings for select using (true);

create policy "Users can insert own bookings"
  on bookings for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookings"
  on bookings for delete using (auth.uid() = user_id);
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key (found in Settings > API).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Deployment

This app is deployed on Netlify. To deploy your own:

1. Push to GitHub
2. Import the repo on [Netlify](https://app.netlify.com)
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
4. Deploy

## License

MIT
