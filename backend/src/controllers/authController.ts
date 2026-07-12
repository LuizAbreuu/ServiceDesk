import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { prisma } from "../prisma";
import { ConflictError, UnauthorizedError } from "../utils/errors";
import { strongPasswordSchema } from "../utils/password";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Informe a senha"),
});

const registerSchema = z.object({
  name: z.string().min(3, "Informe seu nome completo"),
  email: z.string().email("Informe um e-mail valido"),
  password: strongPasswordSchema,
});

function buildAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: "12h" },
  );
}

export const authController = {
  async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        avatarUrl: true,
        teamId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Usuário inativo");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const token = buildAccessToken(user);

    return res.json({
      tokens: {
        accessToken: token,
        refreshToken: token,
      }, // Preserva o contrato atual do frontend; refresh real pode vir na proxima fase.
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        teamId: user.teamId
      },
    });
  },

  async me(req: Request, res: Response) {
    const u = req.user!;
    return res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatarUrl,
      teamId: u.teamId,
    });
  },

  async register(req: Request, res: Response) {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError("Ja existe um cadastro com esse e-mail");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "User",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        teamId: true,
      },
    });

    const token = buildAccessToken(user);

    return res.status(201).json({
      tokens: {
        accessToken: token,
        refreshToken: token,
      },
      user,
    });
  },

  async logout(_req: Request, res: Response) {
    return res.status(204).send();
  },
};
