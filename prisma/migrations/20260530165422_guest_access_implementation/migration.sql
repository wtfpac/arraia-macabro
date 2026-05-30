/*
  Warnings:

  - You are about to drop the column `confirmed` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `plusOne` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `plusOneName` on the `Guest` table. All the data in the column will be lost.
  - You are about to drop the column `plusOnePhone` on the `Guest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Guest" DROP COLUMN "confirmed",
DROP COLUMN "phone",
DROP COLUMN "plusOne",
DROP COLUMN "plusOneName",
DROP COLUMN "plusOnePhone";

-- AlterTable
ALTER TABLE "GuestAccess" ADD COLUMN     "fingerprint" TEXT;

-- CreateTable
CREATE TABLE "GuestResponse" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL,
    "plusOne" BOOLEAN NOT NULL,
    "plusOneName" TEXT,
    "plusOnePhone" TEXT,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestResponse_guestId_key" ON "GuestResponse"("guestId");

-- AddForeignKey
ALTER TABLE "GuestResponse" ADD CONSTRAINT "GuestResponse_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
