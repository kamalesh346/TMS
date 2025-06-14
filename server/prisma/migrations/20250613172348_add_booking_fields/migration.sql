-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "delivery" TEXT NOT NULL,
    "itemDesc" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'Unknown',
    "vehicleLength" REAL NOT NULL DEFAULT 0,
    "vehicleBreadth" REAL NOT NULL DEFAULT 0,
    "vehicleHeight" REAL NOT NULL DEFAULT 0,
    "requiredStartTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requiredEndTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "delivery", "id", "itemDesc", "pickup", "purpose", "status", "userId", "weight") SELECT "createdAt", "delivery", "id", "itemDesc", "pickup", "purpose", "status", "userId", "weight" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");
