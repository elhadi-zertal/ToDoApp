"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Filter = "all" | "today" | "upcoming" | "overdue";

interface Todo {
  id: string;
  text: string;
  is_complete: boolean;
  created_at: string;
  due_date: string | null;
  priority: boolean;
  description: string | null;
}

interface EditForm {
  text: string;
  due_date: string;
  description: string;
}

function todayStr(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const today = todayStr();
  if (dateStr === today) return "Today";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    text: "",
    due_date: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchAndProcess = async () => {
      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const all: Todo[] = (data ?? []).map((t: Todo) => ({
        ...t,
        description: t.description ?? null,
      }));
      const today = todayStr();
      const overdueIds = all
        .filter((t) => !t.is_complete && t.due_date && t.due_date < today)
        .map((t) => t.id);

      if (overdueIds.length > 0) {
        await supabase
          .from("todos")
          .update({ due_date: today, priority: true })
          .in("id", overdueIds);
        setTodos(
          all.map((t) =>
            overdueIds.includes(t.id)
              ? { ...t, due_date: today, priority: true }
              : t
          )
        );
      } else {
        setTodos(all);
      }
      setLoadingTodos(false);
    };
    fetchAndProcess();
  }, [user]);

  useEffect(() => {
    if (editingId) {
      setTimeout(() => editInputRef.current?.focus(), 50);
    }
  }, [editingId]);

  /* ── CRUD ── */

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user || adding) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("todos")
      .insert({
        text: newTask.trim(),
        user_id: user.id,
        due_date: newDueDate || null,
        priority: false,
        description: newDescription.trim() || null,
      })
      .select()
      .single();
    if (!error && data) {
      setTodos((prev) => [
        { ...data, description: data.description ?? null },
        ...prev,
      ]);
      setNewTask("");
      setNewDueDate("");
      setNewDescription("");
      inputRef.current?.focus();
    }
    setAdding(false);
  };

  const toggleTodo = async (id: string, is_complete: boolean) => {
    const nowComplete = !is_complete;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_complete: nowComplete } : t
      )
    );
    await supabase
      .from("todos")
      .update({ is_complete: nowComplete })
      .eq("id", id);

    // Auto-delete after 1.5s if task was just completed
    if (nowComplete) {
      setTimeout(async () => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
        await supabase.from("todos").delete().eq("id", id);
      }, 1500);
    }
  };

  const deleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditForm({
      text: todo.text,
      due_date: todo.due_date ?? "",
      description: todo.description ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ text: "", due_date: "", description: "" });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.text.trim() || saving) return;
    setSaving(true);
    const updates = {
      text: editForm.text.trim(),
      due_date: editForm.due_date || null,
      description: editForm.description.trim() || null,
    };
    const { error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", id);
    if (!error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
      setEditingId(null);
    }
    setSaving(false);
  };

  /* ── Derived data ── */

  const today = todayStr();

  const filtered = todos.filter((t) => {
    switch (filter) {
      case "today":
        return t.due_date === today;
      case "upcoming":
        return !t.is_complete && !!t.due_date && t.due_date > today;
      case "overdue":
        return !t.is_complete && t.priority === true;
      default:
        return true;
    }
  });

  const filteredTodos = [...filtered].sort((a, b) => {
    if (a.priority === b.priority) return 0;
    return a.priority ? -1 : 1;
  });

  const activeTodosCount = todos.filter((t) => !t.is_complete).length;
  const overdueCount = todos.filter(
    (t) => !t.is_complete && t.priority
  ).length;

  const emptyMessages: Record<Filter, { title: string; desc: string }> = {
    all: {
      title: "It's quiet in here...",
      desc: "Add a task above to start organizing your day.",
    },
    today: {
      title: "Nothing due today.",
      desc: "Tasks scheduled for today will appear here.",
    },
    upcoming: {
      title: "No upcoming tasks.",
      desc: "Add a task with a future due date to see it here.",
    },
    overdue: {
      title: "No overdue tasks!",
      desc: "You're on top of everything. Great job!",
    },
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "upcoming", label: "Upcoming" },
    { key: "overdue", label: "Overdue" },
  ];

  /* ── Loading / auth guard ── */

  if (loading || (!user && !loading)) {
    return (
      <div className="fullpage-spinner">
        <div className="spinner-sm" />
      </div>
    );
  }

  /* ── Render ── */

  return (
    <div className="page-root">
      {/* Nav */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <div className="nav-left">
            <div className="nav-logo">
              <svg
                style={{ width: "1rem", height: "1rem", color: "white" }}
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
            <span className="nav-wordmark">My Tasks</span>
          </div>
          <div className="nav-right">
            <div className="nav-user">
              <span className="nav-dot" />
              <span className="nav-email" title={user?.email}>
                {user?.email}
              </span>
            </div>
            <button onClick={signOut} className="nav-signout">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      {/* Body */}
      <main className="page-body">
        <div className="app-card">
          {/* Header */}
          <div className="app-header">
            <h1 className="app-title">My Tasks</h1>
            <p className="app-subtitle">Stay organized and productive</p>
          </div>

          <div className="divider" />

          {/* ── Create Task ── */}
          <form onSubmit={addTodo} className="create-form">
            <div className="input-row">
              <input
                ref={inputRef}
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task..."
                className="task-input"
              />
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="date-picker"
                title="Set due date (optional)"
                min={today}
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
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add a description... (optional)"
              className="task-desc-input create-desc"
              rows={2}
            />
          </form>

          {/* ── Filters ── */}
          <div className="controls-row">
            <div className="filter-group">
              {filters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`filter-btn${
                    filter === key ? " active" : ""
                  }${key === "overdue" ? " filter-btn-overdue" : ""}`}
                >
                  {label}
                  {key === "overdue" && overdueCount > 0 && (
                    <span className="overdue-badge">{overdueCount}</span>
                  )}
                </button>
              ))}
            </div>
            <span className="task-counter">
              {activeTodosCount} task
              {activeTodosCount !== 1 ? "s" : ""} left
            </span>
          </div>

          {/* ── Task List ── */}
          {loadingTodos ? (
            <div className="spinner-wrap">
              <div className="spinner" />
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon-wrap">
                <svg
                  style={{
                    width: "2rem",
                    height: "2rem",
                    color: "var(--text-muted)",
                    opacity: 0.5,
                  }}
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
              <p className="empty-title">
                {emptyMessages[filter].title}
              </p>
              <p className="empty-desc">
                {emptyMessages[filter].desc}
              </p>
            </div>
          ) : (
            <ul className="task-list">
              {filteredTodos.map((todo, index) => (
                <li
                  key={todo.id}
                  className={`task-item animate-fade-in-up${
                    todo.priority && !todo.is_complete ? " priority" : ""
                  }${editingId === todo.id ? " editing" : ""}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {editingId === todo.id ? (
                    /* ── Edit mode ── */
                    <div className="task-edit-form">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editForm.text}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            text: e.target.value,
                          }))
                        }
                        className="task-edit-input"
                        placeholder="Task title..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(todo.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <input
                        type="date"
                        value={editForm.due_date}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            due_date: e.target.value,
                          }))
                        }
                        className="date-picker task-edit-date"
                        title="Due date"
                        min={today}
                      />
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        className="task-desc-input"
                        placeholder="Add a description... (optional)"
                        rows={2}
                      />
                      <div className="task-edit-actions">
                        <button
                          onClick={() => saveEdit(todo.id)}
                          disabled={saving || !editForm.text.trim()}
                          className="edit-save-btn"
                        >
                          {saving ? (
                            <span className="add-btn-spinner" />
                          ) : (
                            "Save"
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="edit-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Checkbox */}
                      <button
                        onClick={() =>
                          toggleTodo(todo.id, todo.is_complete)
                        }
                        className={`task-checkbox${
                          todo.is_complete ? " checked" : ""
                        }`}
                        aria-label={
                          todo.is_complete
                            ? "Mark incomplete"
                            : "Mark complete"
                        }
                      >
                        {todo.is_complete && (
                          <svg
                            className="animate-checkmark"
                            style={{
                              width: "0.75rem",
                              height: "0.75rem",
                              color: "white",
                            }}
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

                      {/* Body */}
                      <div className="task-body">
                        <div className="task-text-row">
                          <span
                            className={`task-text${
                              todo.is_complete ? " done" : ""
                            }`}
                          >
                            {todo.text}
                          </span>
                          {todo.priority && !todo.is_complete && (
                            <span className="priority-badge">
                              Overdue
                            </span>
                          )}
                        </div>
                        {todo.description && (
                          <p
                            className={`task-description${
                              todo.is_complete ? " done" : ""
                            }`}
                          >
                            {todo.description}
                          </p>
                        )}
                        {todo.due_date && (
                          <span
                            className={`task-due-date${
                              todo.priority && !todo.is_complete
                                ? " overdue"
                                : ""
                            }`}
                          >
                            {formatDueDate(todo.due_date)}
                          </span>
                        )}
                      </div>

                      {/* Edit */}
                      <button
                        onClick={() => startEdit(todo)}
                        className="task-edit-btn"
                        title="Edit task"
                        aria-label="Edit task"
                      >
                        <svg
                          style={{ width: "1rem", height: "1rem" }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="task-delete"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <svg
                          style={{ width: "1rem", height: "1rem" }}
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
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
