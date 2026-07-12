import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../prisma";
import type { Role } from "../types/auth";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/errors";
import { strongPasswordSchema } from "../utils/password";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: strongPasswordSchema,
  role: z.enum(['Admin', 'Agent', 'Manager', 'User']).default('User'),
  teamId: z.preprocess((val) => val === '' ? undefined : val, z.string().uuid().optional()),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['Admin', 'Agent', 'Manager', 'User']).optional(),
  teamId: z.preprocess((val) => val === '' ? undefined : val, z.string().uuid().optional().nullable()),
  password: strongPasswordSchema.optional(),
});

const listUsersQuerySchema = z.object({
  role: z.enum(["Admin", "Agent", "Manager", "User"]).optional(),
});

const createTeamSchema = z.object({
  name: z.string().min(2),
  memberIds: z.array(z.string().uuid()).default([]),
});

function canManageTargetRole(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === "Admin") {
    return true;
  }

  if (actorRole === "Manager") {
    return targetRole !== "Admin";
  }

  return false;
}

export const userController = {
  async getAll(req: Request, res: Response) {
    const { role } = listUsersQuerySchema.parse(req.query);
    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      take: 500,
      include: { team: true },
    });
    return res.json(users);
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { team: true },
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return res.json(user);
  },

  async create(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body);
    const actor = req.user!;

    if (!canManageTargetRole(actor.role, data.role)) {
      throw new ForbiddenError("You cannot create a user with this role");
    }
    
    const existing = await prisma.user.findUnique({ where: { email: data.email }});
    if (existing) {
      throw new ConflictError("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return res.status(201).json(user);
  },

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const body = updateUserSchema.parse(req.body);
    const actor = req.user!;
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (!canManageTargetRole(actor.role, existingUser.role as Role)) {
      throw new ForbiddenError("You cannot update this user");
    }

    if (body.role && !canManageTargetRole(actor.role, body.role)) {
      throw new ForbiddenError("You cannot assign this role");
    }
    
    const dataToUpdate: any = { ...body };
    if (body.password) {
      dataToUpdate.password = await bcrypt.hash(body.password, 10);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json(user);
  },

  async deactivate(req: Request, res: Response) {
    const id = req.params.id as string;
    const actor = req.user!;
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (actor.id === id) {
      throw new ForbiddenError("You cannot deactivate your own account");
    }

    if (!canManageTargetRole(actor.role, existingUser.role as Role)) {
      throw new ForbiddenError("You cannot deactivate this user");
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
    return res.status(204).send();
  },

  async reactivate(req: Request, res: Response) {
    const id = req.params.id as string;
    const actor = req.user!;
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (!canManageTargetRole(actor.role, existingUser.role as Role)) {
      throw new ForbiddenError("You cannot reactivate this user");
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });
    return res.status(204).send();
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const actor = req.user!;
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (actor.id === id) {
      throw new ForbiddenError("You cannot delete your own account");
    }

    if (!canManageTargetRole(actor.role, existingUser.role as Role)) {
      throw new ForbiddenError("You cannot delete this user");
    }

    try {
      await prisma.user.delete({ where: { id } });
      return res.status(204).send();
    } catch (err: any) {
      if (err.code === 'P2003') { // Foreign key constraint
        throw new ConflictError("Cannot delete user because they have associated records. Please deactivate instead.");
      }
      throw err;
    }
  },

  async getTeams(req: Request, res: Response) {
    const teams = await prisma.team.findMany({
      take: 500,
      include: { members: true },
    });
    return res.json(teams);
  },

  async createTeam(req: Request, res: Response) {
    const { name, memberIds } = createTeamSchema.parse(req.body);
    
    const team = await prisma.team.create({
      data: {
        name,
        members: {
          connect: memberIds.map(id => ({ id }))
        }
      },
      include: { members: true } // Need to return the populated members as per interface Team
    });

    // Add extra property 'openTickets' to match frontend interface team shape
    return res.status(201).json({ ...team, openTickets: 0 });
  }
};
