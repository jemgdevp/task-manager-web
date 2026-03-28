<script setup lang="js">
import { computed, onMounted, ref } from "vue";
import UserLayout from "@/layouts/UserLayout.vue";
import HeaderUI from "@/components/ui/HeaderUI.vue";
import CreateTask from "@/components/modals/CreateTask.vue";
import UpdateTask from "@/components/modals/UpdateTask.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import { useTaskStore } from "@/stores/task";
import { useAuthStore } from "@/stores/auth";

const taskStore = useTaskStore();
const authStore = useAuthStore();

const createModalOpen = ref(false);
const updateModalOpen = ref(false);
const deleteConfirmOpen = ref(false);
const selectedTask = ref(null);
const taskToDelete = ref(null);
const deleteLoading = ref(false);

const isEmptyState = computed(
  () => !taskStore.loading && taskStore.tasks.length === 0,
);
const deleteConfirmMessage = computed(() => {
  const taskTitle = taskToDelete.value?.title ?? "this task";

  return `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`;
});

const loadTasks = async (page = taskStore.pagination.currentPage || 1) => {
  await taskStore.fetchTasks(page);
};

const openCreateModal = () => {
  createModalOpen.value = true;
};

const closeCreateModal = () => {
  createModalOpen.value = false;
};

const openUpdateModal = (task) => {
  selectedTask.value = task;
  updateModalOpen.value = true;
};

const closeUpdateModal = () => {
  selectedTask.value = null;
  updateModalOpen.value = false;
};

const openDeleteConfirm = (task) => {
  taskToDelete.value = task;
  deleteConfirmOpen.value = true;
};

const closeDeleteConfirm = () => {
  deleteConfirmOpen.value = false;
  taskToDelete.value = null;
};

const removeTask = async () => {
  if (!taskToDelete.value?.id) {
    closeDeleteConfirm();
    return;
  }

  deleteLoading.value = true;

  try {
    await taskStore.deleteTask(taskToDelete.value.id);
    closeDeleteConfirm();
  } finally {
    deleteLoading.value = false;
  }
};

const toggleTaskStatus = async (task) => {
  const nextStatus = task.status === "done" ? "pending" : "done";

  await taskStore.updateTask(task.id, {
    status: nextStatus,
  });
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    taskStore.attachRealtime(authStore.user?.id);
  }

  await loadTasks();
});
</script>

<template>
  <UserLayout>
    <HeaderUI
      title="My Tasks"
      subtitle="Create, update and track your tasks. Changes sync in realtime when Reverb events are available."
    />

    <div class="flex flex-wrap gap-3 justify-between items-center mb-4">
      <div class="badge badge-outline">
        Total: {{ taskStore.pagination.total }}
      </div>
      <button class="btn btn-primary" type="button" @click="openCreateModal">
        New Task
      </button>
    </div>

    <div v-if="taskStore.error" class="alert alert-error mb-4">
      <span>{{ taskStore.error }}</span>
    </div>

    <div v-if="taskStore.loading" class="flex justify-center py-10">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <div v-else-if="isEmptyState" class="alert alert-info">
      <span>No tasks yet. Create your first task 🚀</span>
    </div>

    <div v-else class="grid gap-3">
      <article
        v-for="task in taskStore.tasks"
        :key="task.id"
        class="card bg-base-100 border border-base-300"
      >
        <div class="card-body">
          <div class="flex justify-between gap-2 items-start">
            <div>
              <h3 class="card-title">{{ task.title }}</h3>
              <p class="opacity-75 mt-1">
                {{ task.description || "No description" }}
              </p>
            </div>
            <span
              class="badge"
              :class="{
                'badge-success': task.status === 'done',
                'badge-warning': task.status === 'in_progress',
                'badge-ghost': task.status === 'pending',
              }"
            >
              {{ task.status }}
            </span>
          </div>

          <div class="text-xs opacity-70" v-if="task.due_date">
            Due: {{ String(task.due_date).slice(0, 10) }}
          </div>

          <div class="card-actions justify-end mt-2">
            <button
              class="btn btn-sm btn-outline"
              type="button"
              @click="toggleTaskStatus(task)"
            >
              {{ task.status === "done" ? "Reopen" : "Mark done" }}
            </button>
            <button
              class="btn btn-sm btn-outline"
              type="button"
              @click="openUpdateModal(task)"
            >
              Edit
            </button>
            <button
              class="btn btn-sm btn-error btn-outline"
              type="button"
              @click="openDeleteConfirm(task)"
            >
              Delete
            </button>
          </div>
        </div>
      </article>
    </div>

    <div class="join mt-6" v-if="taskStore.pagination.lastPage > 1">
      <button
        class="join-item btn"
        type="button"
        :disabled="taskStore.pagination.currentPage <= 1"
        @click="loadTasks(taskStore.pagination.currentPage - 1)"
      >
        Prev
      </button>
      <button class="join-item btn btn-disabled" type="button">
        Page {{ taskStore.pagination.currentPage }} /
        {{ taskStore.pagination.lastPage }}
      </button>
      <button
        class="join-item btn"
        type="button"
        :disabled="
          taskStore.pagination.currentPage >= taskStore.pagination.lastPage
        "
        @click="loadTasks(taskStore.pagination.currentPage + 1)"
      >
        Next
      </button>
    </div>

    <CreateTask
      :open="createModalOpen"
      @close="closeCreateModal"
      @saved="loadTasks"
    />
    <UpdateTask
      :open="updateModalOpen"
      :task="selectedTask"
      @close="closeUpdateModal"
      @saved="loadTasks"
    />

    <ConfirmModal
      :open="deleteConfirmOpen"
      title="Delete task"
      :message="deleteConfirmMessage"
      confirm-text="Delete"
      confirm-button-class="btn-error"
      :loading="deleteLoading"
      @cancel="closeDeleteConfirm"
      @confirm="removeTask"
    />
  </UserLayout>
</template>

<style scoped></style>
