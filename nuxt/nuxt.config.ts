// https://nuxt.com/docs/api/configuration/nuxt-config

import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },
	devServer: {
		host: "work-manager.edgeidr.local",
		port: 3000,
	},
	ssr: false,
	css: ["~/assets/css/main.css"],
	vite: {
		plugins: [tailwindcss()],
	},
	app: {
		head: {
			title: process.env.NUXT_APP_NAME,
			htmlAttrs: {
				class: "p-dark",
			},
		},
	},
	runtimeConfig: {
		public: {
			appName: process.env.NUXT_APP_NAME || "",
			brandName: process.env.NUXT_BRAND_NAME || "",
			apiBaseUrl: process.env.NUXT_API_BASE_URL || "",
			toastLife: Number(process.env.NUXT_TOAST_LIFE) || 5000,
		},
	},
	components: [
		{
			path: "~/components",
			pathPrefix: false,
		},
	],
	modules: ["@nuxt/fonts", "@nuxt/icon", "@nuxtjs/i18n", "@primevue/nuxt-module", "@vueuse/nuxt"],
	fonts: {
		families: [{ name: "Inter" }],
	},
	i18n: {
		locales: [{ code: "en", language: "en-US", file: "en.json" }],
		defaultLocale: "en",
		strategy: "no_prefix",
		langDir: "../shared/i18n/locales/",
	},
	primevue: {
		importTheme: { from: "@/primevue/theme" },
		options: {
			ptOptions: { mergeProps: true },
			ripple: true,
			locale: {
				dayNamesMin: ["S", "M", "T", "W", "T", "F", "S"],
			},
		},
	},
});
