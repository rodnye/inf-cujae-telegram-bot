import { Context, SessionFlavor } from 'grammy';

export interface Notification {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  completed: boolean;
}

export type SessionData = {
  isLoggedIn: boolean;
  sessionToken?: string;
  userData?: User;
  
  waitingFor?: string;
  tempCarnet?: string;
  userId: string;
  notifications: Notification[];
}

export type MyContext = Context & SessionFlavor<SessionData>;


export type GradeHistory = {
  year: string;
  subjects: {
    subject: string;
    grade: number;
  }[];
};

export type User = {
  cid: string;
  name: string;
  year: number;
  email?: string;
  address?: string;
  phone?: string;

  // tipo de curso
  courseType?: string;

  userType?: 'student' | 'teacher' | 'admin';

  // historial de calificaciones por año
  gradesHistory?: GradeHistory[];
};