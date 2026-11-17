# Authentication

Built with Auth.js v5 (`next-auth@beta`), using the Credentials provider
(email and password) and signed JWT cookie sessions.

## Why Auth.js
It connects directly to the existing `users` table (password hash, role,
company) with no extra tables. Note: the Auth.js project is now maintained by
the Better Auth team, who recommend Better Auth for new projects. Moving to
Better Auth is a possible future improvement.

## How it works
- **Sign-up** (`/signup`): validates input, hashes the password with bcrypt
  (cost 12), creates a `RENTER` user, then signs the user in.
- **Login** (`/login`): checks the password with bcrypt and sets a session cookie.
- **Log out**: from the navbar.
- The session carries `id`, `role` and `companyId`, used for permissions.

## Security notes
- Passwords are never stored or logged in plain text
- Passwords must be 8 to 72 characters (bcrypt reads only 72)
- Redirects after login are limited to pages on this site
- The session secret lives in `.env.local` (`AUTH_SECRET`) and is not committed

## Known limitations (v1)
- No email verification or password reset
- No rate limiting on login attempts
- The sign-up form tells people when an email is already registered
- The seeded demo renter has no usable password, so it cannot log in