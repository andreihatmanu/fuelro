/*
  Warnings:

  - A unique constraint covering the columns `[externalId]` on the table `Station` will be added. If there are existing duplicate values, this will fail.
  - Made the column `externalId` on table `Station` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Station" ALTER COLUMN "externalId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Station_externalId_key" ON "Station"("externalId");
