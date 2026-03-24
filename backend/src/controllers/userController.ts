import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['Admin', 'Agent', 'Manager', 'User']).default('User'),
  teamId: z.preprocess((val) => val === '' ? undefined : val, z.string().uuid().optional()),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['Admin', 'Agent', 'Manager', 'User']).optional(),
  teamId: z.preprocess((val) => val === '' ? undefined : val, z.string().uuid().optional().nullable()),
  password: z.string().min(6).optional(),
});

export const userController = {
  async getAll(req: Request, res: Response) {
    const users = await prisma.user.findMany({
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  },

  async create(req: Request, res: Response) {
    const data = createUserSchema.parse(req.body);
    
    const existing = await prisma.user.findUnique({ where: { email: data.email }});
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
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
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
    return res.status(204).send();
  },

  async reactivate(req: Request, res: Response) {
    const id = req.params.id as string;
    await prisma.user.update({
      where: { id },
      data: { isActive: true }
    });
    return res.status(204).send();
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    // Attempt to delete. In a real app we might catch foreign key errors.
    try {
      await prisma.user.delete({ where: { id } });
      return res.status(204).send();
    } catch (err: any) {
      if (err.code === 'P2003') { // Foreign key constraint
        return res.status(400).json({ error: 'Cannot delete user because they have associated records. Please deactivate instead.' });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getTeams(req: Request, res: Response) {
    const teams = await prisma.team.findMany({
      include: { members: true },
    });
    return res.json(teams);
  },

  async createTeam(req: Request, res: Response) {
    const { name, memberIds } = req.body;
    
    const team = await prisma.team.create({
      data: {
        name,
        members: {
          connect: (memberIds as string[])?.map(id => ({ id })) || []
        }
      },
      include: { members: true } // Need to return the populated members as per interface Team
    });

    // Add extra property 'openTickets' to match frontend interface team shape
    return res.status(201).json({ ...team, openTickets: 0 });
  }
};
