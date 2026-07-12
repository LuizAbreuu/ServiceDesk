import type { Article, Role, Ticket, User } from '../types';

export function isStaff(role?: Role | null): boolean {
  return role === 'Admin' || role === 'Manager' || role === 'Agent';
}

export function canAccessDashboard(user?: User | null): boolean {
  return isStaff(user?.role);
}

export function canAccessUsersPage(user?: User | null): boolean {
  return isStaff(user?.role);
}

export function canAccessKnowledgePage(user?: User | null): boolean {
  return isStaff(user?.role);
}

export function canCreateUser(user?: User | null): boolean {
  return user?.role === 'Admin' || user?.role === 'Manager';
}

export function canDeleteUser(user?: User | null): boolean {
  return user?.role === 'Admin';
}

export function canManageTargetUser(actor: User | null | undefined, target: User): boolean {
  if (!actor) return false;
  if (actor.role === 'Admin') return actor.id !== target.id;
  if (actor.role === 'Manager') return target.role !== 'Admin';
  return false;
}

export function getAssignableRoles(actor?: User | null): Role[] {
  if (actor?.role === 'Admin') {
    return ['User', 'Agent', 'Manager', 'Admin'];
  }

  if (actor?.role === 'Manager') {
    return ['User', 'Agent', 'Manager'];
  }

  return [];
}

export function canEditTicket(user?: User | null): boolean {
  return isStaff(user?.role);
}

export function canDeleteTicket(user?: User | null): boolean {
  return user?.role === 'Admin';
}

export function canUseInternalComments(user?: User | null): boolean {
  return isStaff(user?.role);
}

export function canCreateArticle(user?: User | null): boolean {
  return isStaff(user?.role);
}

export function canEditArticle(user?: User | null, _article?: Article): boolean {
  return isStaff(user?.role);
}

export function canDeleteArticle(user?: User | null): boolean {
  return user?.role === 'Admin' || user?.role === 'Manager';
}

export function canResolveOrAssignTicket(user?: User | null, _ticket?: Ticket): boolean {
  return isStaff(user?.role);
}
