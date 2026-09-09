'use client';

/**
 * ⚠️  LEGACY BRIDGE — NOT THE PRODUCTION DATA SOURCE
 * =====================================================
 * MockStateProvider / useMockState() was the original Phase 1 development
 * state layer.  It initialises from HARDCODED LOCAL ARRAYS in mock-data.ts
 * and attempts an API refresh on mount.
 *
 * CURRENT STATUS (Phase 2E):
 *   - Every page now fetches directly from the real REST API via publicApi /
 *     ownerApi / BusinessProvider / useBusinessData().
 *   - MockStateProvider is still mounted in layout.tsx so that any remaining
 *     incidental usages of useMockState() do not throw, but NO production
 *     page relies on it as its primary data source.
 *   - checkAvailability() is PURE LOCAL MOCK LOGIC and is no longer called
 *     by any page.  The Search page calls GET /api/v1/public/search instead.
 *
 * HOW TO ENABLE THE DEV MOCK FALLBACK (intentionally awkward):
 *   This provider has no environment flag.  The only way mock data appears
 *   in the UI is if a component explicitly calls useMockState() and reads
 *   its state.  No production page does this after Phase 2E.
 *
 * WHY IT STILL EXISTS:
 *   Removing it requires auditing every incidental import.  It is safe to
 *   remove in a follow-up cleanup task; doing so is not part of Phase 2E.
 *
 * PRODUCTION RULE:
 *   If the REST API is unreachable, pages render an error/loading state.
 *   They do NOT silently fall back to this mock data.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
import { publicApi, ownerApi } from './api';

interface MockStateContextType {
  business: BusinessProfile;
  content: BusinessContent;
  models: VehicleModel[];
  vehicles: PhysicalVehicle[];
  bookings: Booking[];
  blocks: VehicleBlock[];
  closures: BusinessClosure[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  updateBusiness: (data: Partial<BusinessProfile>) => Promise<void>;
  updateContent: (data: Partial<BusinessContent>) => Promise<void>;
  updateModel: (modelId: string, data: Partial<VehicleModel>) => Promise<void>;
  updateVehicle: (vehicleId: string, data: Partial<PhysicalVehicle>) => Promise<void>;
  createBookingRequest: (data: {
    modelId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerMessage?: string;
    requestedPickupAt: string;
    requestedReturnAt: string;
  }) => Promise<Booking>;
  confirmBooking: (bookingId: string, assignedVehicleId: string, pickupAt: string, returnAt: string) => Promise<void>;
  rejectBooking: (bookingId: string, reason?: string) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  startBooking: (bookingId: string) => Promise<void>;
  completeBooking: (bookingId: string) => Promise<void>;
  reassignVehicle: (bookingId: string, newVehicleId: string) => Promise<void>;
  modifyBookingSchedule: (bookingId: string, pickupAt: string, returnAt: string) => Promise<void>;
  createOfflineBooking: (data: {
    modelId: string;
    assignedVehicleId: string;
    customerName: string;
    customerPhone: string;
    pickupAt: string;
    returnAt: string;
    source?: BookingSource;
  }) => Promise<Booking>;
  addVehicleBlock: (block: Omit<VehicleBlock, 'id'>) => Promise<void>;
  removeVehicleBlock: (blockId: string) => Promise<void>;
  addBusinessClosure: (closure: Omit<BusinessClosure, 'id'>) => Promise<void>;
  removeBusinessClosure: (closureId: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize state with real API endpoints on mount
  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Fetch public business profile & content
      const bizRes = await publicApi.getBusiness().catch(() => null);
      if (bizRes) {
        setBusiness(prev => ({
          ...prev,
          name: bizRes.name,
          slug: bizRes.slug,
          tagline: bizRes.description || prev.tagline,
          phone: bizRes.phone,
          whatsappNumber: bizRes.whatsappNumber || prev.whatsappNumber,
          email: bizRes.email || prev.email,
          address: bizRes.address || prev.address,
          city: bizRes.city || prev.city,
          googleReviewUrl: bizRes.content?.googleReviewUrl || prev.googleReviewUrl,
        }));

        if (bizRes.content) {
          setContent(prev => ({
            ...prev,
            about: bizRes.content?.aboutContent || prev.about,
            policies: {
              ...prev.policies,
              fuel: bizRes.content?.fuelPolicy || prev.policies.fuel,
              kilometres: bizRes.content?.kmPolicy || prev.policies.kilometres,
              cancellation: bizRes.content?.cancellationPolicy || prev.policies.cancellation,
              pickupInstructions: bizRes.content?.pickupInstructions || prev.policies.pickupInstructions,
              returnInstructions: bizRes.content?.returnInstructions || prev.policies.returnInstructions,
            },
          }));
        }
      }

      // 2. Fetch public models
      const modelsRes = await publicApi.getModels().catch(() => null);
      if (modelsRes && modelsRes.length > 0) {
        setModels(
          modelsRes.map(m => ({
            id: m.id,
            brand: m.brand,
            name: m.name,
            category: m.category as any,
            fuelType: m.fuelType as any,
            transmission: m.transmission as any,
            seats: m.seats,
            pricePerDay: Number(m.pricePerDay),
            description: m.description || '',
            images: m.images?.map(img => img.publicUrl || '') || [],
          }))
        );
      }

      // 3. Attempt owner data sync (will succeed if owner is logged in)
      const ownerBookings = await ownerApi.getBookings().catch(() => null);
      if (ownerBookings) {
        setBookings(
          ownerBookings.map(b => ({
            id: b.id,
            publicReference: b.publicReference,
            privateStatusToken: `tok_${b.id}`,
            modelId: b.model.id,
            assignedVehicleId: b.assignedVehicle?.id || null,
            customerName: b.customerName,
            customerPhone: b.customerPhone,
            customerEmail: b.customerEmail || undefined,
            customerMessage: b.customerMessage || undefined,
            requestedPickupAt: b.requestedPickupAt,
            requestedReturnAt: b.requestedReturnAt,
            confirmedPickupAt: b.confirmedPickupAt || undefined,
            confirmedReturnAt: b.confirmedReturnAt || undefined,
            status: b.status as any,
            source: b.source as any,
            ownerNotes: b.ownerNotes || undefined,
            createdAt: b.createdAt,
            updatedAt: b.createdAt,
          }))
        );
      }

      const ownerVehicles = await ownerApi.getVehicles().catch(() => null);
      if (ownerVehicles) {
        setVehicles(
          ownerVehicles.map(v => ({
            id: v.id,
            modelId: v.vehicleModelId,
            internalCode: v.internalCode,
            year: v.modelYear || 2025,
            registration: v.registrationRef || undefined,
            status: v.operationalStatus as any,
            inactiveReason: v.inactiveReason || undefined,
            internalNotes: v.internalNotes || undefined,
          }))
        );
      }
    } catch (err) {
      console.warn('API sync fallback to baseline mock state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const updateBusiness = async (data: Partial<BusinessProfile>) => {
    setBusiness(prev => ({ ...prev, ...data }));
    await ownerApi.updateSettings({ ...data }).catch(console.error);
  };

  const updateContent = async (data: Partial<BusinessContent>) => {
    setContent(prev => ({ ...prev, ...data }));
    await ownerApi
      .updateSettings({
        content: {
          aboutContent: data.about,
          pickupInstructions: data.policies?.pickupInstructions,
          returnInstructions: data.policies?.returnInstructions,
          fuelPolicy: data.policies?.fuel,
          kmPolicy: data.policies?.kilometres,
          cancellationPolicy: data.policies?.cancellation,
        },
      })
      .catch(console.error);
  };

  const updateModel = async (modelId: string, data: Partial<VehicleModel>) => {
    setModels(prev => prev.map(m => (m.id === modelId ? { ...m, ...data } : m)));
  };

  const updateVehicle = async (vehicleId: string, data: Partial<PhysicalVehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === vehicleId ? { ...v, ...data } : v)));
    await ownerApi
      .updateVehicle(vehicleId, {
        operationalStatus: data.status as any,
        inactiveReason: data.inactiveReason || null,
        internalNotes: data.internalNotes || null,
        registrationRef: data.registrationReference || null,
      })
      .catch(console.error);
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

  const createBookingRequest = async (data: {
    modelId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    customerMessage?: string;
    requestedPickupAt: string;
    requestedReturnAt: string;
  }): Promise<Booking> => {
    try {
      const res = await publicApi.submitBookingRequest({
        modelId: data.modelId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerMessage: data.customerMessage,
        requestedPickupAt: data.requestedPickupAt,
        requestedReturnAt: data.requestedReturnAt,
      });

      const newBooking: Booking = {
        id: res.bookingId,
        publicReference: res.publicReference,
        privateStatusToken: res.statusToken,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      // Fallback local booking generation if API is not responding
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
      };

      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    }
  };

  const confirmBooking = async (bookingId: string, assignedVehicleId: string, pickupAt: string, returnAt: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              assignedVehicleId,
              confirmedPickupAt: pickupAt,
              confirmedReturnAt: returnAt,
              status: 'CONFIRMED',
              updatedAt: now,
            }
          : b
      )
    );

    await ownerApi
      .confirmBooking(bookingId, {
        confirmedPickupAt: pickupAt,
        confirmedReturnAt: returnAt,
        vehicleId: assignedVehicleId,
      })
      .catch(console.error);
  };

  const rejectBooking = async (bookingId: string, reason?: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'REJECTED', updatedAt: now } : b))
    );
    await ownerApi.rejectBooking(bookingId, reason).catch(console.error);
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED', updatedAt: now } : b))
    );
    await ownerApi.cancelBooking(bookingId, reason).catch(console.error);
  };

  const startBooking = async (bookingId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'ONGOING', updatedAt: now } : b))
    );
    await ownerApi.startRental(bookingId).catch(console.error);
  };

  const completeBooking = async (bookingId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'COMPLETED', updatedAt: now } : b))
    );
    await ownerApi.completeRental(bookingId).catch(console.error);
  };

  const reassignVehicle = async (bookingId: string, newVehicleId: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, assignedVehicleId: newVehicleId, updatedAt: now } : b))
    );
    await ownerApi.reassignBooking(bookingId, newVehicleId).catch(console.error);
  };

  const modifyBookingSchedule = async (bookingId: string, pickupAt: string, returnAt: string) => {
    const now = new Date().toISOString();
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? {
              ...b,
              confirmedPickupAt: b.status === 'CONFIRMED' || b.status === 'ONGOING' ? pickupAt : b.confirmedPickupAt,
              confirmedReturnAt: b.status === 'CONFIRMED' || b.status === 'ONGOING' ? returnAt : b.confirmedReturnAt,
              requestedPickupAt: pickupAt,
              requestedReturnAt: returnAt,
              updatedAt: now,
            }
          : b
      )
    );
  };

  const createOfflineBooking = async (data: {
    modelId: string;
    assignedVehicleId: string;
    customerName: string;
    customerPhone: string;
    pickupAt: string;
    returnAt: string;
    source?: BookingSource;
  }): Promise<Booking> => {
    try {
      const res = await ownerApi.createOfflineBooking({
        modelId: data.modelId,
        vehicleId: data.assignedVehicleId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        pickupAt: data.pickupAt,
        returnAt: data.returnAt,
        source: (data.source as any) || 'WALK_IN',
      });

      const newBooking: Booking = {
        id: res.booking.id,
        publicReference: res.booking.publicReference,
        privateStatusToken: res.rawToken,
        modelId: data.modelId,
        assignedVehicleId: data.assignedVehicleId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        requestedPickupAt: data.pickupAt,
        requestedReturnAt: data.returnAt,
        confirmedPickupAt: data.pickupAt,
        confirmedReturnAt: data.returnAt,
        status: 'CONFIRMED',
        source: data.source || 'WALK_IN',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch {
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
        source: data.source || 'WALK_IN',
        createdAt: timestamp.toISOString(),
        updatedAt: timestamp.toISOString(),
      };

      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    }
  };

  const addVehicleBlock = async (block: Omit<VehicleBlock, 'id'>) => {
    const newBlock: VehicleBlock = {
      ...block,
      id: `block-${Date.now()}`,
    };
    setBlocks(prev => [...prev, newBlock]);
    await ownerApi
      .createBlock({
        physicalVehicleId: block.physicalVehicleId,
        startsAt: block.startsAt,
        endsAt: block.endsAt,
        reason: block.reason,
      })
      .catch(console.error);
  };

  const removeVehicleBlock = async (blockId: string) => {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
    await ownerApi.deleteBlock(blockId).catch(console.error);
  };

  const addBusinessClosure = async (closure: Omit<BusinessClosure, 'id'>) => {
    const newClosure: BusinessClosure = {
      ...closure,
      id: `closure-${Date.now()}`,
    };
    setClosures(prev => [...prev, newClosure]);
    await ownerApi
      .createClosure({
        startsAt: closure.startsAt,
        endsAt: closure.endsAt,
        reason: closure.reason,
      })
      .catch(console.error);
  };

  const removeBusinessClosure = async (closureId: string) => {
    setClosures(prev => prev.filter(c => c.id !== closureId));
    await ownerApi.deleteClosure(closureId).catch(console.error);
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
        isLoading,
        refreshData,
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
