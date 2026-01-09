import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  fetchTasksByProject,
  updateTaskStatus,
} from "../services/taskService";
import TaskModal from "../components/TaskModal";

const columns = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "completed", title: "Completed" },
];

export default function Tasks({ projectId }) {
  const [tasks, setTasks] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const loadTasks = async () => {
    const res = await fetchTasksByProject(projectId);
    setTasks(res.data);
  };

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    await updateTaskStatus(taskId, newStatus);
    loadTasks();
  };

  const openEdit = (task) => {
    setSelectedTask(task);
    setOpenModal(true);
  };

  return (
    <>
      <button
        onClick={() => {
          setSelectedTask(null);
          setOpenModal(true);
        }}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Create Task
      </button>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-100 p-3 rounded min-h-[500px]"
                >
                  <h3 className="font-semibold mb-3">{col.title}</h3>

                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task, index) => (
                      <Draggable
                        draggableId={task._id}
                        index={index}
                        key={task._id}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => openEdit(task)}
                            className="bg-white p-3 mb-3 rounded shadow cursor-pointer"
                          >
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-gray-500">
                              Priority: {task.priority}
                            </p>
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

      {openModal && (
        <TaskModal
          projectId={projectId}
          task={selectedTask}
          onClose={() => setOpenModal(false)}
          onSaved={loadTasks}
        />
      )}
    </>
  );
}
