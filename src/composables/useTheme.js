/**
 * @file src/composables/useTheme.js
 * @description This file defines the theme composable for managing the application's theme state.
 * @author jemgdevp
 * @date 2026-03-26
 */

import { ref, watch } from "vue";

const DEFAULT_THEME = "light";

// localStorage key for theme preference
const THEME_KEY = "theme";

export function useTheme() {
  const theme = ref(localStorage.getItem(THEME_KEY) || DEFAULT_THEME);

  // Watch for changes in the theme and update localStorage
  watch(
    theme,
    (newTheme) => {
      localStorage.setItem(THEME_KEY, newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    },
    { immediate: true },
  );

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
  };

  return {
    theme,
    toggleTheme,
  };
}
