import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_INDUSTRY_TEMPLATES } from '../src/services/templateEngine';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PJN LeadFlow database...');

  const passwordHash = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@pjntechnologies.com' },
    update: {},
    create: {
      id: 'default-user-id',
      email: 'admin@pjntechnologies.com',
      name: 'PJN Technologies Admin',
      passwordHash,
      role: 'ADMIN',
      settings: {
        create: {
          companyName: 'PJN Technologies',
          companySignature: '— PJN Technologies',
          defaultCountry: 'IN (+91)'
        }
      }
    }
  });

  console.log(`✅ Default User: ${user.email}`);

  // Seed default templates
  for (const t of DEFAULT_INDUSTRY_TEMPLATES) {
    await prisma.messageTemplate.create({
      data: {
        userId: user.id,
        name: t.name,
        category: t.category,
        content: t.content,
        isDefault: t.category === 'General Business'
      }
    });
  }
  console.log(`✅ Seeded ${DEFAULT_INDUSTRY_TEMPLATES.length} message templates.`);

  // Seed initial realistic leads for testing
  const sampleLeads = [
    {
      businessName: 'Decor N More LLC',
      category: 'Interior Design',
      phone: '+971 56 644 5055',
      normalizedPhone: '971566445055',
      country: 'AE',
      city: 'Dubai',
      address: 'Business Bay, Tower B, Office 402',
      rating: 4.9,
      reviews: 110,
      status: 'PENDING'
    },
    {
      businessName: 'Apex Construction Pvt Ltd',
      category: 'Construction',
      phone: '+91 98765 43210',
      normalizedPhone: '919876543210',
      country: 'IN',
      city: 'Bangalore',
      address: 'MG Road, Indiranagar',
      rating: 4.7,
      reviews: 85,
      status: 'PENDING'
    },
    {
      businessName: 'Grand Spice Restaurant',
      category: 'Restaurant',
      phone: '+91 98123 45678',
      normalizedPhone: '919812345678',
      country: 'IN',
      city: 'Mumbai',
      address: 'Bandra West, Hill Road',
      rating: 4.5,
      reviews: 240,
      status: 'PENDING'
    },
    {
      businessName: 'Skyline Real Estate Consultants',
      category: 'Real Estate',
      phone: '+971 50 123 9876',
      normalizedPhone: '971501239876',
      country: 'AE',
      city: 'Dubai',
      address: 'Downtown Dubai, Boulevard',
      rating: 4.8,
      reviews: 95,
      status: 'PENDING'
    },
    {
      businessName: 'Glow & Shine Beauty Salon',
      category: 'Salon',
      phone: '+91 97654 32109',
      normalizedPhone: '919765432109',
      country: 'IN',
      city: 'Delhi',
      address: 'South Extension Part 2',
      rating: 4.6,
      reviews: 62,
      status: 'PENDING'
    }
  ];

  for (const lead of sampleLeads) {
    await prisma.lead.create({
      data: {
        userId: user.id,
        ...lead
      }
    });
  }

  console.log(`✅ Seeded ${sampleLeads.length} sample leads.`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
