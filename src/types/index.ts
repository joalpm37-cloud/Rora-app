import { Timestamp } from 'firebase/firestore';

export type UserRole = 'director' | 'agent';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId: string;
  zones: string[];
  avatarUrl?: string;
  createdAt: Timestamp | Date;
}

export type LeadType = 'buyer' | 'seller' | 'renter' | 'investor';
export type LeadStatus = 'new' | 'contacted' | 'visit_scheduled' | 'closed' | 'archived';
export type LeadSource = 'meta_ads' | 'referral' | 'organic' | 'portal';

export interface Lead {
  id: string;
  agencyId: string;
  assignedTo: string | null;
  name: string;
  phone: string;
  email?: string;
  type: LeadType;
  zone: string;
  budget: number;
  score: number;
  aiAnalysis: string;
  status: LeadStatus;
  source: LeadSource;
  notes: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type PropertyType = 'apartment' | 'house' | 'office' | 'commercial' | 'land';
export type PropertyOperation = 'sale' | 'rental' | 'exclusive';
export type PropertyStatus = 'active' | 'reserved' | 'sold' | 'withdrawn';

export interface Property {
  id: string;
  agencyId: string;
  agentId: string;
  type: PropertyType;
  operation: PropertyOperation;
  address: string;
  zone: string;
  price: number;
  minPrice: number;
  sqm: number;
  usableSqm: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  hasElevator: boolean;
  hasGarage: boolean;
  photos: string[];
  coverPhoto: string;
  description: string;
  privateNotes: string;
  status: PropertyStatus;
  matchedLeads: string[];
  // Marketing & Vibe (Phase 3.8)
  videoStyle?: string;
  targetAudience?: string;
  usp?: string;
  createdAt: Timestamp | Date;
}

export type VisitStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type VisitScheduledBy = 'ai_agent' | 'manual';

export interface Visit {
  id: string;
  agencyId: string;
  leadId: string;
  propertyId: string;
  agentId: string;
  scheduledAt: Timestamp | Date;
  status: VisitStatus;
  scheduledBy: VisitScheduledBy;
  notes: string;
}

export type EventType = 'visit' | 'meeting' | 'call' | 'other';

export interface CalendarEvent {
  id?: string;
  agencyId: string;
  agentId: string;
  title: string;
  date: Timestamp | Date;
  time: string;
  clientName?: string;
  location?: string;
  type: EventType;
  createdAt: Timestamp | Date;
}

export type MessageType = 'text' | 'ai_response' | 'system_notification';
export type MessageChannel = 'web' | 'whatsapp' | 'instagram' | 'messenger';

export interface Message {
  id?: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: MessageType;
  channel?: MessageChannel;
  readBy: string[];
  createdAt: Timestamp | Date;
}

export interface Conversation {
  id?: string;
  agencyId: string;
  participants: string[];
  participantNames?: Record<string, string>;
  channel?: MessageChannel;
  lastMessage?: string;
  lastMessageAt?: Timestamp | Date;
  unreadCount?: Record<string, number>;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export type AgentType = 'crm' | 'performance' | 'content' | 'scout';
export type NotificationStatus = 'pending' | 'approved' | 'rejected';
export type NotificationPriority = 'urgent' | 'normal' | 'info';

export interface Notification {
  id: string;
  agencyId: string;
  targetUserId: string;
  agentType: AgentType;
  title: string;
  reason: string;
  data: any;
  status: NotificationStatus;
  priority: NotificationPriority;
  createdAt: Timestamp | Date;
}

export type CampaignPlatform = 'Instagram' | 'Facebook' | 'Google Ads' | 'LinkedIn' | 'TikTok';
export type CampaignStatus = 'Activa' | 'Pausada' | 'Completada' | 'Borrador' | 'Lista para lanzar';

export interface Campaign {
  id?: string;
  agencyId: string;
  name: string;
  property?: string;
  platform: CampaignPlatform;
  status: CampaignStatus;
  budget: number;
  duration?: number;
  strategy?: any;
  spent: number;
  leads: number;
  cpl: number;
  ctr: number;
  trend: 'up' | 'down';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}
