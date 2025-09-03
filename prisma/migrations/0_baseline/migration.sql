-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointments" (
    "id" SERIAL NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "scheduled_at" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status_code" TEXT NOT NULL,
    "update_at" TEXT NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."doctors" (
    "id" SERIAL NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "Registro_medico" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "specialty_id" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "doctors_email_key" ON "public"."doctors"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

