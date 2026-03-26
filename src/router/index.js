import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import TaskIndex from "@/views/tasks/Index.vue";
import VerifyEmailView from "@/views/VerifyEmailView.vue";
import { AUTH_TOKEN_KEY } from "@/plugins/axios";

const AUTH_USER_KEY = "auth_user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "guest.home",
      component: HomeView,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: "/tasks",
      name: "tasks.index",
      component: TaskIndex,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: "/verify-email",
      name: "auth.verify-email",
      component: VerifyEmailView,
    },
  ],
});

router.beforeEach((to) => {
  const hasToken = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  const storedUser = localStorage.getItem(AUTH_USER_KEY);
  let parsedUser = null;

  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch {
      parsedUser = null;
    }
  }

  const isEmailVerified = Boolean(parsedUser?.email_verified);

  if (to.meta?.requiresAuth && !hasToken) {
    return { name: "guest.home" };
  }

  if (to.meta?.guestOnly && hasToken) {
    if (!isEmailVerified) {
      return {
        name: "auth.verify-email",
        query: { status: "pending" },
      };
    }

    return { name: "tasks.index" };
  }

  return true;
});

export default router;
