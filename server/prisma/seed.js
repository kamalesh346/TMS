const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Define seed data
  const vehicleTypes = [
    { type: 'Mini Truck', length: 10, breadth: 5, height: 6 },
    { type: 'Pickup Van', length: 12, breadth: 6, height: 6 },
    { type: 'Container Truck', length: 20, breadth: 8, height: 8 },
    { type: 'Lorry', length: 15, breadth: 5, height: 5 }
  ];

  const locations = [
    { name: 'Warehouse A' },
    { name: 'Warehouse B' },
    { name: 'City Center' },
  ];

  // Seed vehicle types
  for (const data of vehicleTypes) {
    const exists = await prisma.vehicleType.findUnique({
      where: { type: data.type }, // ✅ FIXED
    });
    if (!exists) {
      await prisma.vehicleType.create({ data });
    }
  }

  // Seed locations
  for (const data of locations) {
    const exists = await prisma.location.findUnique({
      where: { name: data.name },
    });
    if (!exists) {
      await prisma.location.create({ data });
    }
  }
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
