import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type VehicleInput = Prisma.VehicleCreateManyInput;

function car(
  companyId: number,
  locationId: number,
  make: string,
  model: string,
  year: number,
  type: VehicleInput["type"],
  seats: number,
  transmission: VehicleInput["transmission"],
  fuelType: VehicleInput["fuelType"],
  hasAwd: boolean,
  hasRoofRack: boolean,
  dailyRateCents: number,
): VehicleInput {
  return {
    companyId,
    locationId,
    make,
    model,
    year,
    type,
    seats,
    transmission,
    fuelType,
    hasAwd,
    hasRoofRack,
    dailyRateCents,
  };
}

async function main() {
  // Clear existing demo data (children first, then parents)
  await prisma.booking.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.location.deleteMany();
  await prisma.company.deleteMany();

  // Companies (fictional)
  const emerald = await prisma.company.create({
    data: {
      name: "Emerald City Motors",
      slug: "emerald-city-motors",
      description: "Everyday cars and SUVs for getting around Seattle.",
      contactEmail: "hello@emeraldcitymotors.example",
    },
  });
  const sound = await prisma.company.create({
    data: {
      name: "Sound Drive Co.",
      slug: "sound-drive-co",
      description: "Electric and all-wheel-drive vehicles for Pacific Northwest trips.",
      contactEmail: "hello@sounddrive.example",
    },
  });

  // Locations (illustrative addresses, approximate coordinates)
  const eSeaTac = await prisma.location.create({
    data: {
      companyId: emerald.id,
      name: "Sea-Tac Airport",
      address: "17801 International Blvd",
      city: "SeaTac",
      zip: "98158",
      latitude: 47.4435,
      longitude: -122.3017,
      isAirport: true,
    },
  });
  const eDowntown = await prisma.location.create({
    data: {
      companyId: emerald.id,
      name: "Downtown Seattle",
      address: "1200 5th Ave",
      zip: "98101",
      latitude: 47.6094,
      longitude: -122.333,
    },
  });
  const eBellevue = await prisma.location.create({
    data: {
      companyId: emerald.id,
      name: "Bellevue",
      address: "10500 NE 8th St",
      city: "Bellevue",
      zip: "98004",
      latitude: 47.6176,
      longitude: -122.1999,
    },
  });
  const sCapitolHill = await prisma.location.create({
    data: {
      companyId: sound.id,
      name: "Capitol Hill",
      address: "1400 E Pine St",
      zip: "98122",
      latitude: 47.615,
      longitude: -122.315,
    },
  });
  const sBallard = await prisma.location.create({
    data: {
      companyId: sound.id,
      name: "Ballard",
      address: "5400 Leary Ave NW",
      zip: "98107",
      latitude: 47.6687,
      longitude: -122.38,
    },
  });
  const sSeaTac = await prisma.location.create({
    data: {
      companyId: sound.id,
      name: "Sea-Tac Airport",
      address: "17801 International Blvd",
      city: "SeaTac",
      zip: "98158",
      latitude: 47.444,
      longitude: -122.301,
      isAirport: true,
    },
  });

  // Vehicles: company, location, make, model, year, type, seats,
  // transmission, fuel, AWD, roof rack, daily rate in cents
  const e = emerald.id;
  const s = sound.id;
  await prisma.vehicle.createMany({
    data: [
      // Emerald City Motors
      car(e, eSeaTac.id, "Toyota", "Corolla", 2024, "COMPACT", 5, "AUTOMATIC", "GAS", false, false, 5200),
      car(e, eDowntown.id, "Honda", "Civic", 2023, "COMPACT", 5, "AUTOMATIC", "GAS", false, false, 5500),
      car(e, eBellevue.id, "Toyota", "Camry", 2024, "SEDAN", 5, "AUTOMATIC", "HYBRID", false, false, 6400),
      car(e, eSeaTac.id, "Toyota", "RAV4", 2024, "SUV", 5, "AUTOMATIC", "HYBRID", true, true, 7900),
      car(e, eDowntown.id, "Honda", "CR-V", 2023, "SUV", 5, "AUTOMATIC", "GAS", true, false, 7600),
      car(e, eBellevue.id, "Ford", "Escape", 2023, "SUV", 5, "AUTOMATIC", "GAS", true, false, 7200),
      car(e, eDowntown.id, "Chevrolet", "Malibu", 2022, "SEDAN", 5, "AUTOMATIC", "GAS", false, false, 5800),
      car(e, eSeaTac.id, "Ford", "F-150", 2023, "TRUCK", 5, "AUTOMATIC", "GAS", true, false, 10500),
      car(e, eBellevue.id, "Chrysler", "Pacifica", 2023, "VAN", 7, "AUTOMATIC", "HYBRID", false, false, 11500),
      car(e, eDowntown.id, "Kia", "Rio", 2022, "ECONOMY", 5, "MANUAL", "GAS", false, false, 4200),
      // Sound Drive Co.
      car(s, sCapitolHill.id, "Tesla", "Model 3", 2024, "EV", 5, "AUTOMATIC", "ELECTRIC", false, false, 9500),
      car(s, sSeaTac.id, "Tesla", "Model Y", 2024, "EV", 5, "AUTOMATIC", "ELECTRIC", true, false, 11000),
      car(s, sBallard.id, "Nissan", "Leaf", 2023, "EV", 5, "AUTOMATIC", "ELECTRIC", false, false, 6500),
      car(s, sCapitolHill.id, "Hyundai", "Ioniq 5", 2024, "EV", 5, "AUTOMATIC", "ELECTRIC", true, false, 10200),
      car(s, sBallard.id, "Chevrolet", "Bolt EUV", 2023, "EV", 5, "AUTOMATIC", "ELECTRIC", false, false, 6900),
      car(s, sSeaTac.id, "Subaru", "Outback", 2024, "SUV", 5, "AUTOMATIC", "GAS", true, true, 8800),
      car(s, sBallard.id, "Subaru", "Forester", 2023, "SUV", 5, "AUTOMATIC", "GAS", true, true, 8400),
      car(s, sCapitolHill.id, "Toyota", "4Runner", 2023, "SUV", 5, "AUTOMATIC", "GAS", true, true, 12500),
      car(s, sSeaTac.id, "Jeep", "Wrangler", 2023, "SUV", 5, "MANUAL", "GAS", true, true, 11800),
      car(s, sBallard.id, "Toyota", "Prius", 2024, "COMPACT", 5, "AUTOMATIC", "HYBRID", false, false, 6200),
    ],
  });

    // Demo renter and bookings, used to test availability
  const renter = await prisma.user.upsert({
    where: { email: "demo.renter@example.com" },
    update: {},
    create: {
      name: "Demo Renter",
      email: "demo.renter@example.com",
      passwordHash: "demo-not-a-real-hash",
      role: "RENTER",
    },
  });

  const allVehicles = await prisma.vehicle.findMany();
  const findVehicle = (make: string, model: string) => {
    const found = allVehicles.find((v) => v.make === make && v.model === model);
    if (!found) throw new Error(`Seed vehicle not found: ${make} ${model}`);
    return found;
  };

  const demoBookings = [
    { ref: "RCR-DEMO-001", make: "Toyota", model: "RAV4", start: "2026-12-05T10:00:00Z", end: "2026-12-08T10:00:00Z" },
    { ref: "RCR-DEMO-002", make: "Subaru", model: "Outback", start: "2026-12-06T10:00:00Z", end: "2026-12-09T10:00:00Z" },
    { ref: "RCR-DEMO-003", make: "Tesla", model: "Model 3", start: "2026-12-05T10:00:00Z", end: "2026-12-07T10:00:00Z" },
  ];

  for (const b of demoBookings) {
    const vehicle = findVehicle(b.make, b.model);
    const startAt = new Date(b.start);
    const endAt = new Date(b.end);
    const days = Math.ceil((endAt.getTime() - startAt.getTime()) / 86_400_000);
    const subtotalCents = vehicle.dailyRateCents * days;
    const taxCents = Math.round(subtotalCents * 0.1);
    await prisma.booking.create({
      data: {
        reference: b.ref,
        userId: renter.id,
        vehicleId: vehicle.id,
        pickupLocationId: vehicle.locationId,
        startAt,
        endAt,
        dailyRateCents: vehicle.dailyRateCents,
        subtotalCents,
        taxCents,
        feesCents: 0,
        totalCents: subtotalCents + taxCents,
      },
    });
  }
  const [companies, locations, vehicles] = await Promise.all([
    prisma.company.count(),
    prisma.location.count(),
    prisma.vehicle.count(),
  ]);
  console.log(`Seeded ${companies} companies, ${locations} locations, ${vehicles} vehicles.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });