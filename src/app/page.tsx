"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Filter = "all" | "active" | "completed";

interface Todo {
  id: string;
  text: string;
  is_complete: boolean;
  created_at: string;
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [adding, setAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch todos
  useEffect(() => {
    if (!user) return;
    const fetchTodos = async () => {
      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTodos(data ?? []);
      setLoadingTodos(false);
    };
    fetchTodos();
  }, [user]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("todos")
      .insert({ text: newTask.trim(), user_id: user.id })
      .select()
      .single();
    if (!error && data) {
      setTodos((prev) => [data, ...prev]);
      setNewTask("");
      inputRef.current?.focus();
    }
    setAdding(false);
  };

  const toggleTodo = async (id: string, is_complete: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_complete: !is_complete } : t))
    );
    await supabase.from("todos").update({ is_complete: !is_complete }).eq("id", id);
  };

  const deleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.is_complete;
    if (filter === "completed") return t.is_complete;
    return true;
  });

  const activeTodosCount = todos.filter((t) => !t.is_complete).length;

  // ── Loading / auth guard ──────────────────────────────────
  if (loading || (!user && !loading)) {
    return (
      <div className="fullpage-spinner">
        <div className="spinner-sm" />
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────
  return (
    <div className="page-root">

      {/* ── Nav Bar ── */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">
              <svg className="w-4 h-4" style={{ width: "1rem", height: "1rem", color: "white" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="nav-wordmark">My Tasks</span>
          </div>
          <div className="nav-right">
            <div className="nav-user">
              <span className="nav-dot" />
              <span className="nav-email" title={user?.email}>{user?.email}</span>
            </div>
            <button onClick={signOut} className="nav-signout">Sign out</button>
          </div>
        </div>
      </nav>

      {/* ── Page Body ── */}
      <main className="page-body">
        <div className="app-card">

          {/* Header */}
          <div className="app-header">
            <h1 className="app-title">My Tasks</h1>
            <p className="app-subtitle">Stay organized and productive</p>
          </div>

          <div className="divider" />

          {/* Input Row */}
          <form onSubmit={addTodo}>
            <div className="input-row">
              <input
                ref={inputRef}
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task…"
                className="task-input"
              />
              <button
                type="submit"
                disabled={adding || !newTask.trim()}
                className="add-btn"
              >
                {adding ? (
                  <>
                    <span className="add-btn-spinner" />
                    Adding
                  </>
                ) : (
                  "Add task"
                )}
              </button>
            </div>
          </form>

          {/* Filter + Counter */}
          <div className="controls-row">
            <div className="filter-group">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`filter-btn${filter === f ? " active" : ""}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <span className="task-counter">
              {activeTodosCount} task{activeTodosCount !== 1 ? "s" : ""} left
            </span>
          </div>

          {/* Task list / loading / empty */}
          {loadingTodos ? (
            <div className="spinner-wrap">
              <div className="spinner" />
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg
                  style={{ width: "2rem", height: "2rem", color: "var(--text-muted)", opacity: 0.5 }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="empty-title">
                {filter === "all"
                  ? "It's quiet in here…"
                  : filter === "active"
                  ? "You're all caught up!"
                  : "Nothing completed yet."}
              </p>
              <p className="empty-desc">
                {filter === "all"
                  ? "Add a task above to start organizing your day."
                  : filter === "active"
                  ? "Enjoy your free time, or add more tasks above."
                  : "Complete a task to see it show up here."}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTodos.map((todo, index) => (
                <li
                  key={todo.id}
                  className="task-item animate-fade-in-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id, todo.is_complete)}
                    className={`task-checkbox${todo.is_complete ? " checked" : ""}`}
                    aria-label={todo.is_complete ? "Mark incomplete" : "Mark complete"}
                  >
                    {todo.is_complete && (
                      <svg
                        className="animate-checkmark"
                        style={{ width: "0.75rem", height: "0.75rem", color: "white" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* Text */}
                  <span className={`task-text${todo.is_complete ? " done" : ""}`}>
                    {todo.text}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="task-delete"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <svg style={{ width: "1rem", height: "1rem" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>
      </main>
    </div>
  );
}
