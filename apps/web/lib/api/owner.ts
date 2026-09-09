import { apiClient } from './client';

export interface OwnerDashboardSummary {
  metrics: {
    pendingCount: number;
    ongoingCount: number;
    todayPickups: number;
    todayReturns: number;
    fleet: {
      total: number;
      active: number;
      inactive: number;
      archived: number;
    };
  };
  upcomingBookings: Array<{
    id: string;
    publicReference: string;
    customerName: string;
    status: string;
    requestedPickupAt: string;
    requestedReturnAt: string;
    confirmedPickupAt: string | null;
    confirmedReturnAt: string | null;
    model: { name: string; brand: string };
    assignedVehicle: { internalCode: string } | null;
  }>;
}

export interface OwnerBookingItem {
  id: string;
  publicReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerMessage: string | null;
  requestedPickupAt: string;
  requestedReturnAt: string;
  confirmedPickupAt: string | null;
  confirmedReturnAt: string | null;
  status: string;
  source: string;
  ownerNotes: string | null;
  createdAt: string;
  model: {
    id: string;
    brand: string;
    name: string;
    pricePerDay: number;
  };
  assignedVehicle: {
    id: string;
    internalCode: string;
    registrationRef: string | null;
  } | null;
}

export interface OwnerBookingDetail extends OwnerBookingItem {
  updatedAt: string;
  assignedVehicle: {
    id: string;
    internalCode: string;
    registrationRef: string | null;
    operationalStatus: string;
    internalNotes: string | null;
  } | null;
  events: Array<{
    id: string;
    eventType: string;
    fromStatus: string | null;
    toStatus: string | null;
    previousVehicleId: string | null;
    assignedVehicleId: string | null;
    actorType: string;
    notes: string | null;
    metadataJson: any;
    createdAt: string;
  }>;
}

export interface OwnerVehicleItem {
  id: string;
  businessId: string;
  vehicleModelId: string;
  internalCode: string;
  modelYear: number | null;
  registrationRef: string | null;
  operationalStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  inactiveReason: string | null;
  internalNotes: string | null;
  model: {
    id: string;
    brand: string;
    name: string;
    category: string;
  };
  blocks?: Array<{
    id: string;
    startsAt: string;
    endsAt: string;
    reason: string | null;
  }>;
}

export interface OwnerModelItem {
  id: string;
  brand: string;
  name: string;
  category: string;
  fuelType: string;
  transmission: string;
  seats: number;
  pricePerDay: number;
  description: string | null;
  isArchived: boolean;
  vehicles: Array<{
    id: string;
    internalCode: string;
    modelYear: number | null;
    registrationRef: string | null;
    operationalStatus: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    inactiveReason: string | null;
    internalNotes: string | null;
  }>;
  images: any[];
}

export interface OwnerCalendarData {
  startsAt: string;
  endsAt: string;
  events: {
    bookings: Array<{
      id: string;
      publicReference: string;
      customerName: string;
      customerPhone: string;
      status: string;
      confirmedPickupAt: string;
      confirmedReturnAt: string;
      model: { id: string; name: string; brand: string };
      assignedVehicle: { id: string; internalCode: string; registrationRef: string | null } | null;
    }>;
    blocks: Array<{
      id: string;
      physicalVehicleId: string;
      startsAt: string;
      endsAt: string;
      reason: string | null;
      vehicle: { internalCode: string };
    }>;
    closures: Array<{
      id: string;
      startsAt: string;
      endsAt: string;
      reason: string | null;
    }>;
  };
}

export const ownerApi = {
  getDashboardSummary: () => apiClient<OwnerDashboardSummary>('/api/v1/owner/dashboard/summary'),

  getBookings: (params?: { status?: string; modelId?: string; vehicleId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.modelId) query.set('modelId', params.modelId);
    if (params?.vehicleId) query.set('vehicleId', params.vehicleId);
    if (params?.search) query.set('search', params.search);
    const qs = query.toString();
    return apiClient<OwnerBookingItem[]>(`/api/v1/owner/bookings${qs ? `?${qs}` : ''}`);
  },

  getBookingDetail: (bookingId: string) => apiClient<OwnerBookingDetail>(`/api/v1/owner/bookings/${bookingId}`),

  createOfflineBooking: (data: {
    modelId: string;
    vehicleId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerMessage?: string;
    pickupAt: string;
    returnAt: string;
    source: 'PHONE' | 'WALK_IN';
    ownerNotes?: string;
  }) =>
    apiClient<{ booking: OwnerBookingItem; rawToken: string }>('/api/v1/owner/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmBooking: (bookingId: string, data: { confirmedPickupAt: string; confirmedReturnAt: string; vehicleId?: string; ownerNotes?: string }) =>
    apiClient<OwnerBookingItem>(`/api/v1/owner/bookings/${bookingId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  rejectBooking: (bookingId: string, reason?: string) =>
    apiClient<OwnerBookingItem>(`/api/v1/owner/bookings/${bookingId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  reassignBooking: (bookingId: string, targetVehicleId: string, reason?: string) =>
    apiClient<OwnerBookingItem>(`/api/v1/owner/bookings/${bookingId}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ targetVehicleId, reason }),
    }),

  cancelBooking: (bookingId: string, reason?: string) =>
    apiClient<OwnerBookingItem>(`/api/v1/owner/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  startRental: (bookingId: string, notes?: string) =>
    apiClient<OwnerBookingItem>(`/api/v1/owner/bookings/${bookingId}/start`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  completeRental: (bookingId: string, notes?: string) =>
    apiClient<OwnerBookingItem>(`/api/v1/owner/bookings/${bookingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  getCalendarEvents: (startsAt: string, endsAt: string) =>
    apiClient<OwnerCalendarData>(`/api/v1/owner/calendar?startsAt=${encodeURIComponent(startsAt)}&endsAt=${encodeURIComponent(endsAt)}`),

  getModels: () => apiClient<OwnerModelItem[]>('/api/v1/owner/models'),

  createModel: (data: any) =>
    apiClient<OwnerModelItem>('/api/v1/owner/models', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getVehicles: () => apiClient<OwnerVehicleItem[]>('/api/v1/owner/vehicles'),

  createVehicle: (data: any) =>
    apiClient<OwnerVehicleItem>('/api/v1/owner/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVehicle: (vehicleId: string, data: Partial<OwnerVehicleItem>) =>
    apiClient<OwnerVehicleItem>(`/api/v1/owner/vehicles/${vehicleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  createBlock: (data: { physicalVehicleId: string; startsAt: string; endsAt: string; reason?: string }) =>
    apiClient<any>('/api/v1/owner/blocks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteBlock: (blockId: string) =>
    apiClient<{ message: string }>(`/api/v1/owner/blocks?blockId=${blockId}`, {
      method: 'DELETE',
    }),

  getClosures: () => apiClient<any[]>('/api/v1/owner/closures'),

  createClosure: (data: { startsAt: string; endsAt: string; reason?: string }) =>
    apiClient<any>('/api/v1/owner/closures', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteClosure: (closureId: string) =>
    apiClient<{ message: string }>(`/api/v1/owner/closures?closureId=${closureId}`, {
      method: 'DELETE',
    }),

  getSettings: () => apiClient<any>('/api/v1/owner/settings'),

  updateSettings: (data: any) =>
    apiClient<any>('/api/v1/owner/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getReports: (params?: { status?: string; modelId?: string; vehicleId?: string; from?: string; to?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.modelId) query.set('modelId', params.modelId);
    if (params?.vehicleId) query.set('vehicleId', params.vehicleId);
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();
    return apiClient<{ totalCount: number; bookings: OwnerBookingItem[] }>(`/api/v1/owner/reports${qs ? `?${qs}` : ''}`);
  },
};
