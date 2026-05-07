import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { authMiddleware, type AuthVariables } from "../middleware/auth.js";

const dashboard = new Hono<{ Variables: AuthVariables }>();

dashboard.use("*", authMiddleware);

dashboard.get("/", async (c) => {
  const userId = c.get("userId");

  const [totalProjects, totalTasks, tasksByStatus, overdueTasks, recentTasks] =
    await Promise.all([
      prisma.project.count({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
        },
      }),
      prisma.task.count({
        where: {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
      }),
      prisma.task.groupBy({
        by: ["status"],
        where: {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
        _count: true,
      }),
      prisma.task.count({
        where: {
          dueDate: { lt: new Date() },
          status: { notIn: ["DONE"] },
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
      }),
      prisma.task.findMany({
        where: {
          project: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return c.json({
    totalProjects,
    totalTasks,
    tasksByStatus,
    overdueTasks,
    recentTasks,
  });
});

export default dashboard;
