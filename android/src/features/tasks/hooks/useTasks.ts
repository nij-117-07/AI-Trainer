// src/features/tasks/hooks/useTasks.ts
/** Tasks, projects, and labels kept on the device. Every change is saved as soon as the list updates. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { Label, Project, Task, TaskPatch } from "../types";
import { normalizeTasks, toggleTaskCompletion } from "../lib/tasks";
import { dateKey } from "../lib/dates";
import { useNamedItems } from "./useNamedItems";

const TASKS_KEY = "tools.tasks.items.v1";
const PROJECTS_KEY = "tools.tasks.projects.v1";
const LABELS_KEY = "tools.tasks.labels.v1";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);
  const projects = useNamedItems<Project>(PROJECTS_KEY);
  const labels = useNamedItems<Label>(LABELS_KEY);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(TASKS_KEY, []).then((stored) => {
      if (!active) return;
      setTasks(normalizeTasks(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveDocument(TASKS_KEY, tasks);
  }, [loaded, tasks]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, patch: TaskPatch) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task))
    );
  }, []);

  const toggleTask = useCallback((id: string) => {
    const today = dateKey(new Date());
    setTasks((prev) => prev.map((task) => (task.id === id ? toggleTaskCompletion(task, today) : task)));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const removeProject = useCallback(
    (id: string) => {
      projects.remove(id);
      setTasks((prev) => prev.map((task) => (task.projectId === id ? { ...task, projectId: null } : task)));
    },
    [projects.remove]
  );

  const removeLabel = useCallback(
    (id: string) => {
      labels.remove(id);
      setTasks((prev) =>
        prev.map((task) => (task.labelIds.includes(id) ? { ...task, labelIds: task.labelIds.filter((l) => l !== id) } : task))
      );
    },
    [labels.remove]
  );

  return {
    tasks,
    loaded: loaded && projects.loaded && labels.loaded,
    projects: projects.items,
    labels: labels.items,
    addTask,
    updateTask,
    toggleTask,
    removeTask,
    addProject: projects.add,
    renameProject: projects.rename,
    removeProject,
    addLabel: labels.add,
    renameLabel: labels.rename,
    removeLabel,
  };
}
