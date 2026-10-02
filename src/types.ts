export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  deadline: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string; // emoji or initials
  role: string;
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  todo: { label: 'К выполнению', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: '📋' },
  in_progress: { label: 'В работе', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '🔄' },
  review: { label: 'На проверке', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '🔍' },
  done: { label: 'Готово', color: 'text-green-700', bgColor: 'bg-green-100', icon: '✅' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string; dotColor: string }> = {
  low: { label: 'Низкий', color: 'text-slate-600', bgColor: 'bg-slate-50', dotColor: 'bg-slate-400' },
  medium: { label: 'Средний', color: 'text-blue-600', bgColor: 'bg-blue-50', dotColor: 'bg-blue-400' },
  high: { label: 'Высокий', color: 'text-orange-600', bgColor: 'bg-orange-50', dotColor: 'bg-orange-400' },
  urgent: { label: 'Срочный', color: 'text-red-600', bgColor: 'bg-red-50', dotColor: 'bg-red-500' },
};
