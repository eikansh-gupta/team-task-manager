import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { api, setToken } from "./api";
import "./App.css";

type User = { id: string; name: string; email: string; role: "ADMIN" | "MEMBER" };
type Project = { id: string; name: string; description?: string };
type Task = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate?: string | null;
  assignee?: { id: string; name: string };
  project: { id: string; name: string };
};

type Dashboard = {
  totalProjects: number;
  totalTasks: number;
  byStatus: { TODO: number; IN_PROGRESS: number; DONE: number };
  overdueTasks: number;
  assignedToMe: number;
};

function App() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [token, setLocalToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "MEMBER",
  });
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({
    title: "",
    projectId: "",
    dueDate: "",
  });

  useEffect(() => {
    setToken(token);
  }, [token]);

  const selectedProjectName = useMemo(
    () => projects.find((p) => p.id === taskForm.projectId)?.name,
    [projects, taskForm.projectId],
  );

  async function loadData() {
    const [me, projectList, taskList, summary] = await Promise.all([
      api.get<User>("/api/auth/me"),
      api.get<Project[]>("/api/projects"),
      api.get<Task[]>("/api/tasks"),
      api.get<Dashboard>("/api/dashboard/summary"),
    ]);
    setUser(me.data);
    setProjects(projectList.data);
    setTasks(taskList.data);
    setDashboard(summary.data);
  }

  useEffect(() => {
    if (!token) return;
    loadData().catch(() => {
      setError("Session expired, please login again.");
      logout();
    });
  }, [token]);

  function logout() {
    setLocalToken(null);
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setProjects([]);
    setTasks([]);
    setDashboard(null);
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        mode === "signup"
          ? authForm
          : { email: authForm.email, password: authForm.password };
      const res = await api.post<{ token: string }>(endpoint, payload);
      localStorage.setItem("token", res.data.token);
      setLocalToken(res.data.token);
    } catch {
      setError("Authentication failed. Check your details.");
    }
  }

  async function createProject(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/projects", projectForm);
      setProjectForm({ name: "", description: "" });
      await loadData();
    } catch {
      setError("Could not create project.");
    }
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/tasks", {
        ...taskForm,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
      });
      setTaskForm({ title: "", projectId: "", dueDate: "" });
      await loadData();
    } catch {
      setError("Could not create task.");
    }
  }

  async function updateStatus(taskId: string, status: Task["status"]) {
    setError("");
    try {
      await api.patch(`/api/tasks/${taskId}`, { status });
      await loadData();
    } catch {
      setError("Could not update task status.");
    }
  }

  if (!token) {
    return (
      <main className="container">
        <h1>Team Task Manager</h1>
        <p>{mode === "signup" ? "Create an account" : "Login to continue"}</p>
        <form onSubmit={handleAuth} className="card form">
          {mode === "signup" && (
            <>
              <input
                placeholder="Name"
                value={authForm.name}
                onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                required
              />
              <select
                value={authForm.role}
                onChange={(e) => setAuthForm({ ...authForm, role: e.target.value as "ADMIN" | "MEMBER" })}
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />
          <button type="submit">{mode === "signup" ? "Sign up" : "Login"}</button>
        </form>
        <button className="link" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
          {mode === "signup" ? "Already have an account? Login" : "No account? Sign up"}
        </button>
        {error && <p className="error">{error}</p>}
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <h1>Team Task Manager</h1>
        <div>
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {dashboard && (
        <section className="grid">
          <article className="card"><h3>Projects</h3><p>{dashboard.totalProjects}</p></article>
          <article className="card"><h3>Total Tasks</h3><p>{dashboard.totalTasks}</p></article>
          <article className="card"><h3>Overdue</h3><p>{dashboard.overdueTasks}</p></article>
          <article className="card"><h3>Assigned To Me</h3><p>{dashboard.assignedToMe}</p></article>
        </section>
      )}

      <section className="grid">
        <form onSubmit={createProject} className="card form">
          <h2>Create Project</h2>
          <input
            placeholder="Project Name"
            value={projectForm.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
          />
          <button type="submit">Create Project</button>
        </form>

        <form onSubmit={createTask} className="card form">
          <h2>Create Task</h2>
          <input
            placeholder="Task title"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />
          <select
            value={taskForm.projectId}
            onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
            required
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
          />
          <button type="submit">Create Task</button>
          <small>{selectedProjectName ? `Creating in ${selectedProjectName}` : "Pick a project"}</small>
        </form>
      </section>

      <section className="card">
        <h2>Tasks</h2>
        <ul className="taskList">
          {tasks.map((task) => (
            <li key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <p>{task.project.name} • {task.assignee?.name || "Unassigned"}</p>
              </div>
              <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value as Task["status"])}>
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </li>
          ))}
        </ul>
      </section>
      {error && <p className="error">{error}</p>}
    </main>
  );
}

export default App;
