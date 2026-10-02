import { Task, TeamMember } from './types';

const TASKS_KEY = 'taskflow_tasks';
const MEMBERS_KEY = 'taskflow_members';

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Александр', avatar: '👨‍💻', role: 'Разработчик' },
  { id: '2', name: 'Мария', avatar: '👩‍🎨', role: 'Дизайнер' },
  { id: '3', name: 'Дмитрий', avatar: '👨‍💼', role: 'Менеджер' },
  { id: '4', name: 'Елена', avatar: '👩‍💻', role: 'Тестировщик' },
];

export function getTasks(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function getMembers(): TeamMember[] {
  try {
    const data = localStorage.getItem(MEMBERS_KEY);
    return data ? JSON.parse(data) : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}

export function saveMembers(members: TeamMember[]): void {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  const deadline = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return deadline < today;
}

export function isDueSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const deadline = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = deadline.getTime() - today.getTime();
  const days = diff / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 3;
}

export function getDaysUntilDeadline(dateStr: string): number {
  if (!dateStr) return Infinity;
  const deadline = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
