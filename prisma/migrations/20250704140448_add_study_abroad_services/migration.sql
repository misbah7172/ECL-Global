-- CreateTable
CREATE TABLE "study_abroad_services" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "short_desc" TEXT,
    "service_type" VARCHAR(50) NOT NULL,
    "price" DECIMAL(10,2),
    "duration" VARCHAR(50),
    "features" JSONB,
    "countries" JSONB,
    "requirements" JSONB,
    "process" JSONB,
    "benefits" JSONB,
    "image_url" TEXT,
    "icon_name" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_popular" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_abroad_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_abroad_inquiries" (
    "id" SERIAL NOT NULL,
    "service_id" INTEGER NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "course" VARCHAR(200),
    "university" VARCHAR(200),
    "budget" VARCHAR(50),
    "timeline" VARCHAR(50),
    "message" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'new',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "assigned_to" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "study_abroad_inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "study_abroad_services_slug_key" ON "study_abroad_services"("slug");

-- AddForeignKey
ALTER TABLE "study_abroad_inquiries" ADD CONSTRAINT "study_abroad_inquiries_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "study_abroad_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_abroad_inquiries" ADD CONSTRAINT "study_abroad_inquiries_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
