import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Завантажуємо змінні оточення
  const env = loadEnv(mode, process.cwd(), "");

  // Безпечне отримання змінних (якщо вони відсутні, буде значення за замовчуванням)
  const VITE_API_URL = env.VITE_API_URL;
  const PROD_MODE = env.NODE_ENV === "production";

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
          target: `${VITE_API_URL}`,
          changeOrigin: true, // Допомагає уникнути CORS-проблем
          secure: PROD_MODE, // Автоматично визначаємо, чи вмикати `secure`
        },
      },
    },
  };
});
