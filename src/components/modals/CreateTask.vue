<script setup lang="js">
import { reactive } from "vue";
import { useTaskStore } from "@/stores/task";

// Props
const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "saved"]);
const taskStore = useTaskStore();

const form = reactive({
  title: "",
  description: "",
  status: "pending",
  due_date: "",
});

const resetForm = () => {
  form.title = "";
  form.description = "";
  form.status = "pending";
  form.due_date = "";
};

const closeModal = () => {
  taskStore.error = null;
  emit("close");
};

const submit = async () => {
  try {
    const payload = {
      title: form.title,
      description: form.description,
      status: form.status,
      due_date: form.due_date || null,
    };

    const createdTask = await taskStore.createTask(payload);

    emit("saved", createdTask);
    resetForm();
    closeModal();
  } catch {
    // Managed by the store, so no need to do anything here.
  }
};
</script>

<template>
  <div v-if="props.open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/40" @click="closeModal" />

    <div class="absolute inset-0 flex items-center justify-center p-4">
      <div class="card bg-base-100 w-full max-w-lg shadow-xl border border-base-300">
        <div class="card-body">
          <h3 class="card-title">Create task</h3>

          <form class="space-y-3" @submit.prevent="submit">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Title</legend>
              <input v-model="form.title" class="input input-bordered w-full" required />
            </fieldset>

            <fieldset class="fieldset">
              <legend class="fieldset-legend">Description</legend>
              <textarea
                v-model="form.description"
                class="textarea textarea-bordered w-full"
                rows="3"
              />
            </fieldset>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">Status</legend>
                <select v-model="form.status" class="select select-bordered w-full">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </fieldset>

              <fieldset class="fieldset">
                <legend class="fieldset-legend">Due date</legend>
                <input v-model="form.due_date" class="input input-bordered w-full" type="date" />
              </fieldset>
            </div>

            <div v-if="taskStore.error" class="alert alert-error text-sm">
              <span>{{ taskStore.error }}</span>
            </div>

            <div class="card-actions justify-end">
              <button class="btn btn-ghost" type="button" @click="closeModal">Cancel</button>
              <button class="btn btn-primary" :disabled="taskStore.loading" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
