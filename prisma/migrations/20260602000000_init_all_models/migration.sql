-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "FacilityCategory" AS ENUM ('toilet', 'auditorium', 'food', 'medical', 'parking', 'shuttle', 'hotel', 'accommodation');

-- CreateEnum
CREATE TYPE "FacilityStatus" AS ENUM ('open', 'closed', 'crowded', 'maintenance');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('comment', 'issue');

-- CreateEnum
CREATE TYPE "ReportSeverity" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('cleanliness', 'accessibility', 'crowd', 'damage', 'other');

-- CreateEnum
CREATE TYPE "GuideRequestStatus" AS ENUM ('pending', 'contacted', 'resolved');

-- CreateTable
CREATE TABLE "Facility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "FacilityCategory" NOT NULL,
    "description" TEXT,
    "status" "FacilityStatus" NOT NULL DEFAULT 'open',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Facility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "severity" "ReportSeverity",
    "category" "ReportCategory",
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannerCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "imageUrl" TEXT,
    "linkUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourGuideRequest" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "arrivalDate" TIMESTAMP(3) NOT NULL,
    "preferredLanguage" TEXT NOT NULL,
    "message" TEXT,
    "status" "GuideRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TourGuideRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyReport" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyReport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "Facility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Supabase Realtime on the facilities table
ALTER PUBLICATION supabase_realtime ADD TABLE "Facility";
