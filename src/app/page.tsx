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

    await supabase
      .from("todos")
      .update({ is_complete: !is_complete })
      .eq("id", id);
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

  if (loading || (!user && !loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              My Tasks
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] hidden sm:block truncate max-w-[160px]">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="text-sm px-3 py-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Add Task Form */}
        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition"
            />
            <button
              type="submit"
              disabled={adding || !newTask.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-3 text-white font-semibold hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 cursor-pointer whitespace-nowrap"
            >
              {adding ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>

        {/* Filter Tabs + Counter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-1">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  filter === f
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-sm text-[var(--text-muted)]">
            {activeTodosCount} task{activeTodosCount !== 1 ? "s" : ""} left
          </span>
        </div>

        {/* Task List */}
        {loadingTodos ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] mb-4">
              <svg
                className="w-8 h-8 text-[var(--text-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-[var(--text-muted)] text-lg font-medium">
              {filter === "all"
                ? "No tasks yet"
                : filter === "active"
                ? "No active tasks"
                : "No completed tasks"}
            </p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {filter === "all"
                ? "Add your first task above to get started"
                : ""}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 hover:border-violet-500/30 transition-all"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id, todo.is_complete)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition cursor-pointer ${
                    todo.is_complete
                      ? "bg-violet-500 border-violet-500"
                      : "border-[var(--border)] hover:border-violet-400"
                  }`}
                >
                  {todo.is_complete && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <span
                  className={`flex-1 text-sm transition ${
                    todo.is_complete
                      ? "line-through text-[var(--text-muted)]"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {todo.text}
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  title="Delete task"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
