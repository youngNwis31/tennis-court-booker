# CourtBook - Tennis Court Booking App

A full-stack web application for browsing and booking tennis courts across Metro Manila. Built with React, Supabase, and Tailwind CSS.

**Live Demo:** [courtbook-ph.netlify.app](https://courtbook-ph.netlify.app)

---

## Features

### Core Booking System
- **18 Real Courts** — Browse real tennis courts across Metro Manila with emoji icons, surface type, and pricing in Philippine Peso
- **Time Slot Booking** — Pick a date and book 1-hour slots from 7 AM to 8 PM with real-time availability
- **Booking Countdown** — Live countdown timer to your next upcoming session
- **Calendar View** — Weekly calendar showing all your bookings at a glance
- **My Bookings** — View upcoming and past bookings, cancel anytime
- **Equipment Rental** — Add racket, balls, towel, or water to your booking

### AI-Powered Features
- **AI Playing Tips** — Smart tips based on weather, surface type, and time of day
- **AI Court Recommender Quiz** — 5-question quiz to find your perfect court
- **Smart Price Alerts** — Set a budget and get notified when courts match
- **AI Optimal Slot Finder** — Scores time slots based on your playing patterns
- **Smart Recommendations** — Personalized court suggestions based on booking history

### Social & Gamification
- **Court Reviews & Ratings** — Star ratings and written reviews for each court
- **Player Matchmaking** — Find tennis partners near you
- **Achievement Badges** — 12 unlockable badges for booking milestones
- **Playing Streak Tracker** — Track your weekly playing consistency
- **Share Booking** — Share your confirmed booking via native share or clipboard

### Discovery & Navigation
- **Interactive Map** — Leaflet.js map with pins for all 18 courts and info popups
- **Court Comparison** — Side-by-side comparison of courts
- **City/Area Filter** — Filter by city across Metro Manila
- **Surface Filter** — Filter by hard, clay, or grass courts
- **Distance Sorting** — Sort courts by proximity using device GPS
- **Search** — Search by name, location, or city

### User Experience
- **Dark Mode** — Toggle between light and dark themes with localStorage persistence
- **Multi-Language** — Filipino/English toggle with 50+ translated strings
- **Mobile Responsive** — Hamburger nav, touch-friendly inputs, iOS zoom fix
- **3-Day Weather Forecast** — Real weather data via Open-Meteo API (Celsius)
- **Availability Heatmap** — Visual heatmap of court availability by hour
- **AI Chatbot** — Floating chat assistant for court recommendations and FAQs

### Auth & Security
- **Supabase Auth** — Email/password + Google OAuth sign-in
- **Password Reset** — Forgot password flow via email link
- **Row-Level Security** — Users can only modify their own bookings (enforced at database level)
- **Protected Routes** — Auth guard on booking, profile, and analytics pages

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Routing** | React Router v7 |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **Map** | Leaflet.js + react-leaflet |
| **Weather** | Open-Meteo API (free, no key) |
| **Hosting** | Netlify (auto-deploy from GitHub) |

---

## Project Structure

```
src/
  components/
    Achievements.tsx        # 12 achievement badges with unlock logic
    AvailabilityHeatmap.tsx  # Visual hourly availability grid
    BookingCountdown.tsx     # Live countdown to next booking
    ChatBot.tsx             # Floating AI chat assistant
    CourtCard.tsx           # Court listing card with emoji + gradient
    EquipmentRental.tsx     # Add-on equipment selector
    FavoriteButton.tsx      # Heart toggle with localStorage
    Navbar.tsx              # Desktop + mobile hamburger nav
    OptimalSlotFinder.tsx   # AI time slot scoring
    PlayingTips.tsx         # AI tips based on weather/surface
    PriceAlert.tsx          # Budget-based court search
    ProtectedRoute.tsx      # Auth route guard
    ReviewSection.tsx       # Court review list + form
    ReviewSummary.tsx       # Aggregated review stats
    ShareBooking.tsx        # Share via Web Share API / clipboard
    SmartRecommendations.tsx # Personalized court suggestions
    StarRating.tsx          # Star rating display component
    StreakTracker.tsx        # Weekly playing streak tracker
    TimeSlotPicker.tsx      # Hourly time slot grid
    Toast.tsx               # Toast notification provider
    WeatherBanner.tsx       # 3-day weather forecast display
  context/
    AuthContext.tsx          # Supabase auth state provider
    LanguageContext.tsx      # Filipino/English i18n provider
    ThemeContext.tsx         # Dark mode provider
  pages/
    AnalyticsPage.tsx       # Stats dashboard with charts + badges
    AuthPage.tsx            # Sign in / sign up
    CalendarPage.tsx        # Weekly booking calendar
    ComparePage.tsx         # Side-by-side court comparison
    CourtDetailPage.tsx     # Court info + booking form
    FavoritesPage.tsx       # Saved courts page
    HomePage.tsx            # Hero + filters + court grid
    MapPage.tsx             # Interactive Leaflet map
    MatchmakingPage.tsx     # Player matchmaking
    MyBookingsPage.tsx      # User's bookings list
    ProfilePage.tsx         # User profile & settings
    QuizPage.tsx            # AI court recommender quiz
    ResetPasswordPage.tsx   # Password reset form
  hooks/
    useBookings.ts          # Supabase booking queries
    useFavorites.ts         # localStorage favorites
    useRecommendations.ts   # AI recommendation logic
    useReviews.ts           # Supabase review queries
    useWeather.ts           # Open-Meteo weather fetcher
  data/
    courts.ts               # 18 real Metro Manila courts
  lib/
    supabase.ts             # Supabase client init
  types.ts                  # TypeScript interfaces
```

---

## Development Log

A chronological system log of how CourtBook was built from scratch.

### Phase 1 — Foundation `[2026-06-03]`

```
[INIT]    Scaffolded React 19 + TypeScript + Vite project
[FEAT]    Built core booking system: 6 courts, time slot picker, Supabase auth
[FEAT]    Added email/password + Google OAuth sign-in
[FEAT]    Row-level security policies on bookings table
[DEPLOY]  Configured Netlify SPA routing (_redirects)
[FEAT]    Added forgot password flow + user profile page
[FEAT]    Built floating FAQ chatbot widget
```

### Phase 2 — AI Features & Smart Tools `[2026-06-03]`

```
[FEAT]    Integrated Open-Meteo weather API (3-day forecast, Celsius)
[FEAT]    Added court reviews & star ratings with Supabase
[FEAT]    Built smart recommendation engine based on booking history
[FEAT]    Upgraded chatbot to AI-powered with conversational booking
[FEAT]    Added availability heatmap for visual slot analysis
[FEAT]    Built court comparison tool (side-by-side)
[FEAT]    Added player matchmaking system
```

### Phase 3 — Gamification & Analytics `[2026-06-03]`

```
[FEAT]    Implemented dark mode with localStorage persistence
[FEAT]    Created 12 achievement badges with unlock logic
[FEAT]    Built analytics dashboard with bar/pie charts
[FEAT]    Added interactive Leaflet.js map with court pins
```

### Phase 4 — Philippine Localization `[2026-06-04]`

```
[REFACTOR] Replaced all dummy courts with real Philippine tennis courts
[REFACTOR] Switched currency to Philippine Peso (₱) and temp to Celsius (°C)
[FEAT]     Expanded to 18 real courts across 12 Metro Manila cities
[FEAT]     Added city/area filter for Metro Manila regions
[FEAT]     Added GPS-based distance sorting
[FEAT]     Built toast notification system
```

### Phase 5 — AI Power-Ups `[2026-06-04]`

```
[FEAT]    Built AI optimal slot finder (scores slots by user patterns)
[FEAT]    Created 5-question court recommender quiz
[FEAT]    Added smart price alerts with budget slider
[FEAT]    Built weekly playing streak tracker
```

### Phase 6 — Mobile & Accessibility `[2026-06-04]`

```
[FEAT]    Added calendar view (responsive: 2-col mobile, 7-col desktop)
[FEAT]    Built favorites system with localStorage
[FEAT]    Added AI playing tips (weather + surface + time aware)
[FEAT]    Built share booking via Web Share API
[FEAT]    Added mobile hamburger navigation menu
[FEAT]    Added Filipino/English language toggle (50+ strings)
[FEAT]    Built equipment rental add-on (racket, balls, towel, water)
[FEAT]    Added live booking countdown timer
[FIX]     Fixed iOS input zoom, touch targets, and responsive layouts
```

### Phase 7 — Cleanup & Final Deploy `[2026-06-19]`

```
[FIX]     Removed broken external photo URLs (Unsplash, Wikimedia)
[DELETE]  Removed satellite view feature (SatelliteView.tsx, satellite.ts)
[DELETE]  Removed photo gallery component (PhotoGallery.tsx)
[REFACTOR] Replaced all court images with emoji icons on gradient backgrounds
[REFACTOR] Removed photos field from Court type — cleaner data model
[FIX]     Fixed TypeScript build errors (unused imports with verbatimModuleSyntax)
[DEPLOY]  Pushed final cleanup to GitHub — auto-deployed to Netlify
```

### Build Summary

| Metric | Value |
|--------|-------|
| Total Commits | 19 |
| Source Files | 50+ |
| Features Shipped | 30+ across 7 phases |
| Courts | 18 real Metro Manila venues |
| Languages | 2 (English + Filipino) |
| External APIs | 2 (Supabase, Open-Meteo) |
| Hosting | Netlify (auto-deploy) |

---

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

create table reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  court_id text not null,
  rating integer not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz default now() not null
);

alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select using (true);

create policy "Users can insert own reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on reviews for delete using (auth.uid() = user_id);
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase project URL and anon key (found in Settings > API):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment

This app auto-deploys to Netlify on every push to `main`.

1. Push to GitHub
2. Import the repo on [Netlify](https://app.netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Deploy — every future push to `main` triggers an automatic redeploy

---

## Author

**James Earl Medrano**

---

## License

MIT
