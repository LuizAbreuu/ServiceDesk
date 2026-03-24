import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { team: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    return res.json({
      tokens: {
        accessToken: token,
        refreshToken: token // simplify for now
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        teamId: user.teamId
      }
    });
  },

  async me(req: any, res: Response) {
    const u = req.user;
    return res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      teamId: u.teamId
    });
  },

  async logout(req: Request, res: Response) {
    // Client just discards the token
    return res.status(204).send();
  }
};
