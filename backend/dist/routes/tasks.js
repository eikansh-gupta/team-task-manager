"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    projectId: zod_1.z.string().min(1),
    assigneeId: zod_1.z.string().optional(),
    dueDate: zod_1.z.iso.datetime().optional(),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(2).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    assigneeId: zod_1.z.string().nullable().optional(),
    dueDate: zod_1.z.iso.datetime().nullable().optional(),
});
router.get("/", async (req, res) => {
    const projectId = req.query.projectId;
    const tasks = await prisma_1.prisma.task.findMany({
        where: {
            projectId,
            project: { members: { some: { userId: req.user.id } } },
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
    const projectMember = await prisma_1.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: parsed.data.projectId, userId: req.user.id } },
    });
    if (!projectMember) {
        return res.status(403).json({ message: "Not a member of this project" });
    }
    if (parsed.data.assigneeId) {
        const assigneeInProject = await prisma_1.prisma.projectMember.findUnique({
            where: {
                projectId_userId: { projectId: parsed.data.projectId, userId: parsed.data.assigneeId },
            },
        });
        if (!assigneeInProject) {
            return res.status(400).json({ message: "Assignee must be part of the same project" });
        }
    }
    const task = await prisma_1.prisma.task.create({
        data: {
            title: parsed.data.title,
            description: parsed.data.description,
            projectId: parsed.data.projectId,
            assigneeId: parsed.data.assigneeId,
            dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
            createdById: req.user.id,
        },
    });
    return res.status(201).json(task);
});
router.patch("/:taskId", async (req, res) => {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request", errors: parsed.error.flatten() });
    }
    const existingTask = await prisma_1.prisma.task.findUnique({
        where: { id: req.params.taskId },
        select: { id: true, projectId: true },
    });
    if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
    }
    const projectMember = await prisma_1.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: existingTask.projectId, userId: req.user.id } },
    });
    if (!projectMember) {
        return res.status(403).json({ message: "Not allowed to update this task" });
    }
    if (parsed.data.assigneeId) {
        const assigneeInProject = await prisma_1.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId: existingTask.projectId, userId: parsed.data.assigneeId } },
        });
        if (!assigneeInProject) {
            return res.status(400).json({ message: "Assignee must be part of the same project" });
        }
    }
    const updated = await prisma_1.prisma.task.update({
        where: { id: req.params.taskId },
        data: {
            title: parsed.data.title,
            description: parsed.data.description,
            status: parsed.data.status,
            assigneeId: parsed.data.assigneeId === null ? null : parsed.data.assigneeId,
            dueDate: parsed.data.dueDate === null
                ? null
                : parsed.data.dueDate
                    ? new Date(parsed.data.dueDate)
                    : undefined,
        },
    });
    return res.json(updated);
});
exports.default = router;
