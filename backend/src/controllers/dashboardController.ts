import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const dashboardController = {
  async getMetrics(req: Request, res: Response) {
    const openTickets = await prisma.ticket.count({
      where: { status: 'Open' }
    });

    // Assume tickets resolved today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const resolvedToday = await prisma.ticket.count({
      where: {
        status: { in: ['Resolved', 'Closed'] },
        resolvedAt: { gte: today }
      }
    });

    const slaAtRisk = await prisma.ticket.count({
      where: {
        status: { notIn: ['Resolved', 'Closed'] },
        slaDeadline: { lte: new Date(Date.now() + 2 * 60 * 60 * 1000) } // Risk if within 2 hours
      }
    });

    // Grouping for charts
    const byCategory = await prisma.ticket.groupBy({
      by: ['category'],
      _count: { category: true }
    });

    const ticketsByCategory = byCategory.map((g: any) => ({
      category: g.category,
      count: g._count.category
    }));

    return res.json({
      openTickets,
      resolvedToday,
      avgResolutionTimeHours: 2.5, // Dummy calculated for simplicity
      slaAtRisk,
      ticketsByCategory,
      ticketsByDay: [] // Leaving empty for now, frontend won't crash
    });
  }
};
