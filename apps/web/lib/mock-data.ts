import {
    BusinessProfile,
    BusinessContent,
    VehicleModel,
    PhysicalVehicle,
    Booking,
    VehicleBlock,
    BusinessClosure,
    ModelAvailabilityResult,
} from '@drivenest/shared';

export const INITIAL_BUSINESS: BusinessProfile = {
    name: 'DriveNest Rentals',
    slug: 'drivenest',
    tagline: 'Reliable self-drive cars for every journey.',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    address: '118 Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004',
    phone: '+91 98765 43210',
    whatsappNumber: '+919876543210',
    email: 'hello@drivenest.example',
    hours: {
        monday: ['07:00', '21:00'],
        tuesday: ['07:00', '21:00'],
        wednesday: ['07:00', '21:00'],
        thursday: ['07:00', '21:00'],
        friday: ['07:00', '21:00'],
        saturday: ['07:00', '21:00'],
        sunday: ['08:00', '20:00'],
    },
    googleReviewUrl: 'https://example.com/google-review',
};

export const INITIAL_CONTENT: BusinessContent = {
    about: 'DriveNest Rentals provides clean, well-maintained self-drive cars in Coimbatore. Whether you are planning a city trip, an outstation journey to Ooty or Kodaikanal, or a business visit, our reliable fleet and local support ensure a seamless experience.',
    whyChooseUs: [
        {
            title: 'Well-Maintained Fleet',
            description:
                'All vehicles undergo regular maintenance, cleaning and safety checks before every rental.',
        },
        {
            title: 'Transparent Pricing',
            description:
                'Clear daily rates with no hidden fees or confusing terms.',
        },
        {
            title: 'Quick & Simple Booking',
            description:
                'Submit your request in minutes without complex account creation.',
        },
        {
            title: 'Dedicated Local Support',
            description:
                'Direct contact via phone and WhatsApp with our Coimbatore team.',
        },
    ],
    faqs: [
        {
            question: 'Do I need a driving licence?',
            answer: 'Yes. Please present an original valid driving licence and official government ID at the time of vehicle pickup.',
        },
        {
            question: 'Is my website booking instantly confirmed?',
            answer: 'No. Website submissions are booking requests. Our team reviews availability and confirms the booking directly with you.',
        },
        {
            question: 'Can I request specific pickup and return times?',
            answer: 'Yes, you can specify your exact pickup and return times. Our standard operations run 7:00 AM to 9:00 PM.',
        },
        {
            question: 'Can I extend my rental while on the road?',
            answer: 'Yes. Please call or WhatsApp us in advance. Extensions depend on upcoming vehicle reservations.',
        },
        {
            question: 'What is your fuel policy?',
            answer: 'Same-to-same policy: return the vehicle with the same fuel level as provided at pickup.',
        },
    ],
    policies: {
        fuel: 'Same-to-same policy. Return the car with the fuel level provided at pickup.',
        kilometres:
            '300 km included per 24 hours. Extra kilometres charged at ₹12/km.',
        cancellation:
            'Free cancellation up to 24 hours before pickup. Please notify us promptly.',
        lateReturn:
            'Grace period of 30 minutes. Subsequent delays are billed at hourly rates.',
        eligibility:
            'Drivers must be 21+ years old with a valid driving licence held for at least 1 year.',
        pickupInstructions:
            'Pickup is at our Peelamedu branch. Please bring your original driving licence and Aadhaar/Govt ID.',
        returnInstructions:
            'Return the vehicle to the agreed location during operational hours with matching fuel level.',
    },
};

export const INITIAL_VEHICLE_MODELS: VehicleModel[] = [
    {
        id: 'model-swift',
        brand: 'Maruti',
        name: 'Swift',
        category: 'Hatchback',
        fuelType: 'Petrol',
        transmission: 'Manual',
        seats: 5,
        pricePerDay: 1500,
        description:
            'Compact and practical for city driving, quick commutes, and fuel-efficient weekend travel.',
        image: '/assets/cars/swift-default.svg',
        isActive: true,
    },
    {
        id: 'model-i20',
        brand: 'Hyundai',
        name: 'i20',
        category: 'Hatchback',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        pricePerDay: 1800,
        description:
            'Comfortable automatic premium hatchback with refined interior and modern tech.',
        image: '/assets/cars/i20-default.svg',
        isActive: true,
    },
    {
        id: 'model-brezza',
        brand: 'Maruti',
        name: 'Brezza',
        category: 'Compact SUV',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        pricePerDay: 2200,
        description:
            'Practical compact SUV with high ground clearance, ideal for family and hill station trips.',
        image: '/assets/cars/brezza-default.svg',
        isActive: true,
    },
    {
        id: 'model-creta',
        brand: 'Hyundai',
        name: 'Creta',
        category: 'SUV',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        seats: 5,
        pricePerDay: 2700,
        description:
            'Spacious, powerful SUV suited for comfortable highway journeys and long road trips.',
        image: '/assets/cars/creta-default.svg',
        isActive: true,
    },
];

export const INITIAL_PHYSICAL_VEHICLES: PhysicalVehicle[] = [
    {
        id: 'car-001',
        modelId: 'model-swift',
        internalCode: 'CAR-001',
        year: 2025,
        status: 'ACTIVE',
        registrationReference: 'TN 38 BX 1024',
        images: ['/assets/cars/swift-default.svg'],
    },
    {
        id: 'car-002',
        modelId: 'model-swift',
        internalCode: 'CAR-002',
        year: 2026,
        status: 'ACTIVE',
        registrationReference: 'TN 38 BY 2048',
        images: ['/assets/cars/swift-default.svg'],
    },
    {
        id: 'car-003',
        modelId: 'model-swift',
        internalCode: 'CAR-003',
        year: 2026,
        status: 'INACTIVE',
        inactiveReason: 'Scheduled Service',
        registrationReference: 'TN 38 CA 3096',
        images: ['/assets/cars/swift-default.svg'],
    },
    {
        id: 'car-004',
        modelId: 'model-i20',
        internalCode: 'CAR-004',
        year: 2025,
        status: 'ACTIVE',
        registrationReference: 'TN 37 AB 4401',
        images: ['/assets/cars/i20-default.svg'],
    },
    {
        id: 'car-005',
        modelId: 'model-i20',
        internalCode: 'CAR-005',
        year: 2026,
        status: 'ACTIVE',
        registrationReference: 'TN 37 AC 5502',
        images: ['/assets/cars/i20-default.svg'],
    },
    {
        id: 'car-006',
        modelId: 'model-brezza',
        internalCode: 'CAR-006',
        year: 2025,
        status: 'ACTIVE',
        registrationReference: 'TN 38 BR 6603',
        images: ['/assets/cars/brezza-default.svg'],
    },
    {
        id: 'car-007',
        modelId: 'model-brezza',
        internalCode: 'CAR-007',
        year: 2026,
        status: 'INACTIVE',
        inactiveReason: 'Body Repair',
        registrationReference: 'TN 38 BR 7704',
        images: ['/assets/cars/brezza-default.svg'],
    },
    {
        id: 'car-008',
        modelId: 'model-creta',
        internalCode: 'CAR-008',
        year: 2025,
        status: 'ACTIVE',
        registrationReference: 'TN 37 CR 8805',
        images: ['/assets/cars/creta-default.svg'],
    },
    {
        id: 'car-009',
        modelId: 'model-creta',
        internalCode: 'CAR-009',
        year: 2026,
        status: 'ACTIVE',
        registrationReference: 'TN 37 CR 9906',
        images: ['/assets/cars/creta-default.svg'],
    },
];

export const INITIAL_BOOKINGS: Booking[] = [
    {
        id: 'booking-001',
        publicReference: 'BK-20260905-001',
        privateStatusToken: 'mock-status-token-001',
        modelId: 'model-swift',
        assignedVehicleId: 'car-001',
        customerName: 'Rahul Kumar',
        customerPhone: '+91 90000 10001',
        customerEmail: 'rahul.k@example.com',
        requestedPickupAt: '2026-09-05T08:00:00+05:30',
        requestedReturnAt: '2026-09-06T22:00:00+05:30',
        confirmedPickupAt: '2026-09-05T09:00:00+05:30',
        confirmedReturnAt: '2026-09-06T21:00:00+05:30',
        status: 'CONFIRMED',
        source: 'WEBSITE',
        createdAt: '2026-09-04T10:00:00+05:30',
        updatedAt: '2026-09-04T14:30:00+05:30',
        events: [
            {
                id: 'ev-1',
                bookingId: 'booking-001',
                eventType: 'CREATED',
                toStatus: 'PENDING',
                createdAt: '2026-09-04T10:00:00+05:30',
            },
            {
                id: 'ev-2',
                bookingId: 'booking-001',
                eventType: 'CONFIRMED',
                fromStatus: 'PENDING',
                toStatus: 'CONFIRMED',
                note: 'Assigned CAR-001',
                createdAt: '2026-09-04T14:30:00+05:30',
            },
        ],
    },
    {
        id: 'booking-002',
        publicReference: 'BK-20260906-002',
        privateStatusToken: 'mock-status-token-002',
        modelId: 'model-i20',
        customerName: 'Priya Sundaram',
        customerPhone: '+91 90000 10002',
        customerEmail: 'priya.s@example.com',
        customerMessage:
            'Need early pickup if possible. Planning a trip to Pollachi.',
        requestedPickupAt: '2026-09-06T11:00:00+05:30',
        requestedReturnAt: '2026-09-08T20:00:00+05:30',
        status: 'PENDING',
        source: 'WEBSITE',
        createdAt: '2026-09-05T15:00:00+05:30',
        updatedAt: '2026-09-05T15:00:00+05:30',
        events: [
            {
                id: 'ev-3',
                bookingId: 'booking-002',
                eventType: 'CREATED',
                toStatus: 'PENDING',
                createdAt: '2026-09-05T15:00:00+05:30',
            },
        ],
    },
    {
        id: 'booking-003',
        publicReference: 'BK-20260906-003',
        privateStatusToken: 'mock-status-token-003',
        modelId: 'model-brezza',
        assignedVehicleId: 'car-006',
        customerName: 'Arun Vijay',
        customerPhone: '+91 90000 10003',
        requestedPickupAt: '2026-09-06T14:00:00+05:30',
        requestedReturnAt: '2026-09-07T21:00:00+05:30',
        confirmedPickupAt: '2026-09-06T14:00:00+05:30',
        confirmedReturnAt: '2026-09-07T21:00:00+05:30',
        status: 'ONGOING',
        source: 'PHONE',
        createdAt: '2026-09-05T18:00:00+05:30',
        updatedAt: '2026-09-06T14:00:00+05:30',
        events: [
            {
                id: 'ev-4',
                bookingId: 'booking-003',
                eventType: 'OFFLINE_CREATED',
                toStatus: 'CONFIRMED',
                createdAt: '2026-09-05T18:00:00+05:30',
            },
            {
                id: 'ev-5',
                bookingId: 'booking-003',
                eventType: 'STARTED',
                fromStatus: 'CONFIRMED',
                toStatus: 'ONGOING',
                createdAt: '2026-09-06T14:00:00+05:30',
            },
        ],
    },
    {
        id: 'booking-004',
        publicReference: 'BK-20260907-004',
        privateStatusToken: 'mock-status-token-004',
        modelId: 'model-swift',
        assignedVehicleId: 'car-002',
        customerName: 'Meena Ramesh',
        customerPhone: '+91 90000 10004',
        requestedPickupAt: '2026-09-10T09:00:00+05:30',
        requestedReturnAt: '2026-09-12T20:00:00+05:30',
        confirmedPickupAt: '2026-09-10T09:00:00+05:30',
        confirmedReturnAt: '2026-09-12T20:00:00+05:30',
        status: 'CONFIRMED',
        source: 'WEBSITE',
        createdAt: '2026-09-05T09:00:00+05:30',
        updatedAt: '2026-09-05T11:00:00+05:30',
        events: [
            {
                id: 'ev-6',
                bookingId: 'booking-004',
                eventType: 'CREATED',
                toStatus: 'PENDING',
                createdAt: '2026-09-05T09:00:00+05:30',
            },
            {
                id: 'ev-7',
                bookingId: 'booking-004',
                eventType: 'CONFIRMED',
                fromStatus: 'PENDING',
                toStatus: 'CONFIRMED',
                createdAt: '2026-09-05T11:00:00+05:30',
            },
        ],
    },
    {
        id: 'booking-005',
        publicReference: 'BK-20260908-005',
        privateStatusToken: 'mock-status-token-005',
        modelId: 'model-creta',
        customerName: 'Karthik Prakash',
        customerPhone: '+91 90000 10005',
        requestedPickupAt: '2026-09-12T10:00:00+05:30',
        requestedReturnAt: '2026-09-14T19:00:00+05:30',
        status: 'REJECTED',
        source: 'WEBSITE',
        createdAt: '2026-09-05T16:00:00+05:30',
        updatedAt: '2026-09-05T17:00:00+05:30',
        events: [
            {
                id: 'ev-8',
                bookingId: 'booking-005',
                eventType: 'CREATED',
                toStatus: 'PENDING',
                createdAt: '2026-09-05T16:00:00+05:30',
            },
            {
                id: 'ev-9',
                bookingId: 'booking-005',
                eventType: 'REJECTED',
                fromStatus: 'PENDING',
                toStatus: 'REJECTED',
                note: 'Fleet unavailable for extended booking',
                createdAt: '2026-09-05T17:00:00+05:30',
            },
        ],
    },
];

export const INITIAL_VEHICLE_BLOCKS: VehicleBlock[] = [
    {
        id: 'block-001',
        physicalVehicleId: 'car-003',
        startsAt: '2026-09-09T09:00:00+05:30',
        endsAt: '2026-09-12T18:00:00+05:30',
        reason: 'Scheduled Periodic Service & Inspection',
    },
];

export const INITIAL_BUSINESS_CLOSURES: BusinessClosure[] = [
    {
        id: 'closure-001',
        startsAt: '2026-09-14T00:00:00+05:30',
        endsAt: '2026-09-16T23:59:59+05:30',
        reason: 'Annual Maintenance & Holiday',
    },
];
