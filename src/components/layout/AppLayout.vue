<script setup lang="js">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
</script>

<template>
    <div>
        <main class="grow">
            <slot />
        </main>
    </div>
</template>

<style scoped></style>