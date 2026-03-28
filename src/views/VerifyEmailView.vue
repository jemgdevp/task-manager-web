<script setup lang="js">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import HeaderUI from "@/components/ui/HeaderUI.vue";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
let verificationPollTimer = null;

const status = computed(() => String(route.query.status ?? "pending"));

const statusConfig = computed(() => {
  switch (status.value) {
    case "verified":
      return {
        title: "Email verified successfully",
        message:
          "Your account is now verified. You can continue to your dashboard.",
        alertClass: "alert-success",
      };

    case "already-verified":
      return {
        title: "Email already verified",
        message: "This account has already completed email verification.",
        alertClass: "alert-info",
      };

    case "invalid":
    case "expired":
      return {
        title: "Verification link is invalid or expired",
        message:
          "The link can no longer be used. Request a new verification email to continue.",
        alertClass: "alert-error",
      };

    default:
      return {
        title: "Verify your email",
        message:
          "We sent you a verification link. Please check your inbox and spam folder.",
        alertClass: "alert-warning",
      };
  }
});

const canResend = computed(() => authStore.isAuthenticated);

const goToDashboard = () => {
  router.replace({ name: "tasks.index" });
};

const syncVerificationStatus = async () => {
  if (!authStore.isAuthenticated) {
    return;
  }

  try {
    const user = await authStore.refreshCurrentUser();

    if (user?.email_verified) {
      authStore.setUserEmailVerified(true);
      goToDashboard();
    }
  } catch (error) {
    if (error?.status === 401) {
      router.replace({ name: "guest.home" });
    }
  }
};

const resendVerification = async () => {
  if (!canResend.value) {
    router.push({ name: "guest.home" });
    return;
  }

  try {
    await authStore.resendVerificationEmail();
  } catch {
    // Handled through authStore notice.
  }
};

onMounted(() => {
  if (status.value === "verified" || status.value === "already-verified") {
    authStore.setUserEmailVerified(true);
    goToDashboard();
    return;
  }

  void syncVerificationStatus();

  if (authStore.isAuthenticated) {
    verificationPollTimer = window.setInterval(() => {
      void syncVerificationStatus();
    }, 8000);
  }
});

onBeforeUnmount(() => {
  if (verificationPollTimer) {
    window.clearInterval(verificationPollTimer);
    verificationPollTimer = null;
  }
});
</script>

<template>
  <section class="max-w-2xl mx-auto">
    <HeaderUI
      title="Email Verification"
      subtitle="Use this page to confirm your account status and request a new verification link when needed."
    />

    <div class="card bg-base-100 border border-base-300 shadow-sm">
      <div class="card-body">
        <div class="alert" :class="statusConfig.alertClass">
          <div>
            <p class="font-semibold">{{ statusConfig.title }}</p>
            <p class="text-sm mt-1">{{ statusConfig.message }}</p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="btn btn-primary"
            type="button"
            :disabled="authStore.verificationLoading"
            @click="resendVerification"
          >
            <span
              v-if="authStore.verificationLoading"
              class="loading loading-spinner loading-xs"
            />
            Resend verification email
          </button>

          <button
            v-if="authStore.isAuthenticated"
            class="btn btn-ghost"
            type="button"
            @click="syncVerificationStatus"
          >
            Check status now
          </button>

          <RouterLink
            v-if="authStore.isAuthenticated"
            class="btn btn-outline"
            :to="{ name: 'tasks.index' }"
          >
            Go to dashboard
          </RouterLink>

          <RouterLink
            v-else
            class="btn btn-outline"
            :to="{ name: 'guest.home' }"
          >
            Go to login
          </RouterLink>
        </div>

        <p v-if="!canResend" class="text-sm opacity-70 mt-3">
          You need an active session to request a new verification email.
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
