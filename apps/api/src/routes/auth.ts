import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.ts";
import { signToken } from "../lib/jwt.ts";
import { signupSchema, loginSchema } from "@repo/shared";

const auth = new Hono();

auth.post("/signup", zValidator("json", signupSchema), async (c) => {
  const { name, email, password, role } = c.req.valid("json");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return c.json({ user, token }, 201);
});

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _, ...safeUser } = user;

  return c.json({ user: safeUser, token });
});

auth.post("/logout", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await prisma.session.deleteMany({ where: { token } });
  }
  return c.json({ success: true });
});

export default auth;
