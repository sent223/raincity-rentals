export type LocationPin = {
  id: number;
  name: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  isAirport: boolean;
  vehicleCount: number;
};
export type UserRole = "RENTER" | "COMPANY_ADMIN" | "PLATFORM_ADMIN";