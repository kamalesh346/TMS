/*
  Warnings:

  - You are about to drop the column `assignedAt` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `trip` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `booking_userId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `booking_vehicleTypeId_fkey`;

-- DropForeignKey
ALTER TABLE `trip` DROP FOREIGN KEY `trip_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `trip` DROP FOREIGN KEY `trip_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `trip` DROP FOREIGN KEY `trip_vehicleId_fkey`;

-- DropIndex
DROP INDEX `trip_bookingId_key` ON `trip`;

-- AlterTable
ALTER TABLE `booking` ADD COLUMN `tripId` INTEGER NULL;

-- AlterTable
ALTER TABLE `trip` DROP COLUMN `assignedAt`,
    DROP COLUMN `bookingId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `endTime` DATETIME(3) NOT NULL,
    ADD COLUMN `startTime` DATETIME(3) NOT NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled';

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_vehicleTypeId_fkey` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicletype`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicle`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
