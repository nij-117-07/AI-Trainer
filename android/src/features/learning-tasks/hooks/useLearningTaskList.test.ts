// src/features/learning-tasks/hooks/useLearningTaskList.test.ts
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { LearningTask } from "../types";
import { useLearningTaskList } from "./useLearningTaskList";

jest.mock("expo-router", () => {
  const { useEffect } = jest.requireActual("react");
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]) };
});

const mockLoad = jest.fn();
const mockSave = jest.fn();
jest.mock("../lib/store", () => ({
  loadLearningTasks: () => mockLoad(),
  saveLearningTasks: (tasks: LearningTask[]) => mockSave(tasks),
}));

function task(id: string, title: string): LearningTask {
  return {
    id,
    title,
    description: "",
    difficulty: "",
    learningOutcomes: [],
    estimatedHours: null,
    done: false,
    addedAt: "2026-01-01T00:00:00.000Z",
  };
}

async function setup(tasks: LearningTask[]) {
  mockLoad.mockResolvedValue(tasks);
  mockSave.mockResolvedValue(undefined);
  const hook = await renderHook(() => useLearningTaskList());
  await waitFor(() => expect(hook.result.current.loaded).toBe(true));
  return hook;
}

beforeEach(() => {
  mockLoad.mockReset();
  mockSave.mockReset();
});

describe("useLearningTaskList delete with undo", () => {
  it("hides the task at once and does not save until the snackbar dismisses", async () => {
    const { result } = await setup([task("a", "Setup"), task("b", "Routes")]);

    await act(async () => result.current.remove("a"));

    expect(result.current.tasks.map((item) => item.id)).toEqual(["b"]);
    expect(result.current.pending?.title).toBe("Setup");
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("restores the task in its original position on undo", async () => {
    const { result } = await setup([task("a", "Setup"), task("b", "Routes"), task("c", "Tests")]);

    await act(async () => result.current.remove("b"));
    await act(async () => result.current.undo());

    expect(result.current.tasks.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(result.current.pending).toBeNull();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("commits the delete when the snackbar dismisses", async () => {
    const { result } = await setup([task("a", "Setup"), task("b", "Routes")]);

    await act(async () => result.current.remove("a"));
    await act(async () => result.current.dismiss());

    expect(mockSave).toHaveBeenCalledWith([task("b", "Routes")]);
    expect(result.current.tasks.map((item) => item.id)).toEqual(["b"]);
  });

  it("commits the previous pending delete when a new one starts", async () => {
    const { result } = await setup([task("a", "Setup"), task("b", "Routes"), task("c", "Tests")]);

    await act(async () => result.current.remove("a"));
    await act(async () => result.current.remove("c"));

    expect(mockSave).toHaveBeenCalledWith([task("b", "Routes"), task("c", "Tests")]);
    expect(result.current.tasks.map((item) => item.id)).toEqual(["b"]);
    expect(result.current.pending?.id).toBe("c");
  });
});
