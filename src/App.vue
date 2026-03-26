<script setup lang="js">
import { onMounted, watch } from "vue";
import { RouterView } from "vue-router";
import AppLayout from "./components/layout/AppLayout.vue";
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/task";

const authStore = useAuthStore();
const taskStore = useTaskStore();

onMounted(async () => {
  authStore.hydrateFromStorage();
});

watch(
  () => authStore.token,
  async (token) => {
    if (!token) {
      taskStore.detachRealtime();
      return;
    }

    taskStore.attachRealtime(authStore.user?.id);

    try {
      await taskStore.fetchTasks();
    } catch {
      // Error state is handled in the store/UI.
    }
  },
  { immediate: true },
);
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<style scoped></style>
