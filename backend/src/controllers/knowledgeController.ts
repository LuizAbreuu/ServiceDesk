import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const knowledgeController = {
  async getAll(req: Request, res: Response) {
    const { category, search, status } = req.query;

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { content: { contains: String(search) } }
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    });

    // Frontend expects articles to have tags as array
    const formatted = articles.map((a: any) => ({
      ...a,
      tags: a.tags ? a.tags.split(',').map((t: string) => t.trim()) : []
    }));

    return res.json(formatted);
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const article = await prisma.article.findUnique({
      where: { id },
      include: { author: true }
    });

    if (!article) return res.status(404).json({ error: 'Article not found' });

    await prisma.article.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    return res.json({
      ...article,
      tags: article.tags ? article.tags.split(',').map((t: string) => t.trim()) : []
    });
  },

  async create(req: any, res: Response) {
    const { title, excerpt, content, status, category, tags = [] } = req.body;

    const article = await prisma.article.create({
      data: {
        title,
        excerpt,
        content,
        status: status || 'Draft',
        category,
        tags: tags.join(','),
        authorId: req.user.id
      },
      include: { author: true }
    });

    return res.status(201).json({
      ...article,
      tags: article.tags ? article.tags.split(',').map((t: string) => t.trim()) : []
    });
  },

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const { title, excerpt, content, status, category, tags } = req.body;

    const data: any = {};
    if (title) data.title = title;
    if (excerpt) data.excerpt = excerpt;
    if (content) data.content = content;
    if (status) data.status = status;
    if (category) data.category = category;
    if (tags) data.tags = tags.join(',');

    const article = await prisma.article.update({
      where: { id },
      data,
      include: { author: true }
    });

    return res.json({
      ...article,
      tags: article.tags ? article.tags.split(',').map((t: string) => t.trim()) : []
    });
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    await prisma.article.delete({ where: { id } });
    return res.status(204).send();
  },

  async vote(req: Request, res: Response) {
    const id = req.params.id as string;
    const { helpful } = req.body; // simple voting implementation for now
    
    // In a real scenario we'd track who voted to prevent duplicate votes
    // Here we're just estimating a percentage tweak for demonstration
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).send();

    let newPercent = article.helpfulPercent;
    if (helpful) {
      newPercent = Math.min(100, article.helpfulPercent + 5);
    } else {
      newPercent = Math.max(0, article.helpfulPercent - 5);
    }

    await prisma.article.update({
      where: { id },
      data: { helpfulPercent: newPercent }
    });

    return res.json({ message: 'Voted successfully' });
  }
};
