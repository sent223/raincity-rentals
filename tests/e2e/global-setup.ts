import { execSync } from "node:child_process";

// Resets the demo companies, vehicles and bookings before every run,
// so the tests always start from the same known data.
export default function globalSetup() {
  execSync("npx prisma db seed", { stdio: "inherit" });
}