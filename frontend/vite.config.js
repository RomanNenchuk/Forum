import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Завантажуємо змінні оточення
  const env = loadEnv(mode, process.cwd(), "");

  // Оголошуємо змінні перед використанням
  const PROTOCOL = env.VITE_PROTOCOL;
  const HOST = env.VITE_HOST;
  const PORT = env.VITE_PORT;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": `${PROTOCOL}://${HOST}:${PORT}`, // Проксі для API-запитів
      },
    },
  };
});
