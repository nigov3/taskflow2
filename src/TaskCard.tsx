import { Task, PRIORITY_CONFIG } from './types';
import { TeamMember } from './types';
import { formatDate, isOverdue, isDueSoon, getDaysUntilDeadline } from './store';

interface TaskCardProps {
  task: Task;
  members: TeamMember[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export default function TaskCard({ task, members, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const assignee = members.find((m) => m.id === task.assignee);
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.deadline);
  const dueSoon = isDueSoon(task.deadline);
  const daysLeft = getDaysUntilDeadline(task.deadline);

  return (
    <div
      className={`group bg-white rounded-xl border p-4 hover:shadow-md transition-all duration-200 cursor-pointer ${
        overdue ? 'border-red-200 bg-red-50/30' : dueSoon ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100 hover:border-gray-200'
      }`}
      onClick={() => onEdit(task)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug flex-1 line-clamp-2">
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 text-xs"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-gray-400 hover:text-red-500 text-xs"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Priority & Deadline */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig.bgColor} ${priorityConfig.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dotColor}`}></span>
          {priorityConfig.label}
        </span>
        {task.deadline && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              overdue
                ? 'bg-red-100 text-red-700'
                : dueSoon
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {overdue ? '⚠️' : dueSoon ? '⏰' : '📅'} {formatDate(task.deadline)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {assignee ? (
          <div className="flex items-center gap-1.5">
            <span className="text-base">{assignee.avatar}</span>
            <span className="text-xs text-gray-600 font-medium">{assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 italic">Не назначен</span>
        )}

        {/* Quick status change */}
        <div className="flex gap-0.5">
          {task.status !== 'todo' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const statuses: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];
                const idx = statuses.indexOf(task.status);
                if (idx > 0) onStatusChange(task.id, statuses[idx - 1]);
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-xs hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Назад"
            >
              ◀
            </button>
          )}
          {task.status !== 'done' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const statuses: Task['status'][] = ['todo', 'in_progress', 'review', 'done'];
                const idx = statuses.indexOf(task.status);
                if (idx < statuses.length - 1) onStatusChange(task.id, statuses[idx + 1]);
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-xs hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Вперёд"
            >
              ▶
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
