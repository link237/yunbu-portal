/*
  Warnings:

  - The primary key for the `TeamMember` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `TeamMember` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserApp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `canUse` on the `UserApp` table. All the data in the column will be lost.
  - You are about to drop the column `canView` on the `UserApp` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserApp` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,teamId]` on the table `TeamMember` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,teamId,appId]` on the table `UserApp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `TeamMember` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `UserApp` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "TeamMember_teamId_idx";

-- DropIndex
DROP INDEX "TeamMember_userId_idx";

-- DropIndex
DROP INDEX "UserApp_appId_idx";

-- DropIndex
DROP INDEX "UserApp_userId_idx";

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_pkey",
DROP COLUMN "updatedAt",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "username" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserApp" DROP CONSTRAINT "UserApp_pkey",
DROP COLUMN "canUse",
DROP COLUMN "canView",
DROP COLUMN "updatedAt",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserApp_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_teamId_key" ON "TeamMember"("userId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "UserApp_userId_teamId_appId_key" ON "UserApp"("userId", "teamId", "appId");
