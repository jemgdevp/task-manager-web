import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";

vi.mock("@/plugins/axios", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/plugins/axios";
import { useTaskStore } from "./task";

describe("task store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("fetches paginated tasks and normalizes pagination", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: [{ id: 1, title: "Task 1", status: "pending" }],
        current_page: 2,
        per_page: 15,
        total: 21,
        last_page: 2,
      },
    });

    const taskStore = useTaskStore();
    await taskStore.fetchTasks(2);

    expect(api.get).toHaveBeenCalledWith("/api/tasks", { params: { page: 2 } });
    expect(taskStore.tasks).toHaveLength(1);
    expect(taskStore.tasks[0]).toMatchObject({
      id: 1,
      title: "Task 1",
      status: "pending",
    });
    expect(taskStore.pagination).toMatchObject({
      currentPage: 2,
      total: 21,
      lastPage: 2,
    });
  });

  it("creates a task from { data } API response", async () => {
    api.post.mockResolvedValueOnce({
      data: {
        message: "Task created successfully",
        data: { id: 9, title: "Created", status: "pending" },
      },
    });

    const taskStore = useTaskStore();
    await taskStore.createTask({ title: "Created" });

    expect(taskStore.tasks[0]).toMatchObject({ id: 9, title: "Created" });
  });

  it("updates and deletes tasks in state", async () => {
    const taskStore = useTaskStore();
    taskStore.tasks = [{ id: 1, title: "Original", status: "pending" }];

    api.put.mockResolvedValueOnce({
      data: {
        data: { id: 1, title: "Updated", status: "done" },
      },
    });

    await taskStore.updateTask(1, { status: "done" });

    expect(taskStore.tasks[0]).toMatchObject({
      id: 1,
      title: "Updated",
      status: "done",
    });

    api.delete.mockResolvedValueOnce({ data: { message: "Task deleted" } });

    await taskStore.deleteTask(1);

    expect(taskStore.tasks).toHaveLength(0);
  });

  it("attaches and detaches realtime channels", () => {
    const publicChannel = { listen: vi.fn().mockReturnThis() };
    const privateChannel = { listen: vi.fn().mockReturnThis() };

    globalThis.window = globalThis.window ?? {};
    globalThis.window.Echo = {
      channel: vi.fn().mockReturnValue(publicChannel),
      private: vi.fn().mockReturnValue(privateChannel),
      leave: vi.fn(),
    };

    const taskStore = useTaskStore();
    taskStore.attachRealtime(7);

    expect(globalThis.window.Echo.channel).toHaveBeenCalledWith("tasks");
    expect(globalThis.window.Echo.private).toHaveBeenCalledWith("user.7.tasks");

    taskStore.detachRealtime();

    expect(globalThis.window.Echo.leave).toHaveBeenCalledWith("tasks");
    expect(globalThis.window.Echo.leave).toHaveBeenCalledWith("user.7.tasks");
  });
});
