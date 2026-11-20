# Company Dashboard

Company admins manage their own fleet at `/company/vehicles`.

## Access rules
- Logged-out visitors are redirected to login (`proxy.ts`).
- Only users with the `COMPANY_ADMIN` role and a company can open the pages.
  Everyone else sees "not found".
- The role is read from the database on every request, not from the cookie.
- Every query and update is filtered by the admin's company, so one company
  can never see or change another company's vehicles. Pickup locations must
  also belong to the admin's company.

## What admins can do
- Add a vehicle (validated on the server: year, seats, rate between $10 and $2,000)
- Edit a vehicle (existing bookings keep their original price)
- Hide or show a vehicle in search. Vehicles are hidden, not deleted, so
  booking history stays intact. A vehicle with upcoming confirmed bookings
  cannot be hidden.

## Demo accounts (created by `npx prisma db seed`)
| Company | Email |
|---------|-------|
| Emerald City Motors | admin@emeraldcitymotors.example |
| Sound Drive Co. | admin@sounddrive.example |

The password comes from `SEED_ADMIN_PASSWORD`. If it is not set, a local
development default is used. Always set your own value before deploying.

## Known limitations (v1)
- No vehicle photos yet
- Company admins cannot add or edit pickup locations
- Admin accounts are created by the seed script, not through sign-up