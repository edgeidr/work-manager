// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
	ssr: false,
	css: ["@/assets/css/base.css"],
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
			proxyUrl: process.env.NUXT_PROXY_URL || "",
		},
	},
	modules: ["@primevue/nuxt-module", "@nuxtjs/tailwindcss", "@nuxt/fonts", "@nuxt/icon"],
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
	fonts: {
		families: [{ name: "Inter" }],
	},
});
