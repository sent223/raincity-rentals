# User Stories: RainCity Rentals

## User Roles
- **Renter:** a visitor or customer looking to rent a car in the Seattle area
- **Company admin:** an employee of a rental company who manages that company's fleet
- **Platform admin** (stretch goal): manages the whole marketplace

## Renter stories

###R1: Search by pickup location and dates
As a renter, I want to enter a pickup location and dates so that I only see
cars available when I need them.
**Acceptance criteria**
- [ ] I can choose a pickup location from a list or the map
- [ ] I can choose pickup and return date/time
- [ ] Return date cannot be before pickup date
- [ ] Results only show vehicles with no overlapping booking

### R2: Filter Vehicles
As a renter, I want to filter by type, price, seats, transmission and fuel
type so that I can find a car that fits my trip.
**Acceptance criteria**
- [ ] Filters for type, price range, seats, transmission, EV/hybrid/AWD
- [ ] Results update without a full page reload
- [ ] A clear "reset filters" button

### R3: View pickup locations on a map
 As a renter, I want to see pickup locations on a map so that I can choose
one close to me (for example Sea-Tac Airport or Downtown).
**Acceptance criteria**
- [ ] Map shows a marker per location
- [ ] Clicking a marker shows the location name and available vehicles
- [ ] Map works on mobile

### R4: Find the nearest location
As a renter, I want the app to find the closest pickup location to me so that
I save travel time.
**Acceptance criteria**
- [ ] Browser asks for location permission
- [ ] Nearest location is highlighted with distance
- [ ] If permission is denied, the app still works with manual selection

### R5: See clear pricing
As a renter, I want to see the full price before booking so that there are
no surprises.
**Acceptance criteria**
- [ ] Price shows daily rate x days, taxes, fees and total
- [ ] Price updates when I change dates

### R6: Book a vehicle
As a renter, I want to book a vehicle so that it is reserved for me.
**Acceptance criteria**
- [ ] I must be logged in to confirm a booking
- [ ] The vehicle cannot be double-booked
- [ ] I see a confirmation page with a booking reference

### R7: Manage my bookings
As a renter, I want to view and cancel my bookings so that I stay in control
of my plans.
**Acceptance criteria**
- [ ] "My bookings" lists upcoming and past bookings
- [ ] I can cancel an upcoming booking
- [ ] Cancelled bookings free up the vehicle

## company admin stories

### C1: Manage fleet
 As a company admin, I want to add, edit and remove vehicles so that
customers see an accurate fleet.
**Acceptance criteria**
- [ ] Form to add a vehicle (make, model, year, type, price, seats, photo)
- [ ] I can only edit my own company's vehicles

### C2: Manage locations
As a company admin, I want to manage my pickup locations so that renters
can find them on the map.
**Acceptance criteria**
- [ ] Add a location with name, address and coordinates
- [ ] Assign vehicles to a location

### C3: View bookings
As a company admin, I want to see bookings for my vehicles so that I can
prepare them for pickup.
**Acceptance criteria**
- [ ] List of bookings with renter, dates, vehicle and status
- [ ] Filter by date and status

## Out of Scope for v1
Real payments, insurance options, driver licence verification, reviews,
multi-language support.