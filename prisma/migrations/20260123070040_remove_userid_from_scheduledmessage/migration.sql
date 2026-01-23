/*
  Warnings:

  - You are about to drop the column `userId` on the `ScheduledMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ScheduledMessage" DROP CONSTRAINT "ScheduledMessage_userId_fkey";

-- DropIndex
DROP INDEX "ScheduledMessage_userId_idx";

-- AlterTable
ALTER TABLE "ScheduledMessage" DROP COLUMN "userId";
