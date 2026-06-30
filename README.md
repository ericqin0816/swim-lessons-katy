# Swim Lessons Katy

## Project Overview

Swim Lessons Katy is a full-stack scheduling and swimmer management platform for a local private swim lesson business in Katy, Texas. It supports public lesson discovery, instructor-specific booking, parent accounts, saved swimmer profiles, bilingual English/Chinese UI, booking history, and admin tools for running the business.

This project was built as a real-world web application, not a static mockup. It models the actual scheduling needs of a swim teaching business where two instructors share one pool, both instructors can teach at the same time, and each one-hour lesson costs $35.

## Problem Solved

Small lesson businesses often manage bookings through texts, spreadsheets, and manual calendar checks. That creates confusion when multiple instructors share the same location, especially if two instructors are available at the same time.

This app solves that by making availability instructor-specific. Booking Eric at 9:00 AM only reserves Eric's slot. Instructor 2 can still remain available at 9:00 AM until that separate slot is booked. The database booking function locks the selected slot and prevents two families from reserving the same instructor slot.

## Target Users

- Parents looking for private swim lessons in the Katy, TX area
- Returning families who want to reuse saved swimmer information
- New swimmers, beginners, intermediate swimmers, and advanced stroke swimmers
- Swim instructors who need simple availability management
- Business admins who need booking history, private swimmer records, parent contact information, and lesson notes

## Key Features

- Public pages for Home, About, Lessons/Pricing, Book, Login, Account, and Admin
- Weekly booking calendar with instructor-specific availability
- Eric slots shown in blue and Instructor 2 slots shown in green
- Booked and unavailable slots remain visible but disabled
- Guest booking support for parents who do not have accounts yet
- Parent signup/login with Supabase Auth
- Saved swimmer profiles for faster returning bookings
- Parent dashboard with upcoming and past bookings
- Booking form for parent contact info, swimmer name, age, skill level, number of students, and comments
- Comments field for siblings, two-swimmer requests, fear of water, stroke goals, schedule notes, and special situations
- Admin dashboard with summary cards and quick links
- Admin availability manager
- Admin bookings view with filters
- Private swimmer database with parent contact info, lesson history, total lessons, and admin-only notes
- Bilingual English/Chinese public UI with persistent localStorage language preference
- Mobile-friendly layouts, empty states, loading states, and error messages

## Technical Features

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres database
- Supabase Row Level Security policies
- Server Actions for auth, booking, saved swimmer profiles, and admin workflows
- Server-side admin route protection
- Supabase middleware/proxy session handling
- Transaction-safe booking function for conflict prevention
- Vercel-ready build and environment variable setup
- Demo availability fallback when Supabase is not configured

## Database Design

The database is organized around the real workflow of a swim lesson business:

- `profiles`: authenticated user profile data, phone number, and role (`parent` or `admin`)
- `instructors`: instructor records, names, display color, bio, and active status
- `swimmers`: parent-linked swimmer profiles with age, skill level, contact info, comments, and admin-only notes
- `availability_slots`: one-hour instructor-specific time slots
- `bookings`: confirmed lesson bookings tied to an availability slot and swimmer
- `lesson_notes`: private admin notes tied to swimmers and bookings

The schema is stored in `supabase/schema.sql` and includes tables, foreign keys, seed instructors, sample availability, RLS policies, and helper functions.

## Authentication and Role-Based Access

Supabase Auth handles user accounts. The app stores role information in the `profiles` table:

- `role = 'parent'`: normal parent account
- `role = 'admin'`: admin access

Admin links are hidden from non-admin users, but the important protection is server-side. The `/admin`, `/admin/availability`, `/admin/bookings`, and `/admin/swimmers` routes are protected by the admin layout and middleware/proxy logic. Logged-out users are redirected to `/login`; non-admin users are redirected to `/account`.

## Booking Conflict Prevention

The app prevents duplicate bookings with database-level logic. The `book_lesson(...)` function locks the selected availability slot, verifies that it is still open and in the future, creates or reuses the swimmer record, inserts the booking, and marks the slot as booked.

This matters because UI-only checks are not enough. If two parents submit the same slot at nearly the same time, the database function is the final source of truth and prevents the second booking from succeeding.

## Bilingual Support

The public-facing UI supports English and Chinese through a shared translation dictionary in `src/lib/i18n.ts`.

- The navbar includes an English / 中文 toggle.
- The selected language is stored in localStorage.
- Routes and database values stay the same across languages.
- Stable database values remain English keys/codes, while UI labels are translated for parents.
- Admin pages currently remain English because they are internal business tools.

## Admin Dashboard

The admin area is designed for daily business operations:

- Summary cards for upcoming bookings, available slots, booked slots, and total swimmers
- Quick links to availability, bookings, and swimmers
- Availability management for Eric and Instructor 2
- Bookings table with date/time, instructor, parent, swimmer, phone/email, skill level, number of students, comments, and status
- Private swimmer database with total lessons, recent/upcoming lessons, parent contact info, and admin notes

## Privacy/Safety Considerations

The app handles private family and swimmer information, so security and privacy are core design requirements:

- Parents can only see their own swimmers and bookings.
- Public visitors can see available future slots and instructor names, but not private booking details.
- Admin-only notes are never shown to parents.
- RLS policies protect database access at the Supabase level.
- Admin routes are protected server-side, not only hidden in the UI.
- The app only collects information needed for scheduling and teaching lessons.
- Comments are intended for lesson planning details such as comfort level, goals, siblings, and safety concerns.

## How to Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run checks:

```bash
npm run lint
npm run build
```

Without Supabase environment variables, the booking page can show demo availability so the UI can be previewed. Real auth, saved swimmers, bookings, and admin workflows require Supabase setup.

## Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Open `supabase/schema.sql` in this repo.
4. Copy the full SQL file, paste it into the SQL Editor, and run it.
5. Create a user account on the website through Login -> Create account.
6. Open Supabase Table Editor -> `profiles`.
7. Find the new user's profile row.
8. Change `role` from `parent` to `admin` for trusted admin users only.

The schema file creates:

- Tables
- Foreign keys
- Row Level Security policies
- Booking/admin helper functions
- Seed data for Eric and Instructor 2
- Sample future availability slots

In Supabase Auth settings, configure callback URLs:

```text
http://localhost:3000/auth/callback
https://your-vercel-domain.vercel.app/auth/callback
```

You can also promote a user with SQL:

```sql
update public.profiles
set role = 'admin'
where id = 'USER_UUID_HERE';
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DB_CONNECTION_STRING=your_supabase_pooler_or_database_connection_string
```

Use the same public Supabase values in Vercel Project Settings. Keep database connection strings and service credentials private.

## Testing Checklist

See `TESTING.md` for a full manual QA checklist.

Core checks:

- Public pages load in English and Chinese
- Guest booking works
- Parent signup/login works
- Parents can save swimmer profiles
- Returning parents can book with saved swimmers
- Booked slots become disabled/unavailable
- Eric and Instructor 2 can have the same time slot
- Booking one instructor does not block the other instructor at the same time
- The same slot cannot be booked twice
- Parent users cannot access admin pages
- Admin users can manage availability, bookings, swimmers, and notes
- Mobile layout works

## Known Limitations

- No online payment yet
- No recurring weekly booking yet
- No parent self-service rescheduling/cancellation yet
- No automated email/SMS reminders yet
- Admin pages are currently English-only
- Branding, real instructor photos, and final business contact details are placeholders
- Production deployment still needs real domain, final Supabase URLs, and final business policies

## Future Improvements

- Stripe or Square payments
- Email and SMS confirmations
- Automated lesson reminders
- Google Calendar sync for instructors
- Parent rescheduling and cancellation tools
- Recurring weekly lessons
- Waitlist or preferred-time requests
- Instructor-specific admin accounts
- Better analytics for lesson volume, retention, and swimmer progress
- Final brand identity, photography, and production copy

## What I Learned

This project helped me practice building a full-stack application around a real business workflow. I learned how to model scheduling logic in a relational database, protect private family data with row level security, design role-based user experiences, and prevent race conditions such as double booking.

I also learned that production readiness is not only about code working. Parents need clear mobile booking, readable instructions, helpful empty states, and privacy reassurance. Admins need fast access to the information they use every day. A strong app connects the database, security model, and user experience into one system that feels dependable.

## Deployment

This project is ready for Vercel:

```bash
npm run build
```

Then import the repository into Vercel and add the Supabase environment variables.
