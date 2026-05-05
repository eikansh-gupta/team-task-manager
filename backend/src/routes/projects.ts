import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const addMemberSchema = z.object({
  email: z.email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

router.use(requireAuth);

router.get("/", async (req, res) => {
  const projects = await prisma.projectMember.findMany({
    where: { userId: req.user!.id },
    include: {
      project: {
        include: {
          _count: { select: { tasks: true, members: true } },
        },
      },
    },
  });
  return res.json(projects.map((p) => ({ ...p.project, membershipRole: p.role })));
});

router.post("/", async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      createdById: req.user!.id,
      members: {
        create: { userId: req.user!.id, role: "ADMIN" },
      },
    },
  });
  return res.status(201).json(project);
});

router.post("/:projectId/members", async (req, res) => {
  const parsed = addMemberSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
  }

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: req.params.projectId, userId: req.user!.id } },
  });
  if (!membership || membership.role !== "ADMIN") {
    return res.status(403).json({ message: "Only project admins can add members" });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const created = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: req.params.projectId, userId: user.id } },
    update: { role: parsed.data.role },
    create: {
      projectId: req.params.projectId,
      userId: user.id,
      role: parsed.data.role,
    },
  });
  return res.status(201).json(created);
});

export default router;
