# Testing Checklist

Use this checklist before demoing, submitting, or deploying Swim Lessons Katy. Run these tests with a fresh browser session and again on a mobile viewport.

## Public Pages Load

- Visit `/`.
- Visit `/about`.
- Visit `/lessons`.
- Visit `/book`.
- Visit `/login`.
- Confirm each page loads without console errors.
- Confirm primary buttons and links navigate to the expected routes.

## English/Chinese Switch Works

- Open the homepage.
- Click `中文`.
- Confirm navbar, public page headings, buttons, FAQ/policy text, booking labels, and footer text switch to Chinese.
- Refresh the page and confirm Chinese remains selected.
- Click `English`.
- Confirm text switches back to English and remains after refresh.
- Repeat on `/about`, `/lessons`, `/book`, `/login`, and `/account` if logged in.

## Guest Booking Works

- Open `/book` while logged out.
- Select an available slot.
- Fill parent name, email, phone, swimmer name, age, number of students, skill level, and comments.
- Submit the form.
- Confirm a polished success message appears.
- Confirm no private booking details are shown on the public calendar.

## Parent Signup/Login Works

- Open `/login`.
- Create a parent account with name, email, phone, and password.
- Confirm the account can log in.
- Confirm the logged-in parent is redirected to `/account`.
- Sign out.
- Log back in with the same account.

## Parent Can Create Swimmer Profile

- Log in as a parent.
- Open `/account`.
- Add a swimmer profile with name, age, skill level, and notes.
- Confirm the saved swimmer appears in the saved swimmers section.
- Confirm no admin notes are visible.

## Parent Can Book With Saved Swimmer

- Log in as a parent with at least one saved swimmer.
- Open `/book`.
- Select an available slot.
- Choose the saved swimmer from the returning parent shortcut.
- Confirm the booking form is prefilled.
- Submit the booking.
- Confirm the booking appears in `/account` under upcoming bookings.

## Booked Slot Becomes Disabled/Unavailable

- Book an available slot.
- Return to `/book`.
- Confirm the slot remains visible.
- Confirm the slot is gray/shaded, labeled booked or unavailable, and disabled.
- Confirm it cannot be clicked or submitted again.

## Two Instructors Can Have the Same Time Slot

- As an admin, create an availability slot for Eric at a future date/time.
- Create another availability slot for Instructor 2 at the same future date/time.
- Open `/book`.
- Confirm both slots appear in the same weekly calendar time period.
- Confirm Eric is blue and Instructor 2 is green.

## Booking Eric Does Not Block Instructor 2

- With matching Eric and Instructor 2 slots at the same time, book Eric's slot.
- Return to `/book`.
- Confirm Eric's slot is gray/disabled.
- Confirm Instructor 2's matching slot is still green and available.

## Same Slot Cannot Be Booked Twice

- Book one available slot.
- Attempt to submit another booking for the exact same slot from another browser/session.
- Confirm the second booking is rejected with an unavailable-slot message.
- Confirm the database has only one active booking for that slot.

## Parent Cannot Access Admin Pages

- Log in as a user with `role = 'parent'`.
- Manually visit `/admin`.
- Manually visit `/admin/availability`.
- Manually visit `/admin/bookings`.
- Manually visit `/admin/swimmers`.
- Confirm each route redirects to `/account` or blocks access.
- Confirm the Admin Dashboard link is not visible in the navbar.

## Admin Can Access Admin Pages

- Change a trusted user to `role = 'admin'` in Supabase `profiles`.
- Log in as that user.
- Confirm the Admin Dashboard link appears in the navbar.
- Visit `/admin`, `/admin/availability`, `/admin/bookings`, and `/admin/swimmers`.
- Confirm each route loads.

## Admin Can Add Availability

- Log in as admin.
- Open `/admin/availability`.
- Add a future one-hour slot for Eric.
- Add a future one-hour slot for Instructor 2.
- Confirm both slots appear in the upcoming slots list.
- Confirm the public `/book` calendar shows the new slots.

## Admin Can View Bookings

- Log in as admin.
- Open `/admin/bookings`.
- Confirm bookings show date/time, instructor, parent name, swimmer name, phone/email, skill level, number of students, comments, and status.
- Test upcoming/past, instructor, and status filters.

## Admin Can View Swimmers

- Log in as admin.
- Open `/admin/swimmers`.
- Confirm swimmer cards show parent contact, age, skill level, total lessons, recent/upcoming lessons, and private note status.
- Open an individual swimmer record.
- Confirm lesson history and parent contact info are visible.

## Admin Notes Are Private

- Log in as admin.
- Open a swimmer record and add a private note.
- Log out.
- Log in as the parent for that swimmer.
- Open `/account`.
- Confirm the parent cannot see the private admin note.
- Confirm the parent cannot open any `/admin` route.

## Mobile Layout Works

- Test at a mobile viewport around 390px wide.
- Confirm the navbar scrolls or wraps without clipping.
- Confirm English and Chinese text fit without overlapping.
- Confirm booking slot cards are easy to tap.
- Confirm the booking form fields are full-width and readable.
- Confirm account cards, admin cards, and tables collapse into usable mobile cards where applicable.
- Confirm focus states are visible when tabbing through links, buttons, and form fields.
