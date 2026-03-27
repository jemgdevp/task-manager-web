/**
 * Styles
 */
import "./styles/main.css";
/**
 * Scripts
 */
import { createApp } from "vue";
import { createPinia } from "pinia";
// Echo client setup
import "./plugins/echo";

/**
 * Imports
 */
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
