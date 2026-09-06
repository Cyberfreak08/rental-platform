export type FuelType = 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
export type Transmission = 'Manual' | 'Automatic';
export type VehicleCategory = 'Hatchback' | 'Sedan' | 'Compact SUV' | 'SUV' | 'Luxury';

export type VehicleStatus = 'ACTIVE' | 'INACTIVE';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
export type BookingSource = 'WEBSITE' | 'PHONE' | 'WALK_IN' | 'OTHER';

export interface BusinessHours {
  [day: string]: [string, string];
}

export interface BusinessProfile {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  city: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  hours: BusinessHours;
  googleReviewUrl?: string;
  description?: string;
  mapUrl?: string;
  logoUrl?: string;
}

export interface BusinessContent {
  about: string;
  whyChooseUs: { title: string; description: string }[];
  faqs: { question: string; answer: string; category?: string }[];
  policies: {
    fuel: string;
    kilometres: string;
    cancellation: string;
    lateReturn: string;
    eligibility: string;
    pickupInstructions: string;
    returnInstructions: string;
  };
}

export interface VehicleModel {
  id: string;
  brand: string;
  name: string;
  category: VehicleCategory;
  fuelType: FuelType;
  transmission: Transmission;
  seats: number;
  pricePerDay: number;
  description: string;
  isActive?: boolean;
  image?: string;
}

export interface PhysicalVehicle {
  id: string;
  modelId: string;
  internalCode: string;
  year: number;
  status: VehicleStatus;
  inactiveReason?: string;
  registrationReference?: string;
  internalNotes?: string;
  images?: string[];
}

export interface Booking {
  id: string;
  publicReference: string;
  privateStatusToken: string;
  modelId: string;
  assignedVehicleId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerMessage?: string;
  requestedPickupAt: string;
  requestedReturnAt: string;
  confirmedPickupAt?: string;
  confirmedReturnAt?: string;
  status: BookingStatus;
  source: BookingSource;
  createdAt: string;
  updatedAt: string;
  events?: BookingEventRecord[];
}

export interface BookingEventRecord {
  id: string;
  bookingId: string;
  eventType: string;
  fromStatus?: BookingStatus | null;
  toStatus?: BookingStatus | null;
  note?: string;
  createdAt: string;
}

export interface VehicleBlock {
  id: string;
  physicalVehicleId: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}

export interface BusinessClosure {
  id: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}

export interface SearchQueryParams {
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
  category?: string;
}

export interface ModelAvailabilityResult {
  model: VehicleModel;
  availableCount: number;
  isAvailable: boolean;
  totalVehicles: number;
}
