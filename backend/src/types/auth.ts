export type Role = "Admin" | "Manager" | "Agent" | "User";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  teamId: string | null;
  isActive: boolean;
}

export interface JwtPayload {
  sub: string;
  role: Role;
  email: string;
}
