/**
 * @file src/stores/task.js
 * @description This file defines the task store using Pinia. It manages the user's task state, including creating, updating, and deleting tasks.
 * @author jemgdevp
 * @date 2026-03-26
 */

import { defineStore } from "pinia";
import { api } from "@/plugins/axios";

const DEFAULT_PAGINATION = {
  currentPage: 1,
  perPage: 15,
  total: 0,
  lastPage: 1,
};

export const useTaskStore = defineStore("task", {
  state: () => ({
    tasks: [],
    pagination: { ...DEFAULT_PAGINATION },
    loading: false,
    error: null,
    publicChannelName: null,
    privateChannelName: null,
  }),
  actions: {
    normalizeTask(task) {
      if (!task || typeof task !== "object") {
        return null;
      }

      return {
        id: task.id,
        title: task.title ?? "",
        description: task.description ?? "",
        status: task.status ?? "pending",
        due_date: task.due_date ?? null,
        tags: Array.isArray(task.tags) ? task.tags : [],
        user_id: task.user_id ?? null,
        created_at: task.created_at ?? null,
        updated_at: task.updated_at ?? null,
      };
    },
    applyPaginationPayload(payload) {
      this.pagination = {
        currentPage: payload?.current_page ?? DEFAULT_PAGINATION.currentPage,
        perPage: payload?.per_page ?? DEFAULT_PAGINATION.perPage,
        total: payload?.total ?? DEFAULT_PAGINATION.total,
        lastPage: payload?.last_page ?? DEFAULT_PAGINATION.lastPage,
      };
    },
    upsertTask(task) {
      const normalizedTask = this.normalizeTask(task);

      if (!normalizedTask?.id) {
        return;
      }

      const currentTaskIndex = this.tasks.findIndex(
        (existingTask) => existingTask.id === normalizedTask.id,
      );

      if (currentTaskIndex === -1) {
        this.tasks.unshift(normalizedTask);
        return;
      }

      this.tasks[currentTaskIndex] = {
        ...this.tasks[currentTaskIndex],
        ...normalizedTask,
      };
    },
    removeTask(taskId) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId);
    },
    extractTaskPayload(payload) {
      return payload?.task ?? payload?.data ?? payload;
    },
    async fetchTasks(page = 1) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.get("/api/tasks", {
          params: { page },
        });

        const payload = response.data ?? {};
        const collection = Array.isArray(payload?.data) ? payload.data : [];

        this.tasks = collection
          .map((task) => this.normalizeTask(task))
          .filter(Boolean);

        this.applyPaginationPayload(payload);
      } catch (error) {
        this.error = error?.message ?? "Failed to fetch tasks.";
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async createTask(taskPayload) {
      this.error = null;

      try {
        const response = await api.post("/api/tasks", taskPayload);
        const createdTask = this.extractTaskPayload(response.data);

        this.upsertTask(createdTask);

        return createdTask;
      } catch (error) {
        this.error = error?.message ?? "Failed to create task.";
        throw error;
      }
    },
    async updateTask(id, taskPayload) {
      this.error = null;

      try {
        const response = await api.put(`/api/tasks/${id}`, taskPayload);
        const updatedTask = this.extractTaskPayload(response.data);

        this.upsertTask(updatedTask);

        return updatedTask;
      } catch (error) {
        this.error = error?.message ?? "Failed to update task.";
        throw error;
      }
    },
    async deleteTask(id) {
      this.error = null;

      try {
        await api.delete(`/api/tasks/${id}`);
        this.removeTask(id);
      } catch (error) {
        this.error = error?.message ?? "Failed to delete task.";
        throw error;
      }
    },
    attachRealtime(userId) {
      if (!window.Echo) {
        return;
      }

      this.detachRealtime();

      const publicChannelName =
        import.meta.env.VITE_REVERB_TASKS_CHANNEL ?? "tasks";

      this.publicChannelName = publicChannelName;

      window.Echo.channel(publicChannelName)
        .listen("TaskCreated", (payload) => {
          this.upsertTask(this.extractTaskPayload(payload));
        })
        .listen("TaskUpdated", (payload) => {
          this.upsertTask(this.extractTaskPayload(payload));
        })
        .listen("TaskDeleted", (payload) => {
          const taskId = payload?.task_id ?? payload?.id ?? payload?.task?.id;

          if (taskId) {
            this.removeTask(taskId);
          }
        });

      if (userId) {
        const privateChannelName = `user.${userId}.tasks`;

        this.privateChannelName = privateChannelName;

        window.Echo.private(privateChannelName)
          .listen("TaskCreated", (payload) => {
            this.upsertTask(this.extractTaskPayload(payload));
          })
          .listen("TaskUpdated", (payload) => {
            this.upsertTask(this.extractTaskPayload(payload));
          })
          .listen("TaskDeleted", (payload) => {
            const taskId = payload?.task_id ?? payload?.id ?? payload?.task?.id;

            if (taskId) {
              this.removeTask(taskId);
            }
          });
      }
    },
    detachRealtime() {
      if (!window.Echo) {
        return;
      }

      if (this.publicChannelName) {
        window.Echo.leave(this.publicChannelName);
      }

      if (this.privateChannelName) {
        window.Echo.leave(this.privateChannelName);
      }

      this.publicChannelName = null;
      this.privateChannelName = null;
    },
  },
});
