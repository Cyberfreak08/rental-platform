'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  BusinessProfile,
  BusinessContent,
  VehicleModel,
  PhysicalVehicle,
  Booking,
  VehicleBlock,
  BusinessClosure,
  ModelAvailabilityResult,
  BookingStatus,
  BookingSource,
} from '@drivenest/shared';
import {
  INITIAL_BUSINESS,
  INITIAL_CONTENT,
  INITIAL_VEHICLE_MODELS,
  INITIAL_PHYSICAL_VEHICLES,
  INITIAL_BOOKINGS,
  INITIAL_VEHICLE_BLOCKS,
  INITIAL_BUSINESS_CLOSURES,
} from './mock-data';

interface MockStateContextType {
  business: BusinessProfile;
  content: BusinessContent;
  models: VehicleModel[];
  vehicles: PhysicalVehicle[];
  bookings: Booking[];
  blocks: VehicleBlock[];
  closures: BusinessClosure[];
  updateBusiness: (data: Partial<BusinessProfile>) => void;
  updateContent: (data: Partial<BusinessContent>) => void;
  updateModel: (modelId: string, data: Partial<VehicleModel>) => void;
  updateVehicle: (vehicleId: string, data: Partial<PhysicalVehicle>) => void;
  createBookingRequest: (data: {
    modelId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerMessage?: string;
    requestedPickupAt: string;
    requestedReturnAt: string;
  }) => Booking;
  confirmBooking: (bookingId: string, assignedVehicleId: string, pickupAt: string, returnAt: string) => void;
  rejectBooking: (bookingId: string, reason?: string) => void;
  cancelBooking: (bookingId: string, reason?: string) => void;
  startBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  reassignVehicle: (bookingId: string, newVehicleId: string) => void;
  modifyBookingSchedule: (bookingId: string, pickupAt: string, returnAt: string) => void;
  createOfflineBooking: (data: {
    modelId: string;
    assignedVehicleId: string;
    customerName: string;
    customerPhone: string;
    pickupAt: string;
    returnAt: string;
    source?: BookingSource;
  }) => Booking;
  addVehicleBlock: (block: Omit<VehicleBlock, 'id'>) => void;
  removeVehicleBlock: (blockId: string) => void;
  addBusinessClosure: (closure: Omit<BusinessClosure, 'id'>) => void;
  removeBusinessClosure: (closureId: string) => void;
  checkAvailability: (pickupAt?: string, returnAt?: string, category?: string) => ModelAvailabilityResult[];
  getEligibleVehiclesForModel: (modelId: string, pickupAt: string, returnAt: string, currentBookingId?: string) => PhysicalVehicle[];
}

const MockStateContext = createContext<MockStateContextType | null>(null);

export function MockStateProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<BusinessProfile>(INITIAL_BUSINESS);
  const [content, setContent] = useState<BusinessContent>(INITIAL_CONTENT);
  const [models, setModels] = useState<VehicleModel[]>(INITIAL_VEHICLE_MODELS);
  const [vehicles, setVehicles] = useState<PhysicalVehicle[]>(INITIAL_PHYSICAL_VEHICLES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [blocks, setBlocks] = useState<VehicleBlock[]>(INITIAL_VEHICLE_BLOCKS);
  const [closures, setClosures] = useState<BusinessClosure[]>(INITIAL_BUSINESS_CLOSURES);

  const updateBusiness = (data: Partial<BusinessProfile>) => {
    setBusiness(prev => ({ ...prev, ...data }));
  };

  const updateContent = (data: Partial<BusinessContent>) => {
    setContent(prev => ({ ...prev, ...data }));
  };

  const updateModel = (modelId: string, data: Partial<VehicleModel>) => {
    setModels(prev => prev.map(m => (m.id === modelId ? { ...m, ...data } : m)));
  };

  const updateVehicle = (vehicleId: string, data: Partial<PhysicalVehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, ...data } : v)));
  };

  const isVehicleAvailable = (
    v: PhysicalVehicle,
    pickupDate: Date,
    returnDate: Date,
    excludeBookingId?: string
  ): boolean => {
    if (v.status !== 'ACTIVE') return false;

    // Check closures
    for (const c of closures) {
      const cStart = new Date(c.startsAt);
      const cEnd = new Date(c.endsAt);
      if (pickupDate < cEnd && returnDate > cStart) {
        return false;
      }
    }

    // Check blocks
    const vehicleBlocks = blocks.filter(b => b.physicalVehicleId === v.id);
    for (const b of vehicleBlocks) {
      const bStart = new Date(b.startsAt);
      const bEnd = new Date(b.endsAt);
      if (pickupDate < bEnd && returnDate > bStart) {
        return false;
      }
    }

    // Check confirmed or ongoing bookings
    const conflictingBookings = bookings.filter(
      bk =>
        bk.id !== excludeBookingId &&
        bk.assignedVehicleId === v.id &&
        (bk.status === 'CONFIRMED' || bk.status === 'ONGOING')
    );

    for (const bk of conflictingBookings) {
      const start = new Date(bk.confirmedPickupAt || bk.requestedPickupAt);
      const end = new Date(bk.confirmedReturnAt || bk.requestedReturnAt);
      if (pickupDate < end && returnDate > start) {
        return false;
      }
    }

    return true;
  };

  const getEligibleVehiclesForModel = (
    modelId: string,
    pickupAt: string,
    returnAt: string,
    currentBookingId?: string
  ): PhysicalVehicle[] => {
    if (!pickupAt || !returnAt) return [];
    const pDate = new Date(pickupAt);
    const rDate = new Date(returnAt);
    if (isNaN(pDate.getTime()) || isNaN(rDate.getTime()) || pDate >= rDate) return [];

    const modelVehicles = vehicles.filter(v => v.modelId === modelId);
    return modelVehicles.filter(v => isVehicleAvailable(v, pDate, rDate, currentBookingId));
  };

  const checkAvailability = (
    pickupAt?: string,
    returnAt?: string,
    category?: string
  ): ModelAvailabilityResult[] => {
    let filteredModels = models.filter(m => m.isActive !== false);
    if (category && category !== 'All' && category !== 'Any car') {
      filteredModels = filteredModels.filter(m => m.category === category);
    }

    if (!pickupAt || !returnAt) {
      return filteredModels.map(model => {
        const total = vehicles.filter(v => v.modelId === model.id && v.status === 'ACTIVE').length;
        return {
          model,
          availableCount: total,
          isAvailable: total > 0,
          totalVehicles: total,
        };
      });
    }

    const pDate = new Date(pickupAt);
    const rDate = new Date(returnAt);
    if (isNaN(pDate.getTime()) || isNaN(rDate.getTime()) || pDate >= rDate) {
      return filteredModels.map(model => ({
        model,
        availableCount: 0,
        isAvailable: false,
        totalVehicles: vehicles.filter(v => v.modelId === model.id).length,
      }));
    }

    return filteredModels.map(model => {
      const eligible = getEligibleVehiclesForModel(model.id, pickupAt, returnAt);
      const total = vehicles.filter(v => v.modelId === model.id).length;
      return {
        model,
        availableCount: eligible.length,
        isAvailable: eligible.length > 0,
        totalVehicles: total,
      };
    });
  };

  const createBookingRequest = (data: {
    modelId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerMessage?: string;
    requestedPickupAt: string;
    requestedReturnAt: string;
  }): Booking => {
    const timestamp = new Date();
    const count = bookings.length + 1;
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const publicReference = `BK-${dateStr}-${String(count).padStart(3, '0')}`;
    const privateStatusToken = `tok_sec_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      publicReference,
      privateStatusToken,
      modelId: data.modelId,
      assignedVehicleId: null,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      customerMessage: data.customerMessage,
      requestedPickupAt: data.requestedPickupAt,
      requestedReturnAt: data.requestedReturnAt,
      status: 'PENDING',
      source: 'WEBSITE',
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
      events: [
        {
          id: `ev-${Date.now()}`,
          bookingId: `booking-${Date.now()}`,
          eventType: 'CREATED',
          toStatus: 'PENDING',
          createdAt: timestamp.toISOString(),
        },
      ],
    };

    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const confirmBooking = (bookingId: string, assignedVehicleId: string, pickupAt: string, returnAt: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'CONFIRMED',
          fromStatus: b.status,
          toStatus: 'CONFIRMED' as BookingStatus,
          note: `Assigned vehicle ID: ${assignedVehicleId}`,
          createdAt: now,
        };
        return {
          ...b,
          assignedVehicleId,
          confirmedPickupAt: pickupAt,
          confirmedReturnAt: returnAt,
          status: 'CONFIRMED',
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const rejectBooking = (bookingId: string, reason?: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'REJECTED',
          fromStatus: b.status,
          toStatus: 'REJECTED' as BookingStatus,
          note: reason || 'Declined by owner',
          createdAt: now,
        };
        return {
          ...b,
          status: 'REJECTED',
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const cancelBooking = (bookingId: string, reason?: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'CANCELLED',
          fromStatus: b.status,
          toStatus: 'CANCELLED' as BookingStatus,
          note: reason || 'Cancelled',
          createdAt: now,
        };
        return {
          ...b,
          status: 'CANCELLED',
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const startBooking = (bookingId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'STARTED',
          fromStatus: b.status,
          toStatus: 'ONGOING' as BookingStatus,
          createdAt: now,
        };
        return {
          ...b,
          status: 'ONGOING',
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const completeBooking = (bookingId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'COMPLETED',
          fromStatus: b.status,
          toStatus: 'COMPLETED' as BookingStatus,
          note: 'Vehicle returned and checked in',
          createdAt: now,
        };
        return {
          ...b,
          status: 'COMPLETED',
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const reassignVehicle = (bookingId: string, newVehicleId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'REASSIGNED',
          note: `Reassigned from ${b.assignedVehicleId} to ${newVehicleId}`,
          createdAt: now,
        };
        return {
          ...b,
          assignedVehicleId: newVehicleId,
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const modifyBookingSchedule = (bookingId: string, pickupAt: string, returnAt: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        const newEvent = {
          id: `ev-${Date.now()}`,
          bookingId: b.id,
          eventType: 'SCHEDULE_MODIFIED',
          note: `Schedule adjusted to ${pickupAt} - ${returnAt}`,
          createdAt: now,
        };
        return {
          ...b,
          confirmedPickupAt: pickupAt,
          confirmedReturnAt: returnAt,
          updatedAt: now,
          events: [...(b.events || []), newEvent],
        };
      })
    );
  };

  const createOfflineBooking = (data: {
    modelId: string;
    assignedVehicleId: string;
    customerName: string;
    customerPhone: string;
    pickupAt: string;
    returnAt: string;
    source?: BookingSource;
  }): Booking => {
    const timestamp = new Date();
    const count = bookings.length + 1;
    const dateStr = timestamp.toISOString().slice(0, 10).replace(/-/g, '');
    const publicReference = `BK-${dateStr}-${String(count).padStart(3, '0')}`;
    const privateStatusToken = `tok_sec_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      publicReference,
      privateStatusToken,
      modelId: data.modelId,
      assignedVehicleId: data.assignedVehicleId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      requestedPickupAt: data.pickupAt,
      requestedReturnAt: data.returnAt,
      confirmedPickupAt: data.pickupAt,
      confirmedReturnAt: data.returnAt,
      status: 'CONFIRMED',
      source: data.source || 'PHONE',
      createdAt: timestamp.toISOString(),
      updatedAt: timestamp.toISOString(),
      events: [
        {
          id: `ev-${Date.now()}`,
          bookingId: `booking-${Date.now()}`,
          eventType: 'OFFLINE_CREATED',
          toStatus: 'CONFIRMED',
          note: `Walk-in / Phone booking assigned to ${data.assignedVehicleId}`,
          createdAt: timestamp.toISOString(),
        },
      ],
    };

    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const addVehicleBlock = (block: Omit<VehicleBlock, 'id'>) => {
    const newBlock: VehicleBlock = {
      id: `block-${Date.now()}`,
      ...block,
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const removeVehicleBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  const addBusinessClosure = (closure: Omit<BusinessClosure, 'id'>) => {
    const newClosure: BusinessClosure = {
      id: `closure-${Date.now()}`,
      ...closure,
    };
    setClosures(prev => [...prev, newClosure]);
  };

  const removeBusinessClosure = (closureId: string) => {
    setClosures(prev => prev.filter(c => c.id !== closureId));
  };

  return (
    <MockStateContext.Provider
      value={{
        business,
        content,
        models,
        vehicles,
        bookings,
        blocks,
        closures,
        updateBusiness,
        updateContent,
        updateModel,
        updateVehicle,
        createBookingRequest,
        confirmBooking,
        rejectBooking,
        cancelBooking,
        startBooking,
        completeBooking,
        reassignVehicle,
        modifyBookingSchedule,
        createOfflineBooking,
        addVehicleBlock,
        removeVehicleBlock,
        addBusinessClosure,
        removeBusinessClosure,
        checkAvailability,
        getEligibleVehiclesForModel,
      }}
    >
      {children}
    </MockStateContext.Provider>
  );
}

export function useMockState() {
  const context = useContext(MockStateContext);
  if (!context) {
    throw new Error('useMockState must be used within a MockStateProvider');
  }
  return context;
}
