import { apiClient } from './client';

export interface PublicBusinessProfile {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  city: string;
  mapUrl: string | null;
  logoUrl: string | null;
  timezone: string;
  hours: Array<{
    weekday: number;
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
  }>;
  content: {
    aboutContent: string | null;
    whyChooseUs: string | null;
    servicesContent: string | null;
    pickupInstructions: string | null;
    returnInstructions: string | null;
    fuelPolicy: string | null;
    kmPolicy: string | null;
    cancellationPolicy: string | null;
    googleReviewUrl: string | null;
  } | null;
}

export interface PublicFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface PublicVehicleModel {
  id: string;
  brand: string;
  name: string;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  description: string | null;
  images: Array<{
    id: string;
    publicUrl: string | null;
    altText: string | null;
    sortOrder: number;
  }>;
}

export interface PublicAvailabilityResult {
  modelId: string;
  brand: string;
  name: string;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  images: Array<{ publicUrl: string | null; altText: string | null }>;
  isAvailable: boolean;
  availableCount: number;
  totalActiveCount: number;
}

export interface CreateBookingRequestInput {
  modelId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerMessage?: string;
  requestedPickupAt: string; // ISO 8601
  requestedReturnAt: string; // ISO 8601
}

export interface CreateBookingResponse {
  bookingId: string;
  publicReference: string;
  status: string;
  requestedPickupAt: string;
  requestedReturnAt: string;
  statusToken: string;
  statusUrl: string;
}

export interface PublicBookingStatusResponse {
  id: string;
  publicReference: string;
  status: string;
  customerName: string;
  requestedPickupAt: string;
  requestedReturnAt: string;
  confirmedPickupAt: string | null;
  confirmedReturnAt: string | null;
  ownerNotes: string | null;
  model: {
    id: string;
    brand: string;
    name: string;
    category: string;
    fuelType: string;
    transmission: string;
    seats: number;
    pricePerDay: number;
    images: Array<{ publicUrl: string | null; altText: string | null }>;
  };
  business: {
    name: string;
    phone: string;
    whatsappNumber: string | null;
    email: string | null;
    address: string | null;
    city: string;
  };
}

export const publicApi = {
  getBusiness: () => apiClient<PublicBusinessProfile>('/api/v1/public/business'),
  getFaqs: () => apiClient<PublicFaq[]>('/api/v1/public/business/faqs'),
  getModels: (params?: { category?: string; fuelType?: string; transmission?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.fuelType) query.set('fuelType', params.fuelType);
    if (params?.transmission) query.set('transmission', params.transmission);
    const qs = query.toString();
    return apiClient<PublicVehicleModel[]>(`/api/v1/public/models${qs ? `?${qs}` : ''}`);
  },
  getModelDetail: (modelId: string) => apiClient<PublicVehicleModel>(`/api/v1/public/models/${modelId}`),
  searchAvailability: (params: { pickupAt: string; returnAt: string; modelId?: string; category?: string }) => {
    const query = new URLSearchParams();
    query.set('pickupAt', params.pickupAt);
    query.set('returnAt', params.returnAt);
    if (params.modelId) query.set('modelId', params.modelId);
    if (params.category) query.set('category', params.category);
    return apiClient<PublicAvailabilityResult[]>(`/api/v1/public/search?${query.toString()}`);
  },
  submitBookingRequest: (data: CreateBookingRequestInput) =>
    apiClient<CreateBookingResponse>('/api/v1/public/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBookingStatus: (token: string) => apiClient<PublicBookingStatusResponse>(`/api/v1/public/status/${token}`),
};
