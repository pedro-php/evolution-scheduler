/*
  Warnings:

  - You are about to drop the column `adminId` on the `ScheduledMessage` table. All the data in the column will be lost.
  - You are about to drop the column `instance` on the `ScheduledMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScheduledMessage" DROP CONSTRAINT "ScheduledMessage_adminId_fkey";

-- DropIndex
DROP INDEX "ScheduledMessage_adminId_idx";

-- AlterTable
ALTER TABLE "ScheduledMessage" DROP COLUMN "adminId",
DROP COLUMN "instance",
ADD COLUMN     "instanceId" TEXT;

-- AddForeignKey
ALTER TABLE "ScheduledMessage" ADD CONSTRAINT "ScheduledMessage_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "Instance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
