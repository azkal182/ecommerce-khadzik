/*
  Warnings:

  - Made the column `priceAbsolute` on table `Variant` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Variant" ALTER COLUMN "priceAbsolute" SET NOT NULL,
ALTER COLUMN "priceAbsolute" SET DEFAULT 0;
