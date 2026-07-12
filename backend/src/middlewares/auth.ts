import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { env } from "../config/env";
import type { JwtPayload } from "../types/auth";
import { parseRole } from "../security/roles";
import { UnauthorizedError } from "../utils/errors";

function extractBearerToken(authHeader?: string): string {
  if (!authHeader) {
    throw new UnauthorizedError("Token is missing");
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new UnauthorizedError("Invalid authorization header");
  }

  return token;
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        teamId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("User is inactive");
    }

    req.user = {
      ...user,
      role: parseRole(user.role),
    };
    return next();
  } catch (error) {
    return next(
      error instanceof UnauthorizedError
        ? error
        : new UnauthorizedError("Invalid token"),
    );
  }
}
