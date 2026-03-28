<script setup lang="js">
const fullYear = new Date().getFullYear();

</script>
<template>
  <footer class="footer footer-center p-4 bg-base-200 text-base-content border-t border-base-300">
    <aside>
      <p>
        © {{ fullYear }} TaskManager Web · Built with Vue 3 + Laravel 12
      </p>
    </aside>
  </footer>
</template>
<style scoped></style>
