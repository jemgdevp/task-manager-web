<script setup lang="js">
// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "Are you sure?",
  },
  message: {
    type: String,
    default: "This action cannot be undone.",
  },
  confirmText: {
    type: String,
    default: "Confirm",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  confirmButtonClass: {
    type: String,
    default: "btn-error",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const onBackdropClick = () => {
  if (!props.closeOnBackdrop || props.loading) {
    return;
  }

  emit("cancel");
};
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-black/40" @click="onBackdropClick" />

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <div
          class="card bg-base-100 w-full max-w-md shadow-xl border border-base-300"
        >
          <div class="card-body">
            <h2 class="text-xl font-bold mb-2">{{ title }}</h2>
            <p class="mb-6 opacity-80">{{ message }}</p>
            <div class="flex justify-end gap-3">
              <button
                class="btn btn-ghost"
                :disabled="loading"
                type="button"
                @click="$emit('cancel')"
              >
                {{ cancelText }}
              </button>
              <button
                class="btn"
                :class="confirmButtonClass"
                :disabled="loading"
                type="button"
                @click="$emit('confirm')"
              >
                <span
                  v-if="loading"
                  class="loading loading-spinner loading-xs"
                />
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped></style>
