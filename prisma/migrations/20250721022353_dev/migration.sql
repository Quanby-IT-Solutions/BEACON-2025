-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('SEAFARER', 'CORPORATE_PROFESSIONAL', 'STUDENTS', 'OTHERS', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'VISITOR');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAccounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "student" JSONB,
    "seafarer" JSONB,
    "corporate_professional" JSONB,
    "others" JSONB,
    "consent" BOOLEAN NOT NULL,
    "status" "ActiveStatus" NOT NULL DEFAULT 'PENDING',
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "UserAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserDetails" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "userType" "UserType" NOT NULL,
    "userRole" TEXT,
    "bday" TIMESTAMP(3) NOT NULL,
    "sex" TEXT,
    "address" JSONB NOT NULL,
    "phone" TEXT NOT NULL,
    "profileImage" TEXT NOT NULL,

    CONSTRAINT "UserDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAccounts_email_key" ON "UserAccounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserAccounts_resetToken_key" ON "UserAccounts"("resetToken");

-- AddForeignKey
ALTER TABLE "UserAccounts" ADD CONSTRAINT "UserAccounts_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDetails" ADD CONSTRAINT "UserDetails_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
