import { Request, Response } from "express";
import { z } from "zod";
import { io } from "../index.js";
import { prisma } from "../prisma";
import { isStaff, STAFF_ROLES } from "../security/roles";
import type { AuthenticatedUser } from "../types/auth";
import { ForbiddenError, NotFoundError } from "../utils/errors";

const createTicketSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  category: z.string().min(2),
});

const addCommentSchema = z.object({
  content: z.string().min(1),
  isInternal: z.boolean().optional(),
});

const assignTicketSchema = z.object({
  agentId: z.string().uuid(),
});

const updateStatusSchema = z.object({
  status: z.enum(["Open", "InProgress", "Resolved", "Closed"]),
});

const updateTicketSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).optional(),
  category: z.string().min(2).optional(),
  status: z.enum(["Open", "InProgress", "Resolved", "Closed"]).optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  slaDeadline: z.string().datetime().optional(),
});

function canAccessTicket(user: AuthenticatedUser, ticket: { createdById: string; assignedToId: string | null }) {
  return isStaff(user.role) || ticket.createdById === user.id || ticket.assignedToId === user.id;
}

export const ticketController = {
  async getAll(req: Request, res: Response) {
    const user = req.user!;
    const { status, priority, assignedTo, page = 1, pageSize = 10, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    if (!isStaff(user.role)) {
      where.createdById = user.id;
    }
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
        include: { createdBy: { include: { team: true } }, assignedTo: { include: { team: true } } }
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
    const actor = req.user!;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: { include: { team: true } },
        assignedTo: { include: { team: true } },
        comments: {
          where: isStaff(actor.role) ? undefined : { isInternal: false },
          include: { author: true },
          orderBy: { createdAt: "asc" },
        },
        attachments: true
      }
    });

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (!canAccessTicket(actor, ticket)) {
      throw new ForbiddenError("You do not have access to this ticket");
    }

    return res.json(ticket);
  },

  async create(req: Request, res: Response) {
    const { title, description, priority, category } = createTicketSchema.parse(req.body);
    
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
        createdById: req.user!.id
      },
      include: { createdBy: true }
    });

    await prisma.ticketHistory.create({
      data: {
        action: 'Created',
        description: 'Ticket created',
        ticketId: ticket.id,
        performedById: req.user!.id
      }
    });

    // Notify connected clients
    io.emit('NewTicket', ticket);

    return res.status(201).json(ticket);
  },

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const actor = req.user!;
    const payload = updateTicketSchema.parse(req.body);
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
      include: { assignedTo: true },
    });

    if (!existingTicket) {
      throw new NotFoundError("Ticket not found");
    }

    if (!isStaff(actor.role)) {
      throw new ForbiddenError("Only staff can edit tickets");
    }

    const data: Record<string, unknown> = {};
    if (payload.title !== undefined) data.title = payload.title;
    if (payload.description !== undefined) data.description = payload.description;
    if (payload.priority !== undefined) data.priority = payload.priority;
    if (payload.category !== undefined) data.category = payload.category;
    if (payload.status !== undefined) {
      data.status = payload.status;
      data.resolvedAt =
        payload.status === "Resolved" || payload.status === "Closed" ? new Date() : null;
    }
    if (payload.slaDeadline !== undefined) {
      data.slaDeadline = new Date(payload.slaDeadline);
    }

    if (payload.assignedToId !== undefined) {
      if (payload.assignedToId === null) {
        data.assignedToId = null;
      } else {
        const assignee = await prisma.user.findUnique({
          where: { id: payload.assignedToId },
          select: { id: true, role: true, isActive: true, name: true },
        });

        if (!assignee || !assignee.isActive || !STAFF_ROLES.includes(assignee.role as any)) {
          throw new ForbiddenError("Assigned user must be an active staff member");
        }

        data.assignedToId = payload.assignedToId;
      }
    }

    const ticket = await prisma.ticket.update({
      where: { id },
      data,
      include: {
        createdBy: { include: { team: true } },
        assignedTo: { include: { team: true } },
        comments: { include: { author: true }, orderBy: { createdAt: "asc" } },
        attachments: true,
      },
    });

    await prisma.ticketHistory.create({
      data: {
        action: "Updated",
        description: "Ticket details updated",
        ticketId: id,
        performedById: actor.id,
      },
    });

    io.emit("TicketUpdated", { ticketId: id, updateType: "Updated", ticket });
    return res.json(ticket);
  },

  async addComment(req: Request, res: Response) {
    const id = req.params.id as string;
    const { content, isInternal } = addCommentSchema.parse(req.body);
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (!canAccessTicket(req.user!, ticket)) {
      throw new ForbiddenError("You do not have access to this ticket");
    }

    if (isInternal && !isStaff(req.user!.role)) {
      throw new ForbiddenError("Only staff can add internal comments");
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        isInternal: isInternal || false,
        ticketId: id,
        authorId: req.user!.id
      },
      include: { author: true }
    });

    // Notify connected clients
    io.emit('TicketUpdated', { ticketId: id, updateType: 'CommentAdded', comment });

    return res.status(201).json(comment);
  },

  async assign(req: Request, res: Response) {
    const id = req.params.id as string;
    const { agentId } = assignTicketSchema.parse(req.body);
    const ticketExists = await prisma.ticket.findUnique({ where: { id } });
    const agent = await prisma.user.findUnique({
      where: { id: agentId },
      select: { id: true, name: true, role: true, isActive: true },
    });

    if (!ticketExists) {
      throw new NotFoundError("Ticket not found");
    }

    if (!agent || !agent.isActive || !STAFF_ROLES.includes(agent.role as any)) {
      throw new ForbiddenError("Assigned user must be an active staff member");
    }

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
        performedById: req.user!.id
      }
    });

    io.emit('TicketUpdated', { ticketId: id, updateType: 'Assigned', ticket });

    return res.json(ticket);
  },

  async changeStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const { status } = updateStatusSchema.parse(req.body);
    const existingTicket = await prisma.ticket.findUnique({ where: { id } });

    if (!existingTicket) {
      throw new NotFoundError("Ticket not found");
    }

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
        performedById: req.user!.id
      }
    });

    io.emit('TicketUpdated', { ticketId: id, updateType: 'StatusChanged', ticket });

    return res.json(ticket);
  },
  
  async getHistory(req: Request, res: Response) {
    const id = req.params.id as string;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (!canAccessTicket(req.user!, ticket)) {
      throw new ForbiddenError("You do not have access to this ticket history");
    }

    const history = await prisma.ticketHistory.findMany({
      where: { ticketId: id },
      include: { performedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(history);
  },

  async escalate(req: Request, res: Response) {
    const id = req.params.id as string;
    
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }
    
    let newPriority = ticket.priority;
    if (ticket.priority === 'Low') newPriority = 'Medium';
    else if (ticket.priority === 'Medium') newPriority = 'High';
    else if (ticket.priority === 'High') newPriority = 'Critical';
    else if (ticket.priority === 'Critical') {
      throw new ForbiddenError("Ticket is already at maximum priority");
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { priority: newPriority }
    });

    await prisma.ticketHistory.create({
      data: {
        action: 'Escalated',
        description: `Priority escalated to ${newPriority}`,
        ticketId: id,
        performedById: req.user!.id
      }
    });

    io.emit('TicketUpdated', { ticketId: id, updateType: 'Escalated', ticket: updatedTicket });

    return res.json(updatedTicket);
  },

  async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }
    
    try {
      await prisma.ticket.delete({ where: { id } });
      io.emit('TicketDeleted', { ticketId: id });
      return res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2003') { // Foreign key constraint failed
        await prisma.comment.deleteMany({ where: { ticketId: id } });
        await prisma.attachment.deleteMany({ where: { ticketId: id } });
        await prisma.ticketHistory.deleteMany({ where: { ticketId: id } });
        await prisma.ticket.delete({ where: { id } });
        io.emit('TicketDeleted', { ticketId: id });
        return res.status(204).send();
      }
      throw error;
    }
  },

  async addAttachment(req: Request, res: Response) {
    const id = req.params.id as string;
    const file = req.file;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      select: { createdById: true, assignedToId: true },
    });

    if (!ticket) {
      throw new NotFoundError("Ticket not found");
    }

    if (!canAccessTicket(req.user!, ticket)) {
      throw new ForbiddenError("You do not have access to this ticket");
    }

    if (!file) {
      throw new ForbiddenError("Attachment file is required");
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const attachment = await prisma.attachment.create({
      data: {
        fileName: file.originalname,
        size: file.size,
        ticketId: id,
        url: `${baseUrl}/uploads/${file.filename}`,
      },
    });

    await prisma.ticketHistory.create({
      data: {
        action: "AttachmentAdded",
        description: `Attachment added: ${file.originalname}`,
        ticketId: id,
        performedById: req.user!.id,
      },
    });

    io.emit("TicketUpdated", { ticketId: id, updateType: "AttachmentAdded", attachment });
    return res.status(201).json(attachment);
  },
};
