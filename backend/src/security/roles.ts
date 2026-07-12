import type { Role } from "../types/auth";
import { ForbiddenError } from "../utils/errors";

export const STAFF_ROLES: Role[] = ["Admin", "Manager", "Agent"];
export const ADMIN_ROLES: Role[] = ["Admin", "Manager"];
const KNOWN_ROLES: Role[] = ["Admin", "Manager", "Agent", "User"];

export function hasRole(role: Role, allowedRoles: readonly Role[]): boolean {
  return allowedRoles.includes(role);
}

export function isStaff(role: Role): boolean {
  return hasRole(role, STAFF_ROLES);
}

export function parseRole(role: string): Role {
  if (KNOWN_ROLES.includes(role as Role)) {
    return role as Role;
  }

  throw new ForbiddenError("Invalid role configuration");
}
