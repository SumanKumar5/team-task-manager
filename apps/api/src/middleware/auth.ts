import { createMiddleware } from "hono/factory";
import { verifyToken } from "../lib/jwt.ts";
import { prisma } from "../lib/prisma.ts";

export type AuthVariables = {
  userId: string;
  email: string;
  role: string;
};

export const authMiddleware = createMiddleware<{ Variables: AuthVariables }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const payload = verifyToken(token);

      const session = await prisma.session.findUnique({
        where: { token },
      });

      if (!session || session.expiresAt < new Date()) {
        return c.json({ error: "Session expired" }, 401);
      }

      c.set("userId", payload.userId);
      c.set("email", payload.email);
      c.set("role", payload.role);

      await next();
    } catch {
      return c.json({ error: "Invalid token" }, 401);
    }
  },
);
