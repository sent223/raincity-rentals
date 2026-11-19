# Booking Flow

1. **Detail page:** the renter chooses dates. If the vehicle is free, the
   price summary and an active **Book now** button appear.
2. **Review page** (`/vehicles/[id]/book`): shows the trip, price and a terms checkbox.
3. **Confirm:** the `createBooking` server action saves the booking.
4. **Confirmation page** (`/bookings/[reference]`): shows the saved booking and reference.

## Preventing double bookings
Inside one database transaction the server:
1. locks the vehicle's row (`SELECT ... FOR UPDATE`),
2. re-checks that no confirmed booking overlaps the dates,
3. saves the booking.

If two renters confirm the same vehicle at the same moment, one booking is
saved and the other renter sees a "just booked" message. The submit button
also disables itself after the first click.

## Server-side checks
The server never trusts values from the browser. It re-parses the dates,
re-reads the vehicle and recalculates the price before saving.

## Known limitations (v1)
- Booking requires an account, and a confirmation page is visible only to its owner
- No payment step (Stripe is a stretch goal)
- Cancellation is added with "My bookings" in Week 4

## My bookings and cancellation
- `/bookings` lists the signed-in user's bookings as Upcoming, In progress,
  Completed or Cancelled. "Completed" is worked out from the return time.
- Free cancellation is allowed until 24 hours before pick-up. The rule lives
  in `lib/bookings.ts` and is enforced by the `cancelBooking` server action,
  not just the page.
- Cancelling shows a confirmation page first, then sets the status to
  `CANCELLED`. Cancelled bookings are ignored by the availability check, so
  the vehicle can be booked again immediately.
- Only the owner can view or cancel a booking.
- "Now" is the current time on a Seattle clock, matching how booking times
  are stored.