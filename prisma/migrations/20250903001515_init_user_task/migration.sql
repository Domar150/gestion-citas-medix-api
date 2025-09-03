/*
  Warnings:

  - You are about to drop the `appointments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `doctors` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."appointments";

-- DropTable
DROP TABLE "public"."doctors";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "public"."Category"("name");
