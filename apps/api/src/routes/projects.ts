import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../lib/prisma.js";          
import { authMiddleware, type AuthVariables } from "../middleware/auth.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from "@repo/shared";

const projects = new Hono<{ Variables: AuthVariables }>();

projects.use("*", authMiddleware);

projects.get("/", async (c) => {
  const userId = c.get("userId");

  const userProjects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: { select: { status: true } },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(userProjects);
});

projects.post("/", zValidator("json", createProjectSchema), async (c) => {
  const userId = c.get("userId");
  const data = c.req.valid("json");

  const project = await prisma.project.create({
    data: {
      ...data,
      ownerId: userId,
      members: {
        create: { userId, role: "ADMIN" },
      },
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { tasks: true } },
    },
  });

  return c.json(project, 201);
});

projects.get("/:id", async (c) => {
  const userId = c.get("userId");
  const projectId = c.req.param("id");

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) return c.json({ error: "Project not found" }, 404);

  return c.json(project);
});

projects.put("/:id", zValidator("json", updateProjectSchema), async (c) => {
  const userId = c.get("userId");
  const projectId = c.req.param("id");
  const data = c.req.valid("json");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!member || member.role !== "ADMIN") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { tasks: true } },
    },
  });

  return c.json(project);
});

projects.delete("/:id", async (c) => {
  const userId = c.get("userId");
  const projectId = c.req.param("id");

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) return c.json({ error: "Project not found" }, 404);
  if (project.ownerId !== userId) return c.json({ error: "Forbidden" }, 403);

  await prisma.project.delete({ where: { id: projectId } });

  return c.json({ success: true });
});

projects.post(
  "/:id/members",
  zValidator("json", addMemberSchema),
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("id");
    const { email, role } = c.req.valid("json");

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member || member.role !== "ADMIN") {
      return c.json({ error: "Forbidden" }, 403);
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return c.json({ error: "User not found" }, 404);

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: userToAdd.id } },
    });

    if (existing) return c.json({ error: "User already a member" }, 409);

    const newMember = await prisma.projectMember.create({
      data: { projectId, userId: userToAdd.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return c.json(newMember, 201);
  },
);

projects.delete("/:id/members/:memberId", async (c) => {
  const userId = c.get("userId");
  const projectId = c.req.param("id");
  const memberId = c.req.param("memberId");

  const member = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!member || member.role !== "ADMIN") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId: memberId } },
  });

  return c.json({ success: true });
});

export default projects;
