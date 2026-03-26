<script setup lang="js">
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <header class="mb-6">
    <h1 class="text-3xl md:text-4xl font-conthrax">{{ title }}</h1>
    <p v-if="subtitle" class="opacity-75 mt-2">{{ subtitle }}</p>
  </header>
</template>
<style scoped></style>
