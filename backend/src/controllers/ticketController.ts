import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { io } from '../index.js';

export const ticketController = {
  async getAll(req: Request, res: Response) {
    const { status, priority, assignedTo, page = 1, pageSize = 10, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { id: { contains: String(search) } }
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const [data, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { createdBy: true, assignedTo: true }
      }),
      prisma.ticket.count({ where })
    ]);

    return res.json({
      data,
      total,
      page: Number(page),
      pageSize: Number(pageSize)
    });
  },

  async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        comments: { include: { author: true }, orderBy: { createdAt: 'asc' } },
        attachments: true
      }
    });

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    return res.json(ticket);
  },

  async create(req: any, res: Response) {
    const { title, description, priority, category } = req.body;
    
    // Simulate an SLA deadline (e.g. 24 hours from now)
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + 24);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'Medium',
        category,
        slaDeadline,
        createdById: req.user.id
      },
      include: { createdBy: true }
    });

    await prisma.ticketHistory.create({
      data: {
        action: 'Created',
        description: 'Ticket created',
        ticketId: ticket.id,
        performedById: req.user.id
      }
    });

    // Notify connected clients
    import('../index.js').then(({ io }) => io.emit('NewTicket', ticket));

    return res.status(201).json(ticket);
  },

  async addComment(req: any, res: Response) {
    const id = req.params.id as string;
    const { content, isInternal } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        isInternal: isInternal || false,
        ticketId: id,
        authorId: req.user.id
      },
      include: { author: true }
    });

    // Notify connected clients
    import('../index.js').then(({ io }) => io.emit('TicketUpdated', { ticketId: id, updateType: 'CommentAdded', comment }));

    return res.status(201).json(comment);
  },

  async assign(req: any, res: Response) {
    const id = req.params.id as string;
    const { agentId } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { assignedToId: agentId },
      include: { assignedTo: true }
    });

    await prisma.ticketHistory.create({
      data: {
        action: 'Assigned',
        description: `Assigned to ${ticket.assignedTo?.name}`,
        ticketId: id,
        performedById: req.user.id
      }
    });

    import('../index.js').then(({ io }) => io.emit('TicketUpdated', { ticketId: id, updateType: 'Assigned', ticket }));

    return res.json(ticket);
  },

  async changeStatus(req: any, res: Response) {
    const id = req.params.id as string;
    const { status } = req.body;

    const updateData: any = { status };
    if (status === 'Resolved' || status === 'Closed') {
      updateData.resolvedAt = new Date();
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data: updateData
    });

    await prisma.ticketHistory.create({
      data: {
        action: 'StatusChanged',
        description: `Status changed to ${status}`,
        ticketId: id,
        performedById: req.user.id
      }
    });

    import('../index.js').then(({ io }) => io.emit('TicketUpdated', { ticketId: id, updateType: 'StatusChanged', ticket }));

    return res.json(ticket);
  },
  
  async getHistory(req: Request, res: Response) {
    const id = req.params.id as string;
    const history = await prisma.ticketHistory.findMany({
      where: { ticketId: id },
      include: { performedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(history);
  }
};
