<script setup lang="js">
import { computed, reactive, ref } from "vue";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "authenticated"]);

const authStore = useAuthStore();
const mode = ref("login");

const form = reactive({
  name: "",
  email: "",
  password: "",
  passwordConfirmation: "",
});

const isRegisterMode = computed(() => mode.value === "register");

const resetForm = () => {
  form.name = "";
  form.email = "";
  form.password = "";
  form.passwordConfirmation = "";
};

const switchMode = (targetMode) => {
  mode.value = targetMode;
  authStore.error = null;
  resetForm();
};

const closeModal = () => {
  authStore.error = null;
  emit("close");
};

const submit = async () => {
  try {
    let authResult = null;

    if (isRegisterMode.value) {
      authResult = await authStore.register(
        form.name,
        form.email,
        form.password,
        form.passwordConfirmation,
      );
    } else {
      authResult = await authStore.login(form.email, form.password);
    }

    emit("authenticated", authResult);
    closeModal();
  } catch {
    // Handled through authStore.error message.
  }
};
</script>
<template>
  <div v-if="props.open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="closeModal" />

    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="card bg-base-100 w-full max-w-md shadow-xl border border-base-300">
        <div class="card-body">
          <div class="tabs tabs-box mb-2">
            <button
              class="tab"
              :class="{ 'tab-active': !isRegisterMode }"
              type="button"
              @click="switchMode('login')"
            >
              Login
            </button>
            <button
              class="tab"
              :class="{ 'tab-active': isRegisterMode }"
              type="button"
              @click="switchMode('register')"
            >
              Register
            </button>
          </div>

          <form class="space-y-3" @submit.prevent="submit">
            <fieldset v-if="isRegisterMode" class="fieldset">
              <legend class="fieldset-legend">Name</legend>
              <input v-model="form.name" class="input input-bordered w-full" required autocomplete="name" placeholder="name" />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Email Address</legend>
              <input
                v-model="form.email"
                type="email"
                class="input input-bordered w-full"
                required
                autocomplete="email"
                placeholder="email"
              />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Password</legend>
              <input
                v-model="form.password"
                type="password"
                class="input input-bordered w-full"
                required
                minlength="8"
                placeholder="password"
                autocomplete="current-password"
              />
            </fieldset>

            <fieldset v-if="isRegisterMode" class="fieldset">
              <legend class="fieldset-legend">Confirm Password</legend>
              <input
                v-model="form.passwordConfirmation"
                type="password"
                class="input input-bordered w-full"
                required
                minlength="8"
                placeholder="confirm password"
                autocomplete="new-password"
              />
            </fieldset>

            <div v-if="authStore.error" class="alert alert-error text-sm">
              <span>{{ authStore.error }}</span>
            </div>

            <div class="card-actions justify-end pt-2">
              <button class="btn btn-ghost" type="button" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" type="submit" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="loading loading-spinner loading-xs" />
                {{ isRegisterMode ? 'Create account' : 'Login' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
