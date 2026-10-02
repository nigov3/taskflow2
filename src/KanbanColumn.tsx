import { Task, TaskStatus, STATUS_CONFIG } from './types';
import { TeamMember } from './types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  members: TeamMember[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

export default function KanbanColumn({
  status,
  tasks,
  members,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddTask,
}: KanbanColumnProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex flex-col min-w-[280px] max-w-[340px] w-full">
      {/* Column Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${config.bgColor}`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.icon}</span>
          <h2 className={`font-semibold text-sm ${config.color}`}>{config.label}</h2>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${config.color} bg-white/60`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors text-gray-500 hover:text-gray-700"
          title="Добавить задачу"
        >
          +
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 scrollbar-thin">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <span className="text-3xl mb-2 opacity-50">📭</span>
            <p className="text-xs">Нет задач</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
