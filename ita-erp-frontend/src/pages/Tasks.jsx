import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchTasksByProject, updateTaskStatus } from "../services/taskService";
import TaskModal from "../components/TaskModal";
import { 
  Plus, Calendar, AlertCircle, Clock, 
  MoreVertical, List, CheckCircle2, Circle
} from "lucide-react";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-slate-400", bg: "bg-slate-50/50" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-500", bg: "bg-blue-50/30" },
  { id: "review", title: "Review", color: "bg-amber-500", bg: "bg-amber-50/30" },
  { id: "completed", title: "Done", color: "bg-emerald-500", bg: "bg-emerald-50/30" },
];

export default function Tasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await fetchTasksByProject(projectId);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTasks(); }, [projectId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => 
      t._id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTasks(updatedTasks);

    try {
      await updateTaskStatus(draggableId, destination.droppableId);
    } catch (err) {
      loadTasks(); // Revert on failure
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-6">
      
      {/* --- PREMIUM HEADER --- */}
      <header className="flex flex-row justify-between items-center p-4 md:p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-12 w-12 items-center justify-center bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <List size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Project Board</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>{tasks.length} Tasks Total</span>
              <span className="h-1 w-1 bg-slate-300 rounded-full"></span>
              <span className="text-indigo-500">Active Sprint</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => { setSelectedTask(null); setOpenModal(true); }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold transition-all hover:-translate-y-0.5 active:scale-95 shadow-xl shadow-slate-200"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">New Task</span>
        </button>
      </header>

      {/* --- KANBAN BOARD --- */}
      {loading ? (
        <BoardSkeleton />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Main container: Horizontal scroll on mobile, flex on desktop */}
          <div className="flex-1 flex overflow-x-auto pb-4 gap-4 px-2 snap-x snap-mandatory no-scrollbar">
            {COLUMNS.map((col) => (
              <div 
                key={col.id} 
                className="flex-shrink-0 w-[85vw] md:w-[320px] lg:flex-1 flex flex-col h-full snap-center"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${col.color} ring-4 ring-white shadow-sm`} />
                    <h3 className="font-extrabold text-slate-700 text-sm tracking-tight">{col.title}</h3>
                    <span className="ml-2 bg-white border border-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg font-black">
                      {tasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <MoreVertical size={16} className="text-slate-400 cursor-pointer" />
                </div>

                {/* Droppable Zone with Internal Scroll */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto overflow-x-hidden rounded-[2.5rem] p-3 transition-all duration-300 custom-scrollbar ${
                        snapshot.isDraggingOver ? 'bg-indigo-50/80 ring-2 ring-indigo-200 ring-inset' : 'bg-slate-50/50 border border-slate-100'
                      }`}
                    >
                      <div className="space-y-3">
                        {tasks
                          .filter((t) => t.status === col.id)
                          .map((task, index) => (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(provided, snapshot) => (
                                <TaskCard 
                                  task={task} 
                                  provided={provided} 
                                  isDragging={snapshot.isDragging}
                                  onClick={() => { setSelectedTask(task); setOpenModal(true); }} 
                                />
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {openModal && (
        <TaskModal 
          projectId={projectId} 
          task={selectedTask} 
          onClose={() => setOpenModal(false)} 
          onSaved={loadTasks} 
        />
      )}
    </div>
  );
}

/* ================= COMPACT TASK CARD ================= */

function TaskCard({ task, provided, isDragging, onClick }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const priorityColors = {
    high: "text-rose-600 bg-rose-50",
    medium: "text-amber-600 bg-amber-50",
    low: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={`group bg-white p-4 rounded-[1.75rem] border border-slate-100 shadow-sm transition-all duration-200 select-none
        ${isDragging ? 'scale-105 shadow-2xl ring-2 ring-indigo-400 z-50 cursor-grabbing' : 'hover:shadow-md hover:border-indigo-100 cursor-grab'}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${priorityColors[task.priority] || priorityColors.low}`}>
          {task.priority || 'low'}
        </span>
        {task.status === 'completed' ? (
          <CheckCircle2 size={14} className="text-emerald-500" />
        ) : (
          <Circle size={14} className="text-slate-200" />
        )}
      </div>

      <h4 className="text-sm font-bold text-slate-800 leading-snug mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex -space-x-2">
          {/* Visual User Stack */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
            {task.assignedTo?.name?.charAt(0) || '?'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
              <Clock size={12} strokeWidth={3} />
              {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </div>
          )}
          {isOverdue && <AlertCircle size={12} className="text-rose-500 animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex-1 bg-slate-100/50 rounded-[2.5rem] h-[70vh] animate-pulse" />
      ))}
    </div>
  );
}