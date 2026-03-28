<script setup lang="js">
import { ref } from "vue";
import { useRouter } from "vue-router";
import HeaderUI from "@/components/ui/HeaderUI.vue";
import AuthModal from "@/components/modals/AuthModal.vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const apiUrl = import.meta.env.VITE_API_URL;

const authModalOpen = ref(false);

const openAuthModal = () => {
  authModalOpen.value = true;
};

const closeAuthModal = () => {
  authModalOpen.value = false;
};

const handleAuthenticated = (authResult) => {
  if (authResult?.needsEmailVerification) {
    router.push({
      name: "auth.verify-email",
      query: { status: "pending" },
    });

    return;
  }

  goToTasks();
};

const goToTasks = () => {
  router.push({ name: "tasks.index" });
};

const redirectToDocs = () => {
  window.open(`${apiUrl}/docs`, "_blank");
};
</script>

<template>
  <section
    class="hero min-h-[70vh] rounded-box bg-base-200 border border-base-300"
  >
    <div class="hero-content text-center">
      <div class="max-w-2xl">
        <HeaderUI
          title="Task Manager"
          subtitle="Organiza tu trabajo, sincroniza en tiempo real con Reverb y enfócate en cerrar tareas."
        />
        <p class="py-3 opacity-80">
          API-first con Laravel + Vue 3, autenticación con Sanctum token y
          realtime por canales Echo.
        </p>

        <div class="flex items-center justify-center gap-3 mt-4">
          <button
            v-if="!authStore.isAuthenticated"
            class="btn btn-primary"
            type="button"
            @click="openAuthModal"
          >
            Login / Register
          </button>

          <button
            v-else
            class="btn btn-primary"
            type="button"
            @click="goToTasks"
          >
            Go to Tasks
          </button>

          <button class="btn btn-ghost" type="button" @click="redirectToDocs">
            See API documentation
          </button>
        </div>
      </div>
    </div>
  </section>

  <AuthModal
    :open="authModalOpen"
    @close="closeAuthModal"
    @authenticated="handleAuthenticated"
  />

  <div class="mt-6 grid md:grid-cols-3 gap-3">
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body">
        <h3 class="card-title">Auth</h3>
        <p>Login/Register con persistencia de token y guardas de ruta.</p>
      </div>
    </div>
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body">
        <h3 class="card-title">CRUD</h3>
        <p>
          Gestión de tareas con estados, fecha de vencimiento y edición rápida.
        </p>
      </div>
    </div>
    <div class="card bg-base-100 border border-base-300">
      <div class="card-body">
        <h3 class="card-title">Realtime</h3>
        <p>
          Escucha de eventos de tareas en vivo usando Laravel Echo + Reverb.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
