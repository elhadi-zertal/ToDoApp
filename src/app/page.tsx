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
        <div className="w-8 h-8 border-2 border-[var(--color-brand-coral)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] font-sans text-[var(--text-primary)] antialiased">
      {/* Top Navigation Bar */}
      <nav className="w-full bg-[var(--bg-card)] border-b border-[var(--border)] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-coral)] flex items-center justify-center shadow-[0_0_20px_rgba(218,119,86,0.2)]">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              My Tasks
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-[var(--text-muted)] truncate max-w-[200px]" title={user?.email}>
                {user?.email}
              </span>
            </div>
            <button
              onClick={signOut}
              className="text-sm font-medium text-[var(--color-brand-coral)] hover:text-[var(--color-brand-coral-hover)] transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto mt-10 px-4">
        {/* Input Area */}
        <form onSubmit={addTodo}>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-5 py-4 text-base placeholder:text-[var(--text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-coral)]/30 focus:border-[var(--color-brand-coral)] transition-all duration-300"
            />
            <button
              type="submit"
              disabled={adding || !newTask.trim()}
              className="rounded-xl bg-[var(--color-brand-coral)] px-7 py-4 text-[#FEFDFB] font-semibold hover:bg-[var(--color-brand-coral-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-coral)]/50 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(218,119,86,0.3)] hover:shadow-[0_6px_20px_rgba(218,119,86,0.4)] cursor-pointer whitespace-nowrap active:scale-[0.98]"
            >
              {adding ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>

        {/* Filter Tabs + Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 mb-4">
          <div className="flex gap-2 p-1.5 bg-[var(--bg-input)] border border-[var(--border)] rounded-full w-full sm:w-auto">
            {(["all", "active", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  filter === f
                    ? "bg-[var(--color-brand-coral)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <span className="text-sm font-medium text-[var(--text-muted)] bg-[var(--bg-input)] px-4 py-2 rounded-full border border-[var(--border)]">
            {activeTodosCount} task{activeTodosCount !== 1 ? "s" : ""} left
          </span>
        </div>

        {/* Task List */}
        {loadingTodos ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[var(--bg-input)] border-t-[var(--color-brand-coral)] rounded-full animate-spin" />
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--bg-input)] border border-[var(--border)] flex items-center justify-center mb-6 shadow-sm">
              <svg
                className="w-10 h-10 text-[var(--text-muted)] opacity-50"
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
            <h3 className="text-[var(--text-primary)] text-xl font-semibold mb-2">
              {filter === "all"
                ? "It's quiet in here..."
                : filter === "active"
                ? "You're all caught up!"
                : "Nothing completed yet."}
            </h3>
            <p className="text-[var(--text-muted)] text-[15px] max-w-sm">
              {filter === "all"
                ? "Add a task above to start organizing your day."
                : filter === "active"
                ? "Enjoy your free time, or add more tasks above."
                : "Complete a task to see it show up here."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--color-brand-coral)]/40 hover:shadow-md transition-all duration-200"
              >
                {/* Custom Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id, todo.is_complete)}
                  className={`relative w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 cursor-pointer ${
                    todo.is_complete
                      ? "bg-[var(--color-brand-coral)] border-[var(--color-brand-coral)]"
                      : "border-[var(--text-muted)] hover:border-[var(--color-brand-coral)] bg-transparent"
                  }`}
                >
                  {todo.is_complete && (
                    <svg
                      className="w-3.5 h-3.5 text-white animate-checkmark"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                {/* Task Text */}
                <span
                  className={`flex-1 text-[15px] transition-all duration-300 ${
                    todo.is_complete
                      ? "line-through text-[var(--text-muted)] opacity-60"
                      : "text-[var(--text-primary)]"
                  }`}
                >
                  {todo.text}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 sm:focus:opacity-100 w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:bg-red-500/80 hover:shadow-sm hover:shadow-red-500/20 transition-all duration-200 cursor-pointer outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <svg
                    className="w-[18px] h-[18px]"
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
