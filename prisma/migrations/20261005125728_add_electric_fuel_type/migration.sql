/*
  Warnings:

  - A unique constraint covering the columns `[stationId,fuelType,observedAt]` on the table `FuelPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "FuelType" ADD VALUE 'ELECTRIC';

-- CreateIndex
CREATE UNIQUE INDEX "FuelPrice_stationId_fuelType_observedAt_key" ON "FuelPrice"("stationId", "fuelType", "observedAt");
