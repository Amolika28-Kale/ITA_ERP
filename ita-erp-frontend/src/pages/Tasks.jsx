import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { fetchTasksByProject, updateTaskStatus } from "../services/taskService";
import TaskModal from "../components/TaskModal";
import { 
  Plus, Calendar, AlertCircle, Clock, 
  MoreHorizontal, GripVertical 
} from "lucide-react";

const COLUMNS = [
  { id: "todo", title: "To Do", color: "border-slate-300" },
  { id: "in-progress", title: "In Progress", color: "border-indigo-400" },
  { id: "review", title: "Review", color: "border-amber-400" },
  { id: "completed", title: "Completed", color: "border-emerald-400" },
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
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      loadTasks(); // Revert on failure
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-0 z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Board</h2>
          <p className="text-sm text-slate-500 font-medium">Sprint Workflow • {tasks.length} Tasks</p>
        </div>
        <button
          onClick={() => { setSelectedTask(null); setOpenModal(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          <Plus size={20} />
          Create Task
        </button>
      </div>

      {/* --- KANBAN BOARD --- */}
      {loading ? (
        <BoardSkeleton />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Mobile: Horizontal scroll container | Desktop: Grid */}
          <div className="flex pb-6 overflow-x-auto gap-6 snap-x lg:grid lg:grid-cols-4 lg:overflow-visible custom-scrollbar">
            {COLUMNS.map((col) => (
              <div key={col.id} className="min-w-[300px] w-full lg:min-w-0 snap-center">
                
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.id === 'todo' ? 'bg-slate-400' : col.id === 'in-progress' ? 'bg-indigo-500' : col.id === 'review' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <h3 className="font-bold text-slate-700 uppercase tracking-widest text-[11px]">{col.title}</h3>
                    <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {tasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <MoreHorizontal size={16} className="text-slate-300" />
                </div>

                {/* Droppable Zone */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-[2rem] p-3 transition-colors min-h-[500px] lg:min-h-[70vh] border-2 border-dashed ${snapshot.isDraggingOver ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-100/40 border-transparent'}`}
                    >
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

/* ================= TASK CARD COMPONENT ================= */

function TaskCard({ task, provided, isDragging, onClick }) {
  const priorityStyles = {
    high: "bg-red-50 text-red-600",
    medium: "bg-amber-50 text-amber-600",
    low: "bg-slate-50 text-slate-600",
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      className={`group bg-white p-5 mb-4 rounded-3xl shadow-sm border border-slate-100 transition-all cursor-grab active:cursor-grabbing hover:shadow-xl hover:shadow-indigo-500/5 ${isDragging ? 'rotate-3 scale-105 shadow-2xl ring-2 ring-indigo-500/20 z-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight ${priorityStyles[task.priority] || priorityStyles.low}`}>
          {task.priority || 'Normal'}
        </span>
        <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <h4 className="font-bold text-slate-800 leading-tight mb-4 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-3">
           {/* Mini Avatar */}
           <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 border border-white">
              {task.assignedTo?.name?.charAt(0) || <Plus size={10} />}
           </div>
           
           {task.dueDate && (
             <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                <Clock size={12} />
                {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
             </div>
           )}
        </div>
        
        {isOverdue && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
      </div>
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-slate-100 rounded-[2rem] h-[60vh]" />
      ))}
    </div>
  );
}