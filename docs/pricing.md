# Pricing

Prices are calculated in whole cents by `lib/pricing.ts`.

## Formula
- Rental days = hours between pick-up and return divided by 24, rounded up
  (any extra hours count as another day)
- Subtotal = daily rate x days
- Airport fee = subtotal x 11.1% (airport pickups only)
- Sales tax = subtotal x 10.35%
- Rental car tax = subtotal x 13.7%
- **Total = subtotal + airport fee + sales tax + rental car tax**

Each amount is rounded to the nearest cent.

## Rates used (estimates for a demo)
| Item | Rate | Basis |
|------|------|-------|
| Sales tax | 10.35% | Seattle combined state, local and transit rate in the 2026 Washington Department of Revenue guidance |
| Rental car tax | 13.7% | 11.9% state (2026) + 1% King County + 0.8% transit |
| Airport fee | 11.1% | Commonly reported Sea-Tac concession recovery fee (estimate) |

The state rental car tax is scheduled to drop to 9.9% in 2027, so the rates
live in one object (`PRICING`) to make updates easy.

## Known simplifications
- One Seattle sales tax rate is used for every location (Bellevue differs)
- The airport per-day facility charge and vehicle license fee are not included
- Rates are estimates and not tax advice

## Server-side rule
The booking step (Day 5) recalculates the price on the server. A price shown
in the browser is never trusted.