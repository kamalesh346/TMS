const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicleTypes = ['Mini Truck', 'Tempo', 'Lorry', 'Container'];
  const locations = ['Chennai', 'Bangalore', 'Hyderabad', 'Mumbai'];

  // Seed vehicle types
  for (const name of vehicleTypes) {
    const exists = await prisma.vehicleType.findUnique({ where: { name } });
    if (!exists) {
      await prisma.vehicleType.create({ data: { name } });
      console.log(`🚚 Vehicle type added: ${name}`);
    } else {
      console.log(`✅ Vehicle type already exists: ${name}`);
    }
  }

  // Seed locations
  for (const name of locations) {
    const exists = await prisma.location.findUnique({ where: { name } });
    if (!exists) {
      await prisma.location.create({ data: { name } });
      console.log(`📍 Location added: ${name}`);
    } else {
      console.log(`✅ Location already exists: ${name}`);
    }
  }

  console.log('🌱 Seeding completed without duplicates');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
