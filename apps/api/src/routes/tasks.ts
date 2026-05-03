import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../lib/prisma.ts";
import { authMiddleware, type AuthVariables } from "../middleware/auth.ts";
import { createTaskSchema, updateTaskSchema } from "@repo/shared";

const tasks = new Hono<{ Variables: AuthVariables }>();

tasks.use("*", authMiddleware);

tasks.get("/projects/:projectId/tasks", async (c) => {
  const userId = c.get("userId");
  const projectId = c.req.param("projectId");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!member) return c.json({ error: "Forbidden" }, 403);

  const projectTasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(projectTasks);
});

tasks.post(
  "/projects/:projectId/tasks",
  zValidator("json", createTaskSchema),
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");
    const data = c.req.valid("json");

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) return c.json({ error: "Forbidden" }, 403);

    const task = await prisma.task.create({
      data: {
        ...data,
        assignedToId: data.assignedToId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        projectId,
        createdById: userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return c.json(task, 201);
  },
);

tasks.put("/tasks/:id", zValidator("json", updateTaskSchema), async (c) => {
  const userId = c.get("userId");
  const taskId = c.req.param("id");
  const data = c.req.valid("json");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return c.json({ error: "Task not found" }, 404);

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId } },
  });

  if (!member) return c.json({ error: "Forbidden" }, 403);

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });

  return c.json(updated);
});

tasks.delete("/tasks/:id", async (c) => {
  const userId = c.get("userId");
  const taskId = c.req.param("id");

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return c.json({ error: "Task not found" }, 404);

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId } },
  });

  if (!member || (member.role !== "ADMIN" && task.createdById !== userId)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  await prisma.task.delete({ where: { id: taskId } });

  return c.json({ success: true });
});

export default tasks;
