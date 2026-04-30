-- AlterTable
ALTER TABLE "homepage_settings"
ADD COLUMN IF NOT EXISTS "popup_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "popup_badge" TEXT NOT NULL DEFAULT 'Proud Moment',
ADD COLUMN IF NOT EXISTS "popup_title" TEXT NOT NULL DEFAULT 'Celebrate our students'' success',
ADD COLUMN IF NOT EXISTS "popup_message" TEXT NOT NULL DEFAULT 'Special offers, student highlights, and important announcements appear here.',
ADD COLUMN IF NOT EXISTS "popup_cta_text" TEXT NOT NULL DEFAULT 'See Offers',
ADD COLUMN IF NOT EXISTS "popup_cta_url" TEXT NOT NULL DEFAULT '/courses';