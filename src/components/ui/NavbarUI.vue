<script setup lang="js">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import { useAuthStore } from "@/stores/auth";
import { useTaskStore } from "@/stores/task";

const router = useRouter();
const authStore = useAuthStore();
const taskStore = useTaskStore();

const userLabel = computed(
  () => authStore.user?.name ?? authStore.user?.email ?? "User",
);
const logoutConfirmOpen = ref(false);
const logoutLoading = ref(false);

const openLogoutConfirm = () => {
  logoutConfirmOpen.value = true;
};

const closeLogoutConfirm = () => {
  logoutConfirmOpen.value = false;
};

const confirmLogout = async () => {
  logoutLoading.value = true;

  try {
    await authStore.logout();
    taskStore.detachRealtime();
    closeLogoutConfirm();
    router.push({ name: "guest.home" });
  } finally {
    logoutLoading.value = false;
  }
};
</script>
<template>
  <div
    class="navbar bg-base-100/90 backdrop-blur border-b border-base-300 shadow-sm px-2 md:px-4"
  >
    <div class="navbar-start">
      <RouterLink
        class="btn btn-ghost text-xl font-conthrax tracking-wide"
        :to="{ name: 'guest.home' }"
      >
        TaskManager
      </RouterLink>
    </div>

    <div class="navbar-end ml-auto gap-2">
      <ThemeSwitcher compact />
      <template v-if="authStore.isAuthenticated">
        <span class="hidden md:inline text-sm opacity-70 truncate max-w-40">{{
          userLabel
        }}</span>
        <button
          class="btn btn-sm btn-error btn-outline"
          type="button"
          @click="openLogoutConfirm"
        >
          Logout
        </button>
      </template>
    </div>

    <ConfirmModal
      :open="logoutConfirmOpen"
      title="Close session"
      message="Are you sure you want to logout?"
      confirm-text="Logout"
      confirm-button-class="btn-error"
      :loading="logoutLoading"
      @cancel="closeLogoutConfirm"
      @confirm="confirmLogout"
    />
  </div>
</template>
<style scoped></style>
