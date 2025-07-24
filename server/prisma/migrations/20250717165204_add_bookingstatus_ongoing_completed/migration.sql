-- AlterTable
ALTER TABLE `booking` MODIFY `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'assigned', 'ongoing', 'completed') NOT NULL DEFAULT 'pending';
