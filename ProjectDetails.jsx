import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8001";

const STATUS_COLORS = {
  "Active": "text-green-400 bg-green-400/10",
  "Completed": "text-blue-400 bg-blue-400/10",
  "Paused": "text-yellow-400 bg-yellow-400/10"
};

const PRIORITY_COLORS = {
  "Low": "border-white/5 bg-white/5 text-white/40",
  "Medium": "border-pink-500/20 bg-pink-500/5 text-pink-400",
  "High": "border-pink-500/50 bg-pink-500/10 text-pink-500 font-bold"
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`);
      if (!res.ok) throw new Error("Project not found");
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error(err);
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    const updatedTasks = project.tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updateProject({ tasks: updatedTasks });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const taskObj = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask,
      completed: false
    };
    
    updateProject({ tasks: [...(project.tasks || []), taskObj] });
    setNewTask("");
  };

  const updateProject = async (updates) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm("Archiving this vision is permanent. Proceed?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) navigate("/projects");
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white/20 font-mono italic">
      Synchronizing Workspace...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-pink-500/30 pb-20">
      <Navbar />
      
      {/* Hero Header */}
      <header className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full opacity-30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] font-black ${STATUS_COLORS[project.status] || "bg-white/10"}`}>
                {project.status}
              </span>
              <span className={`px-4 py-1 rounded-full text-[10px] uppercase tracking-[0.2em] border ${PRIORITY_COLORS[project.priority]}`}>
                {project.priority} Priority
              </span>
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none">{project.title}</h1>
            <p className="text-white/40 text-lg leading-relaxed">{project.description}</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition-all font-semibold flex items-center gap-2"
            >
              Adjust Parameters
            </button>
            <button 
              onClick={deleteProject}
              className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-3 rounded-xl hover:bg-red-500/20 transition-all"
            >
              Archive
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 mt-10">
        
        {/* Task Board */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Technical Roadmap</h2>
            <div className="text-white/40 text-xs font-mono">
              {project.tasks?.filter(t => t.completed).length || 0} / {project.tasks?.length || 0} TASKS FINALISED
            </div>
          </div>

          <form onSubmit={handleAddTask} className="relative">
            <input 
              type="text"
              placeholder="Inject new task into roadmap..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-pink-500/50 transition-all text-white placeholder:text-white/20"
              value={newTask}
              onChange={e => setNewTask(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-3 bottom-3 px-6 bg-white text-black rounded-xl font-bold hover:bg-pink-500 hover:text-white transition-colors">
              Deploy
            </button>
          </form>

          <div className="space-y-3">
            {project.tasks?.map(task => (
              <motion.div 
                key={task.id}
                layout
                className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                  task.completed ? "bg-black/40 border-white/5 opacity-50" : "bg-white/5 border-white/10"
                }`}
              >
                <div 
                  onClick={() => handleToggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${
                    task.completed ? "bg-pink-500 border-pink-500" : "border-white/20 hover:border-pink-500/50"
                  }`}
                >
                  {task.completed && <div className="w-3 h-3 bg-white rounded-sm" />}
                </div>
                <span className={`text-lg transition-all ${task.completed ? "line-through text-white/20" : "text-white/80"}`}>
                  {task.title}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar / Team */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-white/40 font-bold">Workspace Intelligence</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 italic">Deployment Date</span>
                <span>{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 italic">Target Horizon</span>
                <span className="text-pink-400">{project.deadline || 'Undefined'}</span>
              </div>
              <div className="h-px bg-white/5 w-full" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 italic">Lead Innovator</span>
                <span className="truncate max-w-[150px]">{project.creator_id ? "Project Lead" : "Automated"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <h3 className="text-sm uppercase tracking-widest text-white/40 font-bold">Collaborators</h3>
            <div className="space-y-4">
              {project.members?.map(mid => (
                <div key={mid} className="flex items-center gap-3 text-sm group">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] group-hover:bg-pink-500/50 transition-colors">
                    {mid.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate text-white/60">Participant ID: {mid}</span>
                </div>
              ))}
              {(!project.members || project.members.length === 0) && (
                <div className="text-white/20 text-xs italic">No additional collaborators assigned.</div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
