import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  fetchTasksByProject,
  updateTaskStatus,
} from "../services/taskService";
import TaskModal from "../components/TaskModal";
import { Plus } from "lucide-react";

/* ================= KANBAN COLUMNS ================= */
const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "completed", title: "Completed" },
];

export default function Tasks() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  /* ================= LOAD TASKS ================= */
  const loadTasks = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const res = await fetchTasksByProject(projectId);
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  /* ================= DRAG & DROP ================= */
  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await updateTaskStatus(taskId, newStatus);
      loadTasks();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  /* ================= MODAL ================= */
  const openCreate = () => {
    setSelectedTask(null);
    setOpenModal(true);
  };

  const openEdit = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow border">
        <div>
          <h2 className="text-2xl font-bold">Tasks Board</h2>
          <p className="text-sm text-gray-500">
            Manage project tasks using Kanban workflow
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-20 text-gray-400">
          Loading tasks...
        </div>
      )}

      {/* KANBAN BOARD */}
      {!loading && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {columns.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-gray-100 rounded-xl p-4 min-h-[520px]"
                  >
                    <h3 className="font-bold text-sm mb-4 text-gray-700">
                      {col.title}
                    </h3>

                    {tasks
                      .filter((t) => t.status === col.id)
                      .map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openEdit(task)}
                              className="bg-white p-4 mb-3 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition"
                            >
                              <p className="font-semibold text-gray-900">
                                {task.title}
                              </p>

                              {task.priority && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Priority:{" "}
                                  <span className="capitalize font-semibold">
                                    {task.priority}
                                  </span>
                                </p>
                              )}

                              {task.assignedTo && (
                                <p className="text-xs text-indigo-600 mt-1">
                                  Assigned: {task.assignedTo.name}
                                </p>
                              )}

                              {task.dueDate && (
                                <p className="text-xs text-gray-400 mt-1">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {/* TASK MODAL */}
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
