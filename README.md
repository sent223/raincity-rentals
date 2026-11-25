# 🌧️ RainCity Rentals

**Seattle's car rental marketplace.** Compare vehicles from several local rental companies, pick the pickup location nearest to you, and book with the full price (taxes and fees included) shown up front.

> 🚧 Status: Week 5 of 5, polishing, testing and preparing for deployment.
> All companies, vehicles, prices and accounts in this project are fictional.

<!-- Screenshots and a demo GIF are added in the final week. -->

## Why this project
Renting a car in Seattle means jumping between several company sites to compare prices and pickup locations (Sea-Tac Airport, Downtown, Capitol Hill, Bellevue). RainCity Rentals brings them together on one map-based platform, and gives each company its own dashboard to manage its fleet and bookings.

## Features

**For renters**
- Search vehicles by pick-up and return time, and see only those that are free
- Filter by type, maximum price, seats, transmission, fuel, all-wheel drive and roof rack
- Interactive map of pickup locations, with a "Use my location" button that finds the nearest one
- Full price breakdown: daily rate, airport fee, sales tax and rental car tax (Washington 2026 estimates)
- Sign up, log in, and book in a few clicks. Double bookings are prevented, even when two people book at the same moment
- "My bookings" page with free cancellation until 24 hours before pick-up

**For rental companies**
- Role-based company dashboard: add, edit and hide vehicles
- Bookings view for the company's own vehicles, filterable by status and pick-up date
- Strict separation: a company can only ever see and change its own data, checked on the server

**Quality**
- Unit tests for pricing, dates, availability, cancellation and validation
- GitHub Actions runs lint and tests on every push and pull request
- Responsive layout, keyboard focus outlines, loading and error screens

## Tech stack
| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (Neon) with Prisma 7 |
| Authentication | Auth.js v5 (email and password), bcrypt, JWT sessions |
| Maps | Leaflet with OpenStreetMap |
| Testing | Vitest |
| CI | GitHub Actions |
| Hosting | Vercel (planned) |

## Getting started

Requirements: Node.js 22 or newer and a PostgreSQL database (for example a free Neon project).

```bash
git clone https://github.com/SENT223/raincity-rentals.git
cd raincity-rentals
npm install
```

Create two environment files in the project root (neither is committed):

```bash
cp .env.example .env     # then set DATABASE_URL (and optionally SEED_ADMIN_PASSWORD)
npx auth secret          # creates .env.local with AUTH_SECRET
```

Set up the database and start the app:

```bash
npx prisma generate
npx prisma migrate deploy   # create the tables
npx prisma db seed          # load demo companies, locations, vehicles and bookings
npm run dev
```

Open http://localhost:3000.

### Environment variables
| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `.env` | PostgreSQL connection string |
| `AUTH_SECRET` | `.env.local` | Signs login cookies |
| `SEED_ADMIN_PASSWORD` | `.env` (optional) | Password for the demo company admin accounts. A local development default is used if unset. Always set your own before deploying. |

### Demo accounts
- **Renter:** create one on the Sign up page.
- **Company admins** (created by the seed script):
  - `admin@emeraldcitymotors.example` (Emerald City Motors)
  - `admin@sounddrive.example` (Sound Drive Co.)

### Scripts
| Command | What it does |
|---------|--------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run lint` | Check the code style |
| `npm test` | Run the unit tests |
| `npx prisma db seed` | Reset the demo data |

## Project structure
```
raincity-rentals/
├── app/                 # Pages and routes
│   ├── vehicles/        # Search, detail and booking pages
│   ├── locations/       # Map of pickup locations
│   ├── bookings/        # My bookings and cancellation
│   ├── company/         # Company dashboard (vehicles, bookings)
│   ├── login/, signup/  # Authentication pages
│   └── api/auth/        # Auth.js route
├── components/          # Shared interface components
├── lib/                 # Business rules: pricing, dates, availability, filters
├── prisma/              # Schema, migrations and seed script
├── tests/unit/          # Vitest unit tests
├── docs/                # Design and engineering documentation
├── auth.ts, proxy.ts    # Login setup and route protection
└── .github/workflows/   # CI
```

## Documentation
| Document | Contents |
|----------|----------|
| [Architecture](docs/architecture.md) | Structure and technology choices |
| [Database design](docs/erd.md) | Entity diagram, rules and limitations |
| [Design research](docs/design-research.md) | Reference sites and design direction |
| [Wireframes](docs/wireframes/README.md) | Desktop and mobile layouts |
| [Pricing](docs/pricing.md) | Formula, tax rates and sources |
| [Booking flow](docs/booking.md) | Booking, double-booking protection and cancellation |
| [Authentication](docs/auth.md) | Login design, route protection and security notes |
| [Company dashboard](docs/company-dashboard.md) | Roles, access rules and features |
| [Accessibility](docs/accessibility.md) | Responsive and accessibility checks |
| [Testing](docs/testing.md) | What is tested and why |
| [Decision record](docs/decisions/0001-marketplace-architecture.md) | Why a multi-company marketplace |

## Roadmap
| Week | Focus | Status |
|------|-------|--------|
| 1 | Planning, design, project setup, CI | ✅ Done |
| 2 | Database, seed data, vehicle search, filters, detail page | ✅ Done |
| 3 | Map, nearest location, availability, pricing, booking | ✅ Done |
| 4 | Accounts, route protection, My bookings, company dashboard | ✅ Done |
| 5 | UI polish, tests, end-to-end test, deployment, release | 🚧 In progress |

## Known limitations
- No payments, vehicle photos, email verification or password reset yet
- No rate limiting on login attempts
- Companies can view bookings but cannot cancel or change them
- Tax rates are 2026 estimates, not tax advice (see [Pricing](docs/pricing.md))
- Times are entered and stored as Seattle local time
- Auth.js is now maintained by the Better Auth team, who recommend Better Auth for new projects. Switching is a possible future improvement.

## License
MIT