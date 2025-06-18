import { Context, SessionFlavor } from 'grammy';

export interface Notification {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

export interface SessionData {
  isLoggedIn: boolean;
  waitingFor: string | null;
  tempCarnet?: string;
  userId: string;
  notifications: Notification[];
}

export type MyContext = Context & SessionFlavor<SessionData>;
