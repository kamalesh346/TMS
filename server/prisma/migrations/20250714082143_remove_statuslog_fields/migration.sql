/*
  Warnings:

  - You are about to drop the column `tripProgress` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledTime` on the `trip` table. All the data in the column will be lost.
  - You are about to drop the `bookingstatuslog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `bookingstatuslog` DROP FOREIGN KEY `BookingStatusLog_bookingId_fkey`;

-- DropForeignKey
ALTER TABLE `bookingstatuslog` DROP FOREIGN KEY `BookingStatusLog_updatedBy_fkey`;

-- AlterTable
ALTER TABLE `booking` DROP COLUMN `tripProgress`,
    ADD COLUMN `startedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `trip` DROP COLUMN `scheduledTime`;

-- DropTable
DROP TABLE `bookingstatuslog`;
