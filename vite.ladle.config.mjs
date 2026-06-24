import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Vite config merged into Ladle's. The only addition is the Tailwind v4 plugin;
// Ladle still injects its own React plugin and story handling on top.
export default defineConfig({
  plugins: [tailwindcss()],
});
