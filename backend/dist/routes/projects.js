"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
});
const addMemberSchema = zod_1.z.object({
    email: zod_1.z.email(),
    role: zod_1.z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});
router.use(auth_1.requireAuth);
router.get("/", async (req, res) => {
    const projects = await prisma_1.prisma.projectMember.findMany({
        where: { userId: req.user.id },
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
    const project = await prisma_1.prisma.project.create({
        data: {
            name: parsed.data.name,
            description: parsed.data.description,
            createdById: req.user.id,
            members: {
                create: { userId: req.user.id, role: "ADMIN" },
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
    const membership = await prisma_1.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: req.params.projectId, userId: req.user.id } },
    });
    if (!membership || membership.role !== "ADMIN") {
        return res.status(403).json({ message: "Only project admins can add members" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const created = await prisma_1.prisma.projectMember.upsert({
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
exports.default = router;
