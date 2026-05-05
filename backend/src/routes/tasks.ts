import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  projectId: z.string().min(1),
  assigneeId: z.string().optional(),
  dueDate: z.iso.datetime().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assigneeId: z.string().nullable().optional(),
  dueDate: z.iso.datetime().nullable().optional(),
});

router.get("/", async (req, res) => {
  const projectId = req.query.projectId as string | undefined;
  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      project: { members: { some: { userId: req.user!.id } } },
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return res.json(tasks);
});

router.post("/", async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
  }

  const projectMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: parsed.data.projectId, userId: req.user!.id } },
  });
  if (!projectMember) {
    return res.status(403).json({ message: "Not a member of this project" });
  }

  if (parsed.data.assigneeId) {
    const assigneeInProject = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId: parsed.data.projectId, userId: parsed.data.assigneeId },
      },
    });
    if (!assigneeInProject) {
      return res.status(400).json({ message: "Assignee must be part of the same project" });
    }
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      projectId: parsed.data.projectId,
      assigneeId: parsed.data.assigneeId,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      createdById: req.user!.id,
    },
  });
  return res.status(201).json(task);
});

router.patch("/:taskId", async (req, res) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: req.params.taskId },
    select: { id: true, projectId: true },
  });
  if (!existingTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  const projectMember = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: existingTask.projectId, userId: req.user!.id } },
  });
  if (!projectMember) {
    return res.status(403).json({ message: "Not allowed to update this task" });
  }

  if (parsed.data.assigneeId) {
    const assigneeInProject = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: existingTask.projectId, userId: parsed.data.assigneeId } },
    });
    if (!assigneeInProject) {
      return res.status(400).json({ message: "Assignee must be part of the same project" });
    }
  }

  const updated = await prisma.task.update({
    where: { id: req.params.taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      assigneeId: parsed.data.assigneeId === null ? null : parsed.data.assigneeId,
      dueDate:
        parsed.data.dueDate === null
          ? null
          : parsed.data.dueDate
            ? new Date(parsed.data.dueDate)
            : undefined,
    },
  });
  return res.json(updated);
});

export default router;
