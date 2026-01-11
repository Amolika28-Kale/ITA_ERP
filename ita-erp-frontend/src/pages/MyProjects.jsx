import { useEffect, useState } from "react";
import { FolderKanban, Users, Calendar, ArrowRight } from "lucide-react";
import { fetchMyProjects } from "../services/projectService";
import { useNavigate } from "react-router-dom";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetchMyProjects();
      setProjects(res.data);
    } catch (err) {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">Loading projects...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderKanban className="text-indigo-500" />
          My Projects
        </h1>
      </div>

      {/* PROJECT LIST */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
            //   onClick={() => navigate(`/projects/${project._id}/tasks`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= PROJECT CARD ================= */

function ProjectCard({ project, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-lg cursor-pointer transition group"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-lg group-hover:text-indigo-600">
          {project.name}
        </h3>
        <StatusBadge status={project.status} />
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Users size={16} />
          {project.members?.length || 0} Members
        </div>

        <div className="flex items-center gap-1">
          <Calendar size={16} />
          {new Date(project.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <ArrowRight className="text-indigo-500 group-hover:translate-x-1 transition" />
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  const styles = {
    active: "bg-green-100 text-green-600",
    completed: "bg-blue-100 text-blue-600",
    "on-hold": "bg-yellow-100 text-yellow-600",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

/* ================= EMPTY STATE ================= */

function EmptyState() {
  return (
    <div className="bg-white border rounded-2xl p-10 text-center text-gray-500">
      <FolderKanban size={40} className="mx-auto mb-3 text-indigo-400" />
      <p className="font-semibold">No Projects Assigned</p>
      <p className="text-sm mt-1">
        You are not assigned to any project yet.
      </p>
    </div>
  );
}
