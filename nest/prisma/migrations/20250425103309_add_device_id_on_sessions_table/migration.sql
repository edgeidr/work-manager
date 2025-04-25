/*
  Warnings:

  - A unique constraint covering the columns `[deviceId]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "deviceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "sessions_deviceId_key" ON "sessions"("deviceId");
