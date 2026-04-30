-- CreateTable
CREATE TABLE IF NOT EXISTS "homepage_settings" (
    "id" SERIAL NOT NULL,
    "studentsPlaced" TEXT NOT NULL DEFAULT '15,000+',
    "visaSuccessRate" TEXT NOT NULL DEFAULT '98%',
    "universityPartners" TEXT NOT NULL DEFAULT '50+',
    "phoneNumber" TEXT NOT NULL DEFAULT '+880 1777-123456',
    "whatsappNumber" TEXT NOT NULL DEFAULT '+880 1777-123456',
    "email" TEXT NOT NULL DEFAULT 'info@eclglobal.com',
    "heroTitle" TEXT NOT NULL DEFAULT 'Your Passport to Academic Adventure',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Bangladesh''s #1 Study Abroad Consultant. Transform your global education dreams into reality with expert guidance, proven results, and personalized support.',
    "leadFormTitle" TEXT NOT NULL DEFAULT 'Start Your Journey Today',
    "leadFormSubtitle" TEXT NOT NULL DEFAULT 'Get personalized guidance from our experts',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homepage_settings_pkey" PRIMARY KEY ("id")
);