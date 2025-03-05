// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: { enabled: true },
	css: ["@/assets/tailwind.css"],
	modules: ["@primevue/nuxt-module", "@nuxtjs/tailwindcss", "@nuxt/fonts"],
	primevue: {
		importTheme: { from: "@/primevue/theme", as: "auraTheme" },
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
