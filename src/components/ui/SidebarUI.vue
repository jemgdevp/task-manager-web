<script setup lang="js">
import { onMounted, ref } from "vue";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings,
  User,
} from "@lucide/vue";

const emit = defineEmits(["toggle"]);

const isCollapsed = ref(false);
const selectedItem = ref("settings");

const sidebarItems = [
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
  {
    id: "changelog",
    label: "Changelog",
    icon: FileText,
  },
  {
    id: "profile",
    label: "Profile",
    icon: User,
  },
];

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
  emit("toggle", isCollapsed.value);
};

const selectItem = (itemId) => {
  selectedItem.value = itemId;
};

onMounted(() => {
  const mobileScreen = window.matchMedia("(max-width: 1023px)").matches;

  if (mobileScreen) {
    isCollapsed.value = true;
  }

  emit("toggle", isCollapsed.value);
});
</script>

<template>
  <aside class="fixed left-3 md:left-5 top-1/2 -translate-y-1/2 z-40">
    <div
      class="rounded-box border border-base-300 bg-base-200/95 backdrop-blur shadow-xl transition-[width] duration-300"
      :class="isCollapsed ? 'w-16' : 'w-64'"
    >
      <div
        class="flex items-center gap-2 border-b border-base-300/80 p-2.5"
        :class="isCollapsed ? 'justify-center' : 'justify-between'"
      >
        <span v-if="!isCollapsed" class="text-sm font-semibold opacity-80">
          Quick panel
        </span>

        <button
          class="btn btn-ghost btn-sm btn-circle"
          type="button"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="toggleSidebar"
        >
          <component :is="isCollapsed ? ChevronRight : ChevronLeft" class="h-4 w-4" />
        </button>
      </div>

      <ul class="menu menu-sm p-2 gap-1">
        <li
          v-for="item in sidebarItems"
          :key="item.id"
          :class="{ tooltip: isCollapsed, 'tooltip-right': isCollapsed }"
          :data-tip="isCollapsed ? item.label : undefined"
        >
          <button
            class="w-full"
            :class="[
              isCollapsed ? 'justify-center' : 'justify-start gap-3',
              selectedItem === item.id ? 'active' : '',
            ]"
            type="button"
            @click="selectItem(item.id)"
          >
            <component :is="item.icon" class="h-4 w-4 shrink-0" />
            <span v-if="!isCollapsed">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped></style>
