import { PrismaClient, OperationalStatus, BookingStatus, BookingSource, ActorType } from '@prisma/client';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Mirrors hashPassword() in apps/web/lib/server/security.ts.
 * The auth service's verifyPassword() uses this salted form as its primary
 * verification path.  Using the bare sha256 only works via a fallback branch.
 * This keeps the seed hash consistent with the production auth mechanism.
 */
function hashPassword(password: string, salt: string = 'drivenest_salt'): string {
  return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

async function main() {
  console.log('🌱 Starting DriveNest deterministic database seed...');

  // 1. Read seed-data.json
  const seedFilePath = path.join(__dirname, '../data/seed-data.json');
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Seed data file not found at ${seedFilePath}`);
  }
  const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

  // 2. Clean/Reset tables in safe dependency order for idempotency
  await prisma.bookingEvent.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.vehicleBlock.deleteMany({});
  await prisma.imageAsset.deleteMany({});
  await prisma.physicalVehicle.deleteMany({});
  await prisma.vehicleModel.deleteMany({});
  await prisma.adminSession.deleteMany({});
  await prisma.adminUser.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.businessContent.deleteMany({});
  await prisma.businessClosure.deleteMany({});
  await prisma.businessHour.deleteMany({});
  await prisma.businessProfile.deleteMany({});

  // 3. Upsert BusinessProfile
  const business = await prisma.businessProfile.create({
    data: {
      id: 'biz-drivenest-01',
      name: seedData.business.name,
      slug: seedData.business.slug,
      description: seedData.business.tagline,
      city: seedData.business.city,
      address: seedData.business.address,
      phone: seedData.business.phone,
      whatsappNumber: seedData.business.whatsappNumber,
      email: seedData.business.email,
      mapUrl: 'https://maps.google.com/?q=118+Avinashi+Road+Coimbatore',
      logoUrl: '/logos/drivenest-primary.svg',
      timezone: 'Asia/Kolkata',
    },
  });
  console.log(`✓ Business profile seeded: ${business.name} (${business.id})`);

  // 4. Seed BusinessHours
  const weekdayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  for (const [dayName, hours] of Object.entries(seedData.business.hours)) {
    const weekday = weekdayMap[dayName.toLowerCase()];
    if (weekday !== undefined && Array.isArray(hours) && hours.length === 2) {
      await prisma.businessHour.create({
        data: {
          businessId: business.id,
          weekday,
          opensAt: hours[0],
          closesAt: hours[1],
          isClosed: false,
        },
      });
    }
  }
  console.log('✓ Business hours seeded (7 days, 07:00–21:00 / 08:00–20:00)');

  // 5. Seed BusinessContent
  await prisma.businessContent.create({
    data: {
      businessId: business.id,
      aboutContent:
        'DriveNest is Coimbatore’s premier self-drive car rental provider, offering spotless, well-maintained vehicles for city, weekend, and outstation trips.',
      whyChooseUs:
        '• Transparent pricing with zero hidden charges\n• Doorstep delivery and pickup available across Coimbatore\n• Verified fleet in peak mechanical condition\n• Dedicated WhatsApp and phone support throughout your trip',
      servicesContent:
        'Self-drive hatchback, compact SUV, and full-size SUV rentals with transparent daily pricing and verified availability.',
      pickupInstructions:
        'Please arrive 10 minutes prior to your scheduled pickup time with your original driving licence and Aadhaar card for physical verification.',
      returnInstructions:
        'Return the vehicle with the same fuel level as received. Our executive will inspect the car and complete the checkout.',
      fuelPolicy: 'Same-to-same fuel policy. Return with the same fuel level as handover.',
      kmPolicy: 'Generous 300 km/day allowance included. Extra km charged at standard rate.',
      cancellationPolicy:
        'Free cancellation up to 24 hours before pickup. Cancellations within 24 hours subject to nominal charge.',
      googleReviewUrl: seedData.business.googleReviewUrl,
    },
  });
  console.log('✓ Business content and policies seeded');

  // 6. Seed FAQs
  for (let i = 0; i < seedData.faqs.length; i++) {
    const faq = seedData.faqs[i];
    await prisma.faq.create({
      data: {
        businessId: business.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: i + 1,
        isActive: true,
      },
    });
  }
  console.log(`✓ ${seedData.faqs.length} FAQs seeded`);

  // 7. Seed AdminUser with development password hash
  // Password for local development testing: 'password123' (Argon2id/SHA-256 hashed)
  const defaultAdmin = await prisma.adminUser.create({
    data: {
      id: 'admin-owner-01',
      businessId: business.id,
      name: 'DriveNest Owner',
      email: 'owner@drivenest.example',
      // hashPassword() matches verifyPassword() in apps/web/lib/server/security.ts.
      // The primary verification path uses salted SHA-256: sha256('drivenest_salt:password').
      // Storing the salted hash here means login succeeds via the primary branch,
      // not just the legacy bare-SHA-256 fallback.
      passwordHash: hashPassword('password123'),
      isActive: true,
    },
  });
  console.log(`✓ Default AdminUser seeded: ${defaultAdmin.email}`);

  // 8. Seed VehicleModels
  for (const model of seedData.vehicleModels) {
    await prisma.vehicleModel.create({
      data: {
        id: model.id,
        businessId: business.id,
        brand: model.brand,
        name: model.name,
        category: model.category,
        fuelType: model.fuelType,
        transmission: model.transmission,
        seats: model.seats,
        pricePerDay: model.pricePerDay,
        description: model.description,
        isArchived: false,
      },
    });
  }
  console.log(`✓ ${seedData.vehicleModels.length} Vehicle models seeded`);

  // 9. Seed PhysicalVehicles
  for (const car of seedData.physicalVehicles) {
    await prisma.physicalVehicle.create({
      data: {
        id: car.id,
        businessId: business.id,
        vehicleModelId: car.modelId,
        internalCode: car.internalCode,
        modelYear: car.year,
        registrationRef: `TN-38-${car.internalCode.replace('CAR-', 'DN-')}`,
        operationalStatus: car.status as OperationalStatus,
        inactiveReason: car.inactiveReason || null,
        internalNotes: car.status === 'INACTIVE' ? `Scheduled for ${car.inactiveReason}` : 'In active fleet rotation',
      },
    });
  }
  console.log(`✓ ${seedData.physicalVehicles.length} Physical vehicles seeded`);

  // 10. Seed VehicleBlocks
  for (const block of seedData.vehicleBlocks) {
    await prisma.vehicleBlock.create({
      data: {
        id: block.id,
        businessId: business.id,
        physicalVehicleId: block.vehicleId,
        startsAt: new Date(block.startsAt),
        endsAt: new Date(block.endsAt),
        reason: block.reason,
      },
    });
  }
  console.log(`✓ ${seedData.vehicleBlocks.length} Vehicle blocks seeded`);

  // 11. Seed BusinessClosures
  for (const closure of seedData.businessClosures) {
    await prisma.businessClosure.create({
      data: {
        id: closure.id,
        businessId: business.id,
        startsAt: new Date(closure.startsAt),
        endsAt: new Date(closure.endsAt),
        reason: closure.reason,
      },
    });
  }
  console.log(`✓ ${seedData.businessClosures.length} Business closures seeded`);

  // 12. Seed Bookings & Events
  for (const b of seedData.bookings) {
    const rawToken = `seed_token_${b.id}`;
    const tokenHash = sha256(rawToken);

    const booking = await prisma.booking.create({
      data: {
        id: b.id,
        publicReference: b.publicReference,
        statusTokenHash: tokenHash,
        businessId: business.id,
        vehicleModelId: b.modelId,
        assignedVehicleId: b.assignedVehicleId || null,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: `${b.customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        customerMessage: 'Requested via online portal',
        requestedPickupAt: new Date(b.requestedPickupAt),
        requestedReturnAt: new Date(b.requestedReturnAt),
        confirmedPickupAt: b.confirmedPickupAt ? new Date(b.confirmedPickupAt) : null,
        confirmedReturnAt: b.confirmedReturnAt ? new Date(b.confirmedReturnAt) : null,
        status: b.status as BookingStatus,
        source: b.source as BookingSource,
        ownerNotes: b.status === 'REJECTED' ? 'Customer requested unavailable dates' : null,
      },
    });

    // Create initial booking event
    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: 'CREATED',
        fromStatus: null,
        toStatus: BookingStatus.PENDING,
        assignedVehicleId: null,
        actorType: ActorType.CUSTOMER,
        notes: 'Initial booking request submitted',
      },
    });

    // If confirmed/ongoing/rejected, record lifecycle progression event
    if (b.status === 'CONFIRMED' || b.status === 'ONGOING') {
      await prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          eventType: 'CONFIRMED',
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CONFIRMED,
          assignedVehicleId: b.assignedVehicleId,
          actorType: ActorType.OWNER,
          notes: 'Owner confirmed booking and allocated vehicle',
        },
      });
    }

    if (b.status === 'ONGOING') {
      await prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          eventType: 'STARTED',
          fromStatus: BookingStatus.CONFIRMED,
          toStatus: BookingStatus.ONGOING,
          assignedVehicleId: b.assignedVehicleId,
          actorType: ActorType.OWNER,
          notes: 'Customer picked up vehicle',
        },
      });
    }

    if (b.status === 'REJECTED') {
      await prisma.bookingEvent.create({
        data: {
          bookingId: booking.id,
          eventType: 'REJECTED',
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.REJECTED,
          assignedVehicleId: null,
          actorType: ActorType.OWNER,
          notes: 'Request declined due to schedule conflict',
        },
      });
    }
  }
  console.log(`✓ ${seedData.bookings.length} Bookings with full audit trails seeded`);

  // 13. Seed ImageAssets for Models
  for (const model of seedData.vehicleModels) {
    const slug = model.name.toLowerCase();
    await prisma.imageAsset.create({
      data: {
        businessId: business.id,
        vehicleModelId: model.id,
        storageKey: `cars/${slug}-default.svg`,
        publicUrl: `/cars/${slug}-default.svg`,
        imageKind: 'MODEL_DEFAULT',
        altText: `${model.brand} ${model.name} Default Silhouette`,
        sortOrder: 1,
      },
    });
  }
  console.log('✓ Model generic image assets seeded');

  console.log('🎉 DriveNest database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error executing database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
