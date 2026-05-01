import { db } from "./index";
import { bookings, customers, sailings, terminals, vessels } from "./schema";

const SEED_CUSTOMERS = [
  { id: "cus_01", name: "DSV", email: "bookings@dsv.example", country: "DK" },
  { id: "cus_02", name: "Kuehne+Nagel", email: "freight@kn.example", country: "DE" },
  { id: "cus_03", name: "Geodis", email: "ops@geodis.example", country: "FR" },
  { id: "cus_04", name: "IKEA Supply", email: "supply@ikea.example", country: "SE" },
  { id: "cus_05", name: "LEGO Logistics", email: "logistics@lego.example", country: "DK" },
  { id: "cus_06", name: "Arla Foods", email: "shipping@arla.example", country: "DK" },
  { id: "cus_07", name: "Carlsberg", email: "export@carlsberg.example", country: "DK" },
  { id: "cus_08", name: "Amazon EU", email: "freight@amazon.example", country: "LU" },
];

const SEED_VESSELS = [
  { id: "ves_01", name: "Britannia Seaways", capacityTeu: 850 },
  { id: "ves_02", name: "Dover Seaways", capacityTeu: 920 },
  { id: "ves_03", name: "Côte des Dunes", capacityTeu: 1100 },
  { id: "ves_04", name: "Botnia Seaways", capacityTeu: 760 },
  { id: "ves_05", name: "Ficaria Seaways", capacityTeu: 1240 },
];

const SEED_TERMINALS = [
  { id: "trm_cph", name: "Copenhagen", country: "DK", unlocode: "DKCPH" },
  { id: "trm_brv", name: "Brevik", country: "NO", unlocode: "NOBVK" },
  { id: "trm_got", name: "Göteborg", country: "SE", unlocode: "SEGOT" },
  { id: "trm_kel", name: "Kiel", country: "DE", unlocode: "DEKEL" },
  { id: "trm_dvr", name: "Dover", country: "GB", unlocode: "GBDVR" },
  { id: "trm_cqf", name: "Calais", country: "FR", unlocode: "FRCQF" },
  { id: "trm_dkk", name: "Dunkirk", country: "FR", unlocode: "FRDKK" },
  { id: "trm_fdh", name: "Frederikshavn", country: "DK", unlocode: "DKFDH" },
  { id: "trm_imm", name: "Immingham Riverside", country: "GB", unlocode: "GBIMM" },
  { id: "trm_ams", name: "Amsterdam (Ijmuiden)", country: "NL", unlocode: "NLIJM" },
  { id: "trm_klj", name: "Klaipeda", country: "LT", unlocode: "LTKLJ" },
  { id: "trm_kah", name: "Karlshamn", country: "SE", unlocode: "SEKAN" },
  { id: "trm_pdi", name: "Paldiski", country: "EE", unlocode: "EEPDS" },
  { id: "trm_kpl", name: "Kapellskär", country: "SE", unlocode: "SEKAP" },
  { id: "trm_muu", name: "Muuga", country: "EE", unlocode: "EEMUG" },
  { id: "trm_vuo", name: "Vuosaari", country: "FI", unlocode: "FIVUO" },
  { id: "trm_han", name: "Hanko", country: "FI", unlocode: "FIHKO" },
  { id: "trm_cux", name: "Cuxhaven", country: "DE", unlocode: "DECUX" },
  { id: "trm_esb", name: "Esbjerg", country: "DK", unlocode: "DKEBJ" },
  { id: "trm_fda", name: "Fredericia", country: "DK", unlocode: "DKFRC" },
  { id: "trm_frd", name: "Fredrikstad", country: "NO", unlocode: "NOFRK" },
  { id: "trm_new", name: "Newcastle", country: "GB", unlocode: "GBNCL" },
  { id: "trm_fxt", name: "Felixstowe", country: "GB", unlocode: "GBFXT" },
  { id: "trm_rtm", name: "Rotterdam", country: "NL", unlocode: "NLRTM" },
  { id: "trm_gnt", name: "Gent", country: "BE", unlocode: "BEGNE" },
  { id: "trm_alg", name: "Algeciras", country: "ES", unlocode: "ESALG" },
  { id: "trm_tng", name: "Tanger Med", country: "MA", unlocode: "MAPTM" },
];

type SeedSailing = {
  id: string;
  vesselId: string;
  fromTerminalId: string;
  toTerminalId: string;
  departureAt: string;
  arrivalAt: string;
  capacityKgRemaining: number;
  status: "scheduled" | "boarding" | "departed" | "arrived" | "cancelled";
};

const SEED_SAILINGS: SeedSailing[] = [
  { id: "sai_01", vesselId: "ves_01", fromTerminalId: "trm_cph", toTerminalId: "trm_brv", departureAt: "2026-05-01T17:00:00Z", arrivalAt: "2026-05-02T08:00:00Z", capacityKgRemaining: 240000, status: "scheduled" },
  { id: "sai_02", vesselId: "ves_02", fromTerminalId: "trm_got", toTerminalId: "trm_kel", departureAt: "2026-05-01T18:30:00Z", arrivalAt: "2026-05-02T09:00:00Z", capacityKgRemaining: 180000, status: "boarding" },
  { id: "sai_03", vesselId: "ves_03", fromTerminalId: "trm_dvr", toTerminalId: "trm_cqf", departureAt: "2026-05-01T11:00:00Z", arrivalAt: "2026-05-01T13:30:00Z", capacityKgRemaining: 320000, status: "departed" },
  { id: "sai_04", vesselId: "ves_03", fromTerminalId: "trm_cqf", toTerminalId: "trm_dvr", departureAt: "2026-05-01T15:00:00Z", arrivalAt: "2026-05-01T17:30:00Z", capacityKgRemaining: 410000, status: "scheduled" },
  { id: "sai_05", vesselId: "ves_04", fromTerminalId: "trm_brv", toTerminalId: "trm_fdh", departureAt: "2026-05-02T16:00:00Z", arrivalAt: "2026-05-03T08:00:00Z", capacityKgRemaining: 95000, status: "scheduled" },
  { id: "sai_06", vesselId: "ves_05", fromTerminalId: "trm_vuo", toTerminalId: "trm_han", departureAt: "2026-05-04T20:00:00Z", arrivalAt: "2026-05-05T05:00:00Z", capacityKgRemaining: 510000, status: "scheduled" },
  { id: "sai_07", vesselId: "ves_01", fromTerminalId: "trm_kel", toTerminalId: "trm_kah", departureAt: "2026-05-03T07:00:00Z", arrivalAt: "2026-05-03T13:00:00Z", capacityKgRemaining: 60000, status: "scheduled" },
  { id: "sai_08", vesselId: "ves_02", fromTerminalId: "trm_klj", toTerminalId: "trm_kah", departureAt: "2026-04-30T22:00:00Z", arrivalAt: "2026-05-01T08:00:00Z", capacityKgRemaining: 0, status: "cancelled" },
  { id: "sai_09", vesselId: "ves_03", fromTerminalId: "trm_pdi", toTerminalId: "trm_kpl", departureAt: "2026-05-01T17:30:00Z", arrivalAt: "2026-05-02T05:00:00Z", capacityKgRemaining: 280000, status: "departed" },
  { id: "sai_10", vesselId: "ves_05", fromTerminalId: "trm_got", toTerminalId: "trm_imm", departureAt: "2026-05-03T20:00:00Z", arrivalAt: "2026-05-05T06:00:00Z", capacityKgRemaining: 730000, status: "scheduled" },
  { id: "sai_11", vesselId: "ves_01", fromTerminalId: "trm_new", toTerminalId: "trm_ams", departureAt: "2026-05-03T17:00:00Z", arrivalAt: "2026-05-04T09:30:00Z", capacityKgRemaining: 215000, status: "scheduled" },
  { id: "sai_12", vesselId: "ves_04", fromTerminalId: "trm_cux", toTerminalId: "trm_klj", departureAt: "2026-05-02T03:00:00Z", arrivalAt: "2026-05-02T20:00:00Z", capacityKgRemaining: 130000, status: "scheduled" },
  { id: "sai_13", vesselId: "ves_05", fromTerminalId: "trm_alg", toTerminalId: "trm_tng", departureAt: "2026-05-07T13:00:00Z", arrivalAt: "2026-05-07T15:30:00Z", capacityKgRemaining: 880000, status: "scheduled" },
  { id: "sai_14", vesselId: "ves_03", fromTerminalId: "trm_got", toTerminalId: "trm_gnt", departureAt: "2026-05-04T15:00:00Z", arrivalAt: "2026-05-06T03:00:00Z", capacityKgRemaining: 70000, status: "scheduled" },
  { id: "sai_15", vesselId: "ves_04", fromTerminalId: "trm_fxt", toTerminalId: "trm_rtm", departureAt: "2026-05-04T10:00:00Z", arrivalAt: "2026-05-04T22:00:00Z", capacityKgRemaining: 410000, status: "scheduled" },
];

type SeedBooking = {
  id: string;
  customerId: string;
  vesselId: string;
  origin: string;
  destination: string;
  cargoType: string;
  weightKg: number;
  status: "pending" | "confirmed" | "in_transit" | "delivered" | "cancelled";
  departureAt: string;
  arrivalAt: string;
};

const SEED_BOOKINGS: SeedBooking[] = [
  { id: "bkg_01", customerId: "cus_01", vesselId: "ves_01", origin: "Copenhagen", destination: "Brevik", cargoType: "general", weightKg: 18500, status: "delivered", departureAt: "2026-04-05T08:00:00Z", arrivalAt: "2026-04-05T22:30:00Z" },
  { id: "bkg_02", customerId: "cus_02", vesselId: "ves_02", origin: "Göteborg", destination: "Kiel", cargoType: "automotive", weightKg: 24800, status: "delivered", departureAt: "2026-04-08T18:00:00Z", arrivalAt: "2026-04-09T09:30:00Z" },
  { id: "bkg_03", customerId: "cus_03", vesselId: "ves_03", origin: "Dover", destination: "Calais", cargoType: "refrigerated", weightKg: 12300, status: "in_transit", departureAt: "2026-04-30T11:00:00Z", arrivalAt: "2026-04-30T13:30:00Z" },
  { id: "bkg_04", customerId: "cus_04", vesselId: "ves_04", origin: "Brevik", destination: "Frederikshavn", cargoType: "general", weightKg: 9700, status: "confirmed", departureAt: "2026-05-02T16:00:00Z", arrivalAt: "2026-05-03T08:00:00Z" },
  { id: "bkg_05", customerId: "cus_05", vesselId: "ves_05", origin: "Vuosaari", destination: "Hanko", cargoType: "automotive", weightKg: 31200, status: "pending", departureAt: "2026-05-04T20:00:00Z", arrivalAt: "2026-05-06T14:00:00Z" },
  { id: "bkg_06", customerId: "cus_06", vesselId: "ves_01", origin: "Kiel", destination: "Karlshamn", cargoType: "general", weightKg: 15600, status: "confirmed", departureAt: "2026-05-01T07:00:00Z", arrivalAt: "2026-05-01T13:00:00Z" },
  { id: "bkg_07", customerId: "cus_07", vesselId: "ves_02", origin: "Klaipeda", destination: "Karlshamn", cargoType: "refrigerated", weightKg: 8900, status: "cancelled", departureAt: "2026-04-29T22:00:00Z", arrivalAt: "2026-04-30T08:00:00Z" },
  { id: "bkg_08", customerId: "cus_08", vesselId: "ves_03", origin: "Paldiski", destination: "Kapellskär", cargoType: "general", weightKg: 11400, status: "in_transit", departureAt: "2026-04-30T17:30:00Z", arrivalAt: "2026-05-01T09:00:00Z" },
  { id: "bkg_09", customerId: "cus_01", vesselId: "ves_04", origin: "Copenhagen", destination: "Klaipeda", cargoType: "automotive", weightKg: 27800, status: "pending", departureAt: "2026-05-05T19:00:00Z", arrivalAt: "2026-05-06T18:00:00Z" },
  { id: "bkg_10", customerId: "cus_02", vesselId: "ves_05", origin: "Göteborg", destination: "Immingham Riverside", cargoType: "general", weightKg: 14200, status: "delivered", departureAt: "2026-04-12T20:00:00Z", arrivalAt: "2026-04-14T06:00:00Z" },
  { id: "bkg_11", customerId: "cus_03", vesselId: "ves_01", origin: "Newcastle", destination: "Amsterdam (Ijmuiden)", cargoType: "general", weightKg: 10300, status: "confirmed", departureAt: "2026-05-03T17:00:00Z", arrivalAt: "2026-05-04T09:30:00Z" },
  { id: "bkg_12", customerId: "cus_04", vesselId: "ves_02", origin: "Fredrikstad", destination: "Frederikshavn", cargoType: "refrigerated", weightKg: 6700, status: "delivered", departureAt: "2026-04-20T12:00:00Z", arrivalAt: "2026-04-20T15:30:00Z" },
  { id: "bkg_13", customerId: "cus_05", vesselId: "ves_03", origin: "Vuosaari", destination: "Fredericia", cargoType: "automotive", weightKg: 22100, status: "cancelled", departureAt: "2026-04-28T18:00:00Z", arrivalAt: "2026-04-30T05:00:00Z" },
  { id: "bkg_14", customerId: "cus_06", vesselId: "ves_04", origin: "Cuxhaven", destination: "Klaipeda", cargoType: "general", weightKg: 13500, status: "in_transit", departureAt: "2026-04-30T03:00:00Z", arrivalAt: "2026-04-30T20:00:00Z" },
  { id: "bkg_15", customerId: "cus_07", vesselId: "ves_05", origin: "Karlshamn", destination: "Klaipeda", cargoType: "automotive", weightKg: 19400, status: "confirmed", departureAt: "2026-05-02T22:00:00Z", arrivalAt: "2026-05-03T05:00:00Z" },
  { id: "bkg_16", customerId: "cus_08", vesselId: "ves_01", origin: "Muuga", destination: "Kapellskär", cargoType: "general", weightKg: 7800, status: "pending", departureAt: "2026-05-06T18:00:00Z", arrivalAt: "2026-05-07T07:00:00Z" },
  { id: "bkg_17", customerId: "cus_01", vesselId: "ves_02", origin: "Esbjerg", destination: "Immingham Riverside", cargoType: "refrigerated", weightKg: 15900, status: "delivered", departureAt: "2026-04-15T19:00:00Z", arrivalAt: "2026-04-16T13:00:00Z" },
  { id: "bkg_18", customerId: "cus_02", vesselId: "ves_03", origin: "Göteborg", destination: "Gent", cargoType: "general", weightKg: 28900, status: "in_transit", departureAt: "2026-04-29T15:00:00Z", arrivalAt: "2026-05-01T03:00:00Z" },
  { id: "bkg_19", customerId: "cus_03", vesselId: "ves_04", origin: "Felixstowe", destination: "Rotterdam", cargoType: "automotive", weightKg: 17600, status: "confirmed", departureAt: "2026-05-04T10:00:00Z", arrivalAt: "2026-05-04T22:00:00Z" },
  { id: "bkg_20", customerId: "cus_04", vesselId: "ves_05", origin: "Algeciras", destination: "Tanger Med", cargoType: "general", weightKg: 12000, status: "pending", departureAt: "2026-05-07T13:00:00Z", arrivalAt: "2026-05-08T08:30:00Z" },
];

export async function seed() {
  const existing = await db.select().from(bookings);
  if (existing.length > 0) return;

  for (const c of SEED_CUSTOMERS) await db.insert(customers).values(c);
  for (const v of SEED_VESSELS) await db.insert(vessels).values(v);
  for (const t of SEED_TERMINALS) await db.insert(terminals).values(t);
  for (const s of SEED_SAILINGS) await db.insert(sailings).values(s);
  for (const b of SEED_BOOKINGS) await db.insert(bookings).values(b);
}
