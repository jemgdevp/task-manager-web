<script setup lang="js">
import { computed } from "vue";
import { useRouter } from "vue-router";
import NavbarUI from "@/components/ui/NavbarUI.vue";
import FooterUI from "@/components/ui/FooterUI.vue";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const verificationAlertClass = computed(() => {
  if (authStore.verificationNoticeType === "error") {
    return "alert-error";
  }

  if (authStore.verificationNoticeType === "success") {
    return "alert-success";
  }

  return "alert-info";
});

const resendVerification = async () => {
  try {
    await authStore.resendVerificationEmail();
  } catch {
    // The store handles displaying a user-facing message.
  }
};

const openVerifyPage = () => {
  router.push({
    name: "auth.verify-email",
    query: { status: authStore.isEmailVerified ? "already-verified" : "pending" },
  });
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-base-100 text-base-content">
    <NavbarUI />

    <div v-if="authStore.needsEmailVerification" class="container mx-auto px-4 pt-4 w-full">
      <div class="alert alert-warning border border-warning/40">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div>
            <p class="font-semibold">Verify your email</p>
            <p class="text-sm opacity-85">
              Your account is active, but you need to verify your email to complete onboarding.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              class="btn btn-sm btn-outline"
              type="button"
              :disabled="authStore.verificationLoading"
              @click="openVerifyPage"
            >
              Verification status
            </button>
            <button
              class="btn btn-sm btn-warning"
              type="button"
              :disabled="authStore.verificationLoading"
              @click="resendVerification"
            >
              <span v-if="authStore.verificationLoading" class="loading loading-spinner loading-xs" />
              Resend email
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="authStore.verificationNotice"
      class="container mx-auto px-4 pt-3 w-full"
    >
      <div class="alert" :class="verificationAlertClass">
        <span>{{ authStore.verificationNotice }}</span>
        <button class="btn btn-xs btn-ghost" type="button" @click="authStore.clearVerificationNotice">
          Dismiss
        </button>
      </div>
    </div>

    <main class="grow container mx-auto px-4 py-6 w-full">
      <slot />
    </main>
    <FooterUI />
  </div>
</template>

<style scoped></style>
