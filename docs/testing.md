# Testing

Run all tests with `npm test` (or `npm run test:watch` while developing).
They also run on every push and pull request in GitHub Actions.

## What the unit tests cover (Vitest, `tests/unit`)
| File | What it protects |
|------|------------------|
| `pricing.test.ts` | Price maths in whole cents: taxes, airport fee, rounding, totals |
| `dates.test.ts` | Date validation, 30-day limit, rental days, Seattle clock and daylight saving |
| `bookings.test.ts` | Booking status and the 24-hour free cancellation rule |
| `availability.test.ts` | Overlap rule: back-to-back bookings are allowed |
| `vehicle-form.test.ts` | Server-side validation of the company vehicle form |
| `booking-filters.test.ts` | Status and date filters on the company bookings page |
| `helpers.test.ts` | Safe redirects, distances, price and label formatting |

## Design choices
- Tests use fixed dates (the clock is frozen), so they pass on any day.
- Rules are tested without a database, so they run in about a second and
  need no secrets in CI. The database client is replaced by an empty stand-in.
- The tax rates are pinned in `pricing.test.ts`. Changing a rate means
  updating the test and `docs/pricing.md` together on purpose.

## End-to-end tests (Playwright, `tests/e2e`)
Run with `npm run test:e2e`. The tests drive a real browser against the running app and the development database.

| File | Journey |
|------|---------|
| `booking-journey.spec.ts` | Sign up, search by date, check the price, book, view in My bookings, cancel, and confirm the vehicle is free again |
| `access-control.spec.ts` | Logged-out visitors are redirected to login. A company admin sees only their own vehicles and bookings |

- A global setup step runs `npx prisma db seed` first, so every run starts from the same demo data. **This resets bookings in the database it is pointed at.**
- Each run creates its own test user with a unique email.
- Booking dates are computed 90 days ahead, so the tests never go stale.
- These tests run locally. CI runs lint and unit tests only, because the browser tests need database credentials.

## Not covered by automated tests
- Visual layout and styling
- The map (it relies on third-party map tiles)
- Screen readers and Lighthouse scores (checked by hand, see `accessibility.md`)

## Future improvements
- Point the end-to-end tests at a separate test database (for example a Neon branch) and run them in CI
- Clean up the `e2e.*@example.com` test users automatically