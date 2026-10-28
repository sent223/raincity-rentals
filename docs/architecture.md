# Architecture Overview: RainCity Rentals

## High-level structure
Browser → Next.js app (pages + API routes) → Prisma → PostgreSQL

## Main modules
| Module | Responsibility |
|---|---|
| Search | Filters vehicles by location, dates, type and price |
| Map | Shows pickup locations and finds the nearest one |
| Booking | Checks availability, calculates price, creates bookings |
| Accounts | Signup, login, roles (renter / company admin) |
| Company dashboard | Fleet, locations and bookings management |

## Technology choices
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js + TypeScript | Frontend and API in one project |
| Styling | Tailwind CSS | Fast, consistent UI |
| Database | PostgreSQL + Prisma | Reliable relational data, type-safe queries |
| Maps | Leaflet + OpenStreetMap | Free, no API key |
| Auth | Auth.js | Standard sessions and login |

## Data model
See [erd.md](erd.md).

## Decisions
See [decisions/](decisions/).
