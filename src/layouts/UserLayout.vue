<script setup lang="js">
import { computed, ref } from "vue";
import SidebarUI from "@/components/ui/SidebarUI.vue";

const isSidebarCollapsed = ref(false);

const contentSpacingClass = computed(() => {
  if (isSidebarCollapsed.value) {
    return "pl-20 lg:pl-24";
  }

  return "pl-20 lg:pl-72";
});

const handleSidebarToggle = (collapsed) => {
  isSidebarCollapsed.value = collapsed;
};
</script>
<template>
  <SidebarUI @toggle="handleSidebarToggle" />
  <section
    class="w-full max-w-6xl mx-auto transition-[padding] duration-300"
    :class="contentSpacingClass"
  >
    <slot />
  </section>
</template>
<style scoped></style>
