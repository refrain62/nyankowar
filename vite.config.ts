import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	base: "./", // GitHub Pages用に相対パスでビルドするように設定
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
	},
});
