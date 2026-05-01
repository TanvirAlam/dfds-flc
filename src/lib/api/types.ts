export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  vesselId: string;
  origin: string;
  destination: string;
  cargoType: string;
  weightKg: number;
  status: BookingStatus;
  departureAt: string;
  arrivalAt: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  country: string;
  createdAt: string;
}

export interface Vessel {
  id: string;
  name: string;
  capacityTeu: number;
}
