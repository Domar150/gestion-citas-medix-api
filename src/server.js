import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());            // Permite front local y Render
app.use(express.json());    // JSON body



/* ----------------------- Utils ----------------------- */
function httpError(res, status, msg) {
  return res.status(status).json({ error: msg });
}

async function ensureDefaultCategory() {
  try {
    const cat = await prisma.category.upsert({
      where: { name: "General" },
      update: {},
      create: { name: "General" },
    });
    return cat.id;
  } catch (e) {
    console.warn('No se pudo asegurar Category "General":', e.message);
    return null;
  }
}

/* ----------------------- Health ----------------------- */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ======================================================
   M I S I Ó N   3 :   U S E R S / T A S K S
====================================================== */

// USERS
app.get("/api/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    res.json(users);
  } catch (e) {
    console.error("GET /api/users", e);
    httpError(res, 500, "No se pudieron listar usuarios");
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return httpError(res, 400, "name y email son requeridos");

    const u = await prisma.user.create({ data: { name, email } });
    res.status(201).json(u);
  } catch (e) {
    console.error("POST /api/users", e);
    httpError(res, 500, "No se pudo crear usuario (¿email duplicado?)");
  }
});

// TASKS por usuario
app.get("/api/users/:id/tasks", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return httpError(res, 400, "userId inválido");

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { id: "desc" },
    });
    res.json(tasks);
  } catch (e) {
    console.error("GET /api/users/:id/tasks", e);
    httpError(res, 500, "No se pudieron listar tareas");
  }
});

app.post("/api/users/:id/tasks", async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (Number.isNaN(userId)) return httpError(res, 400, "userId inválido");

    const { title, description } = req.body || {};
    if (!title) return httpError(res, 400, "title es requerido");

    const defaultCategoryId = await ensureDefaultCategory();

    const t = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        completed: false,
        userId,
        ...(defaultCategoryId ? { categoryId: defaultCategoryId } : {}),
      },
    });
    res.status(201).json(t);
  } catch (e) {
    console.error("POST /api/users/:id/tasks", e);
    httpError(res, 500, "No se pudo crear la tarea");
  }
});

// TASK individual
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return httpError(res, 400, "id inválido");

    const data = {};
    if ("title" in req.body) data.title = req.body.title;
    if ("description" in req.body) data.description = req.body.description;
    if ("completed" in req.body) data.completed = !!req.body.completed;
    if ("categoryId" in req.body) data.categoryId = req.body.categoryId;

    const t = await prisma.task.update({ where: { id }, data });
    res.json(t);
  } catch (e) {
    console.error("PUT /api/tasks/:id", e);
    httpError(res, 500, "No se pudo actualizar la tarea");
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return httpError(res, 400, "id inválido");

    await prisma.task.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    console.error("DELETE /api/tasks/:id", e);
    httpError(res, 500, "No se pudo eliminar la tarea");
  }
});

/* ======================================================
   P R O Y E C T O   2 ( M E D I X ) :  READ-ONLY
====================================================== */

app.get("/api/medix/patients", async (_req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT p.id,
             p.nombre_completo,
             p.email,
             p.fecha_nacimiento,
             COALESCE(e.nombre,'') AS eps_nombre
      FROM public.patient p
      LEFT JOIN public.eps e ON e.id = p.eps_id
      ORDER BY p.id ASC
    `);
    res.json(rows);
  } catch (e) {
    console.error("GET /api/medix/patients", e);
    httpError(res, 500, "No se pudieron cargar pacientes");
  }
});

app.get("/api/medix/doctors", async (_req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT d.id,
             d.nombre_completo,
             d.email,
             COALESCE(s.nombre,'') AS especialidad
      FROM public.doctor d
      LEFT JOIN public.specialty s ON s.id = d.specialty_id
      ORDER BY d.id ASC
    `);
    res.json(rows);
  } catch (e) {
    console.error("GET /api/medix/doctors", e);
    httpError(res, 500, "No se pudieron cargar doctores");
  }
});

app.get("/api/medix/appointments", async (_req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT a.id,
             a.scheduled_at,
             a.motivo,
             a.status_code AS estado,
             p.nombre_completo AS paciente,
             d.nombre_completo AS doctor
      FROM public.appointment a
      JOIN public.patient p ON p.id = a.patient_id
      JOIN public.doctor  d ON d.id = a.doctor_id
      ORDER BY a.scheduled_at DESC
    `);
    res.json(rows);
  } catch (e) {
    console.error("GET /api/medix/appointments", e);
    httpError(res, 500, "No se pudieron cargar citas");
  }
});

app.get('/', (req, res) => {
  res.type('text/plain').send(
    'API Medix activa.\n' +
    'Usa /api/health para ver el estado o /api/users, /api/tasks, /api/medix/* para endpoints.'
  );
});


/* ----------------------- Start ----------------------- */
app.listen(PORT, () => {
  console.log(`✅ API lista en :${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
