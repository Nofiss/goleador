import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			workbox: {
				globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
			},
			manifest: {
				name: "Goleador - Corporate Foosball",
				// biome-ignore lint/style/useNamingConvention: standard PWA manifest keys
				short_name: "Goleador",
				description: "Gestione Tornei Biliardino",
				// biome-ignore lint/style/useNamingConvention: standard PWA manifest keys
				theme_color: "#2563eb",
				// biome-ignore lint/style/useNamingConvention: standard PWA manifest keys
				background_color: "#ffffff",
				display: "standalone",
				icons: [
					{
						src: "pwa-192x192.png",
						sizes: "192x192",
						type: "image/png",
					},
					{
						src: "pwa-512x512.png",
						sizes: "512x512",
						type: "image/png",
					},
				],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
