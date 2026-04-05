import { collection, DocumentData, CollectionReference } from 'firebase/firestore';
import { db } from './firebase';
import type { 
  User, 
  Lead, 
  Property, 
  Visit, 
  Message, 
  Notification,
  Conversation,
  CalendarEvent,
  Campaign
} from '../types';

// Helper to create typed collection references
const createCollection = <T = DocumentData>(collectionName: string) => {
  return collection(db, collectionName) as CollectionReference<T>;
};

export const collections = {
  users: createCollection<User>('users'),
  leads: createCollection<Lead>('leads'),
  properties: createCollection<Property>('properties'),
  visits: createCollection<Visit>('visits'),
  messages: createCollection<Message>('messages'),
  notifications: createCollection<Notification>('notifications'),
  conversations: createCollection<Conversation>('conversations'),
  calendarEvents: createCollection<CalendarEvent>('calendarEvents'),
  campaigns: createCollection<Campaign>('campaigns'),
};
