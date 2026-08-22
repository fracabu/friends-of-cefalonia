-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'it';

-- CreateTable
CREATE TABLE "ListingTranslation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ListingTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListingTranslation_locale_idx" ON "ListingTranslation"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "ListingTranslation_listingId_locale_key" ON "ListingTranslation"("listingId", "locale");

-- AddForeignKey
ALTER TABLE "ListingTranslation" ADD CONSTRAINT "ListingTranslation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

