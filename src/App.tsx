import { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from './types';
import { getTasks, saveTasks, getMembers, saveMembers, generateId } from './store';
import KanbanColumn from './KanbanColumn';
import TaskModal from './TaskModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState(getMembers());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [filterAssignee, setFilterAssignee] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTeamPanel, setShowTeamPanel] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    setTasks(getTasks());
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveMembers(members);
  }, [members]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterAssignee && task.assignee !== filterAssignee) return false;
      if (filterPriority && task.priority !== filterPriority) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tasks, filterAssignee, filterPriority, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter((t) => {
      if (!t.deadline || t.status === 'done') return false;
      return new Date(t.deadline) < new Date(new Date().toDateString());
    }).length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    return { total, done, overdue, inProgress };
  }, [tasks]);

  const handleSaveTask = (task: Task) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === task.id);
      if (exists) {
        return prev.map((t) => (t.id === task.id ? task : t));
      }
      return [...prev, task];
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Удалить эту задачу?')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setEditingTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDefaultStatus(task.status);
    setModalOpen(true);
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const emojis = ['👤', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '🧑‍💼', '👨‍🔧', '👩‍🔬'];
    const newMember = {
      id: generateId(),
      name: newMemberName.trim(),
      avatar: emojis[Math.floor(Math.random() * emojis.length)],
      role: newMemberRole.trim() || 'Участник',
    };
    setMembers((prev) => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleRemoveMember = (id: string) => {
    if (confirm('Удалить участника?')) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">TaskFlow</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Управление задачами команды</p>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className="text-gray-600">Всего: <b>{stats.total}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">В работе: <b>{stats.inProgress}</b></span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-600">Готово: <b>{stats.done}</b></span>
              </div>
              {stats.overdue > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-red-600">Просрочено: <b>{stats.overdue}</b></span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTeamPanel(!showTeamPanel)}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
              >
                👥 Команда
              </button>
              <button
                onClick={() => handleOpenNewTask()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200 flex items-center gap-1.5"
              >
                <span>+</span>
                <span className="hidden sm:inline">Новая задача</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Team Panel */}
      {showTeamPanel && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Команда</h3>
              <button
                onClick={() => setShowTeamPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full group"
                >
                  <span>{member.avatar}</span>
                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
                  <span className="text-xs text-gray-400">{member.role}</span>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-4 h-4 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-400 text-xs transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Имя участника"
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <input
                type="text"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                placeholder="Роль"
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <button
                onClick={handleAddMember}
                className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск задач..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="">Все исполнители</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.avatar} {m.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value="">Все приоритеты</option>
            <option value="low">🟢 Низкий</option>
            <option value="medium">🔵 Средний</option>
            <option value="high">🟠 Высокий</option>
            <option value="urgent">🔴 Срочный</option>
          </select>

          {/* View Toggle */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'kanban' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📊 Доска
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📋 Список
            </button>
          </div>

          {/* Reset Filters */}
          {(filterAssignee || filterPriority || searchQuery) && (
            <button
              onClick={() => {
                setFilterAssignee('');
                setFilterPriority('');
                setSearchQuery('');
              }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              ✕ Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-8">
        {viewMode === 'kanban' ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                tasks={filteredTasks.filter((t) => t.status === status)}
                members={members}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onAddTask={handleOpenNewTask}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Задача</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Статус</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Приоритет</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Исполнитель</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Дедлайн</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        <span className="text-4xl block mb-2">📭</span>
                        Задачи не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const assignee = members.find((m) => m.id === task.assignee);
                      const overdue = task.deadline && !['done'].includes(task.status) && new Date(task.deadline) < new Date(new Date().toDateString());
                      return (
                        <tr
                          key={task.id}
                          className={`border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer transition-colors ${overdue ? 'bg-red-50/30' : ''}`}
                          onClick={() => handleEditTask(task)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm text-gray-900">{task.title}</div>
                            {task.description && (
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={task.status}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task.id, e.target.value as TaskStatus);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white"
                            >
                              <option value="todo">📋 К выполнению</option>
                              <option value="in_progress">🔄 В работе</option>
                              <option value="review">🔍 На проверке</option>
                              <option value="done">✅ Готово</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {task.priority === 'urgent' ? '🔴' : task.priority === 'high' ? '🟠' : task.priority === 'medium' ? '🔵' : '🟢'} {
                                task.priority === 'urgent' ? 'Срочный' :
                                task.priority === 'high' ? 'Высокий' :
                                task.priority === 'medium' ? 'Средний' : 'Низкий'
                              }
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {assignee ? (
                              <span className="text-sm">{assignee.avatar} {assignee.name}</span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {task.deadline ? (
                              <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                {overdue && '⚠️ '}{new Date(task.deadline).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-4xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Добро пожаловать в TaskFlow!</h3>
            <p className="text-gray-500 text-sm max-w-md mb-6">
              Создайте свою первую задачу, назначьте исполнителя и установите дедлайн. 
              Управляйте задачами команды эффективно!
            </p>
            <button
              onClick={() => handleOpenNewTask()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-200"
            >
              + Создать первую задачу
            </button>
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        members={members}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
