import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (req, res) => {
  const userId = req.user!.id;
  const now = new Date();

  const memberProjectIds = await prisma.projectMember.findMany({
    where: { userId },
    select: { projectId: true },
  });

  const projectIds = memberProjectIds.map((p) => p.projectId);
  const taskWhere = { projectId: { in: projectIds } };

  const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, assignedToMe] =
    await Promise.all([
      prisma.task.count({ where: taskWhere }),
      prisma.task.count({ where: { ...taskWhere, status: "TODO" } }),
      prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
      prisma.task.count({ where: { ...taskWhere, status: "DONE" } }),
      prisma.task.count({
        where: { ...taskWhere, dueDate: { lt: now }, status: { not: "DONE" } },
      }),
      prisma.task.count({ where: { ...taskWhere, assigneeId: userId } }),
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

export default router;
