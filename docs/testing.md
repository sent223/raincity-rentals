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

## Not covered by unit tests
- Pages and visual layout
- Database queries themselves (covered by the rules that build them and by
  the end-to-end test of the booking journey)
  