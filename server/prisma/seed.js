const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // VEHICLE TYPES
  const vehicleTypes = [
    { type: 'Mini Truck', length: 10, breadth: 5, height: 6 },
    { type: 'Pickup Van', length: 12, breadth: 6, height: 6 },
    { type: 'Container Truck', length: 20, breadth: 8, height: 8 },
    { type: 'Lorry', length: 15, breadth: 5, height: 5 },
    { type: 'Tempo', length: 10, breadth: 5, height: 4 },
    { type: 'Big Eicher', length: 15, breadth: 5, height: 5 },
    { type: 'Small Eicher', length: 12, breadth: 5, height: 4 },
    { type: 'Eicher', length: 13, breadth: 4, height: 4 }
  ];

  for (const data of vehicleTypes) {
    const exists = await prisma.vehicleType.findUnique({ where: { type: data.type } });
    if (!exists) await prisma.vehicleType.create({ data });
  }

  // LOCATIONS
  const fixedLocations = [
    { name: 'Warehouse A' },
    { name: 'Warehouse B' },
    { name: 'City Center' }
  ];

  for (const data of fixedLocations) {
    const exists = await prisma.location.findUnique({ where: { name: data.name } });
    if (!exists) await prisma.location.create({ data });
  }

  // SUPPLIER LOCATIONS
  const supplierLocations = [
    "NAVIN ENGINEERING WORKS - 1/169A, Vellanaipatti Main road, Andakkapalayam, Coimbatore-641048",
    "SIGMA INDUSTRIAL - OPP: Kurichi housing unit 1, Industrial Esate Post, Coimbatore-641021",
    "DYNAMIC INDUSTRY - 15, A.N Nagar, Opp,Dharmasasta School,Vinayagapuram, Vilankurichi Road, Coimbatore-641035",
    "BEST HEAT TREATMENT SERVICES. - 53, Sidco Industrial Estate, Coimbatore-641021",
    "S S HEAVY FABRICATION - B1, Cheran industrial Estate, Kanuvai to Vadavalli road, Kanuvai, Pannimadai, Coimbatore-641017",
    "SELVAM ENGINEERING WORKS - No7,Srinivasa nagar, Avaram poalayam,Ganapathy (PO),Coimbatore-641006",
    "ALBATEC ENGINEERING - 2/688C, Adappukattu Thottam, Kulathur, Coimbatore - 641062",
    "KADAIESWARAR ENGINEERING - 2/20E, Masanakadu,sangothi palayam, Arasur Post, Coimbatore-641407",
    "PRECISION CRAFTTERS. - No.9, Krishna Nagar, Maniyakaram palayam road, Ganapathy, Coimbatore-641006",
    "P S INDUSTRIES - 172, Iyya Kovil Thottam,A.G. Puthur, Irugur, Coimbatore-641103",
    "SARO INDUSTRIALS - 154, P.N Palayam road, Ganapathy, Coimbatore-641006",
    "AROWKEY TECH - No4, Omsakthi Nagar, Chinnavedam patti, Coimbatore-641049",
    "ADITHYA PRECISION TECH - 5/5, Railway station road, Chettipalayam, Coimbatore-641201",
    "SRI GANESH ENGG - 20, Sidco Industrial Estate post, Coimbatore-641021",
    "ALPHA PRECISION PRODUCTS - SF No 142/1-2, Bharathi Sreet, Chinnavedampatti, Coimbatore-641049",
    "SRI MURUGAN ENTERPRISES - 300/1, Vilankurichi Road, Peelamedu Industrail Estate, Coimbatore-641004",
    "ARUN INDUSTRIES - No28/1, Govinda Nayakkan Palayam Main Road, Athipalayam, Coimbatore-641110",
    "TRINITY PRECISION TOOLINGS - SANGANUR R, 405 Siddha Thottam, Ganapathy, Coimbatore-641006",
    "HARSHITHA ENGINEERING - 25,North street, Govindanayakkan,Palayam, Athipalayam PO,Coimbatore-641110",
    "NMR AERO WING ENGINEERING - No177/5, Gandhi Street, Everest maha sree Avenue, Vilankurchi Post,Coimbatore-641035",
    "EXCEL INDUSTRIES - JALAHALLI WEST, ABBIGERE ROAD, KOMMAGONDANAHALLI, BANGALORE-560015",
    "KADAIESWARA MACHINE WORKS - NO.2/246 C,KARAYAMPALAYAM,MYLAMPATTI POST,COIMBATORE,TAMIL NADU PIN CODE: 641062",
    "MILL TECH - 20 E, KNK NAGAR,KANNAMPALAYAM ROAD,RANGANATHAPURAM,SULUR,COIMBATORETAMIL NADU PIN CODE: 641402",
    "WESTERN CNC ENGINEERING - 172, AYYA KOVIL THOTTAM,VEDANTA IRON GODOWN,ATHAPPA GOUNDENPUDUR,IRUGUR,COIMBATORE,TAMIL NADU PIN CODE: 641103",
    "MECHWAN AUTOMATION PRIVATE LIMITED - 171, Ph: 9751806444,ATHIPALAYAM ROAD, CHINNAVEDAMPATTI, Coimbatore, TAMIL NADU PIN CODE: 641049",
    "SRI VINAYAKA PERFECT EDM - NO.6,, KAMBAN NAGAR,NESAVALAR COLONY,ONDIPUDUR,COIMBATORE,TAMIL NADU PIN CODE: 641016",
    "COSMOCRAFT TECHNOLOGIES - No.10/65/3, SENGODA GOUNDEN PUDUR,ARASUR,COIMBATORE,TAMIL NADU PIN CODE: 641407",
    "SRI EACHANARI VINAYAGAR - 2/321-3, NEAR PANCHAYAT OFFICE,APPANAICKENPATTI,SULUR TK,COIMBATORE,TAMIL NADU PIN CODE: 641402",
    "BRINDHA INDUSTRIES. - 11263, JAYALAKSHMI NAGAR,CHINTHAMANIPUDUR POST,COIMBATORE,TAMIL NADU PIN CODE: 641103",
  ];


  for (const name of supplierLocations) {
    const exists = await prisma.location.findUnique({ where: { name } });
    if (!exists) await prisma.location.create({ data: { name } });
  }

  // DRIVER + VEHICLE MAPPING DATA
  const drivers = [
    { name: "PALANISAMY", email: "palanisamy@example.com", vehicleType: "Pickup Van", vehicleNumber: "TN37EX1575" },
    { name: "KARUPPASAMY. K. M", email: "karuppasamy@example.com", vehicleType: "Tempo", vehicleNumber: "TN37CX5649" },
    { name: "SENTHILKUMAR DURAIPALAM", email: "senthil@example.com", vehicleType: "Eicher", vehicleNumber: "TN37DZ1347" },
    { name: "JOHNKENNADY PANNEERSELVAM", email: "johnkennady@example.com", vehicleType: "Pickup Van", vehicleNumber: "TN37DZ0945" },
    { name: "SIVAKUMAR RAMASAMY", email: "sivakumar@example.com", vehicleType: "Big Eicher", vehicleNumber: "TN37CV2441" },
    { name: "SELVAM CHINNATHAMBI", email: "selvam@example.com", vehicleType: "Big Eicher", vehicleNumber: "TN37CW3794" },
    { name: "Ravi K", email: "ravi@example.com", vehicleType: "Small Eicher", vehicleNumber: "TN37CY8187" },
    { name: "Vijayakumar M", email: "vijayakumar@example.com", vehicleType: "Pickup Van", vehicleNumber: "TN37DZ0938" },
    { name: "Vikas Kumar J", email: "vikas@example.com", vehicleType: "Veero", vehicleNumber: "TN37CX1111" }
  ];

  const hashedPassword = await bcrypt.hash("default123", 10);

  for (const d of drivers) {
    // Create or fetch driver
    let driver = await prisma.user.findUnique({ where: { email: d.email } });
    if (!driver) {
      driver = await prisma.user.create({
        data: {
          name: d.name,
          email: d.email,
          password: hashedPassword,
          role: 'driver'
        }
      });
    }

    // Get vehicleType
    const vehicleType = await prisma.vehicleType.findUnique({ where: { type: d.vehicleType } });
    if (!vehicleType) {
      console.warn(`⚠️ VehicleType not found: ${d.vehicleType}`);
      continue;
    }

    // Create or fetch vehicle
    let vehicle = await prisma.vehicle.findUnique({ where: { number: d.vehicleNumber } });
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          number: d.vehicleNumber,
          vehicleTypeId: vehicleType.id
        }
      });
    }

    // Create mapping if not exists
    const mapping = await prisma.driverVehicle.findUnique({ where: { vehicleId: vehicle.id } });
    if (!mapping) {
      await prisma.driverVehicle.create({
        data: {
          driverId: driver.id,
          vehicleId: vehicle.id
        }
      });
    }
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
