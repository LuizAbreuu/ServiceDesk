export type Role = 'Admin' | 'Agent' | 'Manager' | 'User';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isActive?: boolean;
  teamId?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  slaDeadline: string;
  createdBy: User;
  assignedTo?: User;
  comments: Comment[];
  attachments: Attachment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: User;
  isInternal: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  url: string;
  size: number;
}

export interface DashboardMetrics {
  openTickets: number;
  resolvedToday: number;
  avgResolutionTimeHours: number;
  slaAtRisk: number;
  ticketsByCategory: { category: string; count: number }[];
  ticketsByDay: { date: string; count: number }[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TicketHistoryEntry {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  performedBy: User;
}

export type ArticleStatus = 'Published' | 'Draft' | 'Archived';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  status: ArticleStatus;
  category: string;
  tags: string[];
  views: number;
  helpfulPercent: number;
  linkedTickets: number;
  createdAt: string;
  updatedAt: string;
  author: User;
}