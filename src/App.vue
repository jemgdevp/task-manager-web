<script setup lang="js">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { AppLayout } from './components/layout/AppLayout.vue';
</script>

<template>
  <AppLayout>
      <RouterView />
  </AppLayout> 
</template>

<style></style>