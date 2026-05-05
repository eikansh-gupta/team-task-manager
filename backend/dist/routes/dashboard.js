"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get("/summary", async (req, res) => {
    const userId = req.user.id;
    const now = new Date();
    const memberProjectIds = await prisma_1.prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
    });
    const projectIds = memberProjectIds.map((p) => p.projectId);
    const taskWhere = { projectId: { in: projectIds } };
    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, assignedToMe] = await Promise.all([
        prisma_1.prisma.task.count({ where: taskWhere }),
        prisma_1.prisma.task.count({ where: { ...taskWhere, status: "TODO" } }),
        prisma_1.prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
        prisma_1.prisma.task.count({ where: { ...taskWhere, status: "DONE" } }),
        prisma_1.prisma.task.count({
            where: { ...taskWhere, dueDate: { lt: now }, status: { not: "DONE" } },
        }),
        prisma_1.prisma.task.count({ where: { ...taskWhere, assigneeId: userId } }),
    ]);
    return res.json({
        totalProjects: projectIds.length,
        totalTasks,
        byStatus: {
            TODO: todoTasks,
            IN_PROGRESS: inProgressTasks,
            DONE: doneTasks,
        },
        overdueTasks,
        assignedToMe,
    });
});
exports.default = router;
