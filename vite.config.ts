import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// GitHub Pages project site: https://chargemod-cmd.github.io/safconventioncenter/
const base = process.env.VITE_BASE_PATH ?? "/safconventioncenter/";

export default defineConfig({
  base,
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    host: "::",
    port: 8080,
    strictPort: true,
  },
});
