<script setup lang="js">
import { computed } from "vue";
import { useTheme } from "@/composables/useTheme";

const emit = defineEmits(["change"]);

// Props
defineProps({
  showLabel: {
    type: Boolean,
    default: false,
  },
  showText: {
    type: Boolean,
    default: false,
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
  compact: {
    type: Boolean,
    default: false,
  },
  centered: {
    type: Boolean,
    default: false,
  },
  vertical: {
    type: Boolean,
    default: false,
  },
});

const { theme, toggleTheme } = useTheme();

const icon = computed(() => (theme.value === "dark" ? "🌙" : "☀️"));
const label = computed(() => (theme.value === "dark" ? "Dark" : "Light"));

const handleToggle = () => {
  toggleTheme();
  emit("change", theme.value);
};
</script>
<template>
  <div
    v-if="!compact"
    class="flex items-center gap-2"
    :class="{
      'justify-center': centered,
      'flex-col': vertical,
    }"
  >
    <span v-if="showLabel" class="text-xs opacity-70">Theme</span>
    <button class="btn btn-sm btn-ghost" type="button" @click="handleToggle">
      <span>{{ icon }}</span>
      <span v-if="showText">{{ label }}</span>
    </button>
    <span v-if="showStatus" class="badge badge-outline badge-xs">
      {{ label }}
    </span>
  </div>

  <div v-if="compact">
    <button class="btn btn-xs btn-ghost" type="button" @click="handleToggle">
      {{ icon }}
    </button>
  </div>
</template>
<style scoped></style>
