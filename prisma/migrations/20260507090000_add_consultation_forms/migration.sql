-- CreateTable
CREATE TABLE IF NOT EXISTS "consultation_forms" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "consultation_submissions" (
    "id" SERIAL NOT NULL,
    "form_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "ielts_status" VARCHAR(50) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" VARCHAR(20) NOT NULL,
    "education_level" VARCHAR(50) NOT NULL,
    "location" VARCHAR(50) NOT NULL,
    "preferred_date" TIMESTAMP(3) NOT NULL,
    "preferred_time" VARCHAR(50) NOT NULL,
    "guardian_first_name" VARCHAR(100) NOT NULL,
    "guardian_last_name" VARCHAR(100) NOT NULL,
    "guardian_phone" VARCHAR(20) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultation_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "consultation_submissions" ADD CONSTRAINT "consultation_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "consultation_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultation_submissions" ADD CONSTRAINT "consultation_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;