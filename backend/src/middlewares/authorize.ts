import { NextFunction, Request, Response } from "express";
import type { Role } from "../types/auth";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import { hasRole } from "../security/roles";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new UnauthorizedError("Authentication required"));
  }

  return next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Authentication required"));
    }

    if (!hasRole(req.user.role, allowedRoles)) {
      return next(new ForbiddenError("Insufficient permissions"));
    }

    return next();
  };
}
