-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'ATTIC', 'VILLA', 'TOWNHOUSE', 'LOFT', 'ROOM', 'GARAGE', 'OFFICE', 'SHOP', 'WAREHOUSE', 'LAND', 'BUILDING');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RESERVED', 'SOLD', 'RENTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropertyCondition" AS ENUM ('NEW', 'RENOVATED', 'GOOD', 'TO_RENOVATE');

-- CreateEnum
CREATE TYPE "EnergyClass" AS ENUM ('A4', 'A3', 'A2', 'A1', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'EXEMPT', 'PENDING');

-- CreateEnum
CREATE TYPE "HeatingType" AS ENUM ('AUTONOMOUS', 'CENTRALIZED', 'ABSENT');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('FREE', 'OCCUPIED', 'RENTED');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('FULL', 'BARE', 'SHARED');

-- CreateEnum
CREATE TYPE "FurnishedState" AS ENUM ('FURNISHED', 'PARTIALLY', 'UNFURNISHED');

-- CreateEnum
CREATE TYPE "AlertFrequency" AS ENUM ('NONE', 'INSTANT', 'DAILY', 'WEEKLY');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'SCHEDULED', 'CLOSED', 'SPAM');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('REGION', 'PROVINCE', 'CITY', 'ZONE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "agencyId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "addressLine" TEXT,
    "city" TEXT,
    "province" TEXT,
    "vatNumber" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reference" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contract" "ContractType" NOT NULL,
    "type" "PropertyType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "price" INTEGER,
    "priceOnRequest" BOOLEAN NOT NULL DEFAULT false,
    "condoFees" INTEGER,
    "deposit" INTEGER,
    "surface" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floor" INTEGER,
    "totalFloors" INTEGER,
    "yearBuilt" INTEGER,
    "elevator" BOOLEAN NOT NULL DEFAULT false,
    "garden" BOOLEAN NOT NULL DEFAULT false,
    "terrace" BOOLEAN NOT NULL DEFAULT false,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "parking" BOOLEAN NOT NULL DEFAULT false,
    "cellar" BOOLEAN NOT NULL DEFAULT false,
    "pool" BOOLEAN NOT NULL DEFAULT false,
    "airCon" BOOLEAN NOT NULL DEFAULT false,
    "furnished" "FurnishedState",
    "condition" "PropertyCondition",
    "heating" "HeatingType",
    "energy" "EnergyClass",
    "petsAllowed" BOOLEAN,
    "features" TEXT[],
    "isAuction" BOOLEAN NOT NULL DEFAULT false,
    "isNewBuild" BOOLEAN NOT NULL DEFAULT false,
    "hasFloorPlan" BOOLEAN NOT NULL DEFAULT false,
    "virtualTourUrl" TEXT,
    "utilitiesIncluded" BOOLEAN NOT NULL DEFAULT false,
    "availability" "Availability",
    "ownership" "OwnershipType" NOT NULL DEFAULT 'FULL',
    "addressLine" TEXT,
    "hideAddress" BOOLEAN NOT NULL DEFAULT false,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "postalCode" TEXT,
    "zone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "agencyId" TEXT,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbUrl" TEXT,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateTable
CREATE TABLE "SavedSearch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" JSONB NOT NULL,
    "frequency" "AlertFrequency" NOT NULL DEFAULT 'NONE',
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "province" TEXT,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "parentId" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_agencyId_idx" ON "User"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_slug_key" ON "Agency"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_reference_key" ON "Listing"("reference");

-- CreateIndex
CREATE INDEX "Listing_status_contract_type_idx" ON "Listing"("status", "contract", "type");

-- CreateIndex
CREATE INDEX "Listing_status_city_contract_idx" ON "Listing"("status", "city", "contract");

-- CreateIndex
CREATE INDEX "Listing_status_price_idx" ON "Listing"("status", "price");

-- CreateIndex
CREATE INDEX "Listing_status_publishedAt_idx" ON "Listing"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "Listing_status_contract_isAuction_idx" ON "Listing"("status", "contract", "isAuction");

-- CreateIndex
CREATE INDEX "Listing_latitude_longitude_idx" ON "Listing"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Listing_ownerId_idx" ON "Listing"("ownerId");

-- CreateIndex
CREATE INDEX "Listing_agencyId_idx" ON "Listing"("agencyId");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_position_idx" ON "ListingImage"("listingId", "position");

-- CreateIndex
CREATE INDEX "Favorite_listingId_idx" ON "Favorite"("listingId");

-- CreateIndex
CREATE INDEX "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX "Lead_listingId_createdAt_idx" ON "Lead"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Location_type_name_idx" ON "Location"("type", "name");

-- CreateIndex
CREATE INDEX "Location_parentId_idx" ON "Location"("parentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedSearch" ADD CONSTRAINT "SavedSearch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

