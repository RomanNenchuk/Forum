import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Завантажуємо змінні оточення
  const env = loadEnv(mode, process.cwd(), "");

  // Безпечне отримання змінних (якщо вони відсутні, буде значення за замовчуванням)
  const PROTOCOL = env.VITE_PROTOCOL || "http";
  const HOST = env.VITE_HOST || "localhost";
  const PORT = env.VITE_PORT || "3000";

  return {
    plugins: [react()],

    build: {
      minify: "esbuild", // Швидша мініфікація
      chunkSizeWarningLimit: 1000, // Прибираємо зайві попередження, якщо не критично
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor"; // Відокремлюємо бібліотеки в окремий файл
            }
          },
        },
      },
    },

    server: {
      proxy: {
        "/api": {
          target: `${PROTOCOL}://${HOST}:${PORT}`,
          changeOrigin: true, // Допомагає уникнути CORS-проблем
          secure: PROTOCOL === "https", // Автоматично визначаємо, чи вмикати `secure`
        },
      },
    },
  };
});
