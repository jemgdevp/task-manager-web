import Echo from "laravel-echo";
import { api } from "@/plugins/axios";

import Pusher from "pusher-js";
window.Pusher = Pusher;

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "";
const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost = import.meta.env.VITE_REVERB_HOST;
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? "https";
const fallbackPort = reverbScheme === "https" ? 443 : 80;
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT ?? fallbackPort);
const authEndpoint = apiBaseUrl
  ? `${apiBaseUrl}/api/broadcasting/auth`
  : "/api/broadcasting/auth";

const authorizer = (channel) => ({
  authorize(socketId, callback) {
    api
      .post("/api/broadcasting/auth", {
        socket_id: socketId,
        channel_name: channel.name,
      })
      .then((response) => {
        callback(false, response.data);
      })
      .catch((error) => {
        callback(true, error);
      });
  },
});

if (reverbKey && reverbHost) {
  try {
    window.Echo = new Echo({
      broadcaster: "reverb",
      key: reverbKey,
      wsHost: reverbHost,
      wsPort: reverbPort,
      wssPort: reverbPort,
      forceTLS: reverbScheme === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint,
      authorizer,
    });
  } catch {
    window.Echo = null;
  }
} else {
  window.Echo = null;
}
