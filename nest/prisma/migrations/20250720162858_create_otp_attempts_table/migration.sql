/*
  Warnings:

  - You are about to drop the column `attempts` on the `otps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "otps" DROP COLUMN "attempts";

-- CreateTable
CREATE TABLE "otp_attempts" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "OtpType" NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "otp_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "otp_attempts_userId_type_key" ON "otp_attempts"("userId", "type");

-- AddForeignKey
ALTER TABLE "otp_attempts" ADD CONSTRAINT "otp_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
