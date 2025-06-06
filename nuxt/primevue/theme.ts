import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";
import type { LaraBaseTokenSections } from "@primeuix/themes/lara/base";
import type { Preset } from "@primeuix/themes/types";

const MyPreset = definePreset(Lara, <Preset>{
	semantic: <LaraBaseTokenSections.Semantic>{
		primary: {
			50: "{teal.50}",
			100: "{teal.100}",
			200: "{teal.200}",
			300: "{teal.300}",
			400: "{teal.400}",
			500: "{teal.500}",
			600: "{teal.600}",
			700: "{teal.700}",
			800: "{teal.800}",
			900: "{teal.900}",
			950: "{teal.950}",
		},
	},
});

export default {
	preset: MyPreset,
	options: {
		darkModeSelector: ".p-dark",
		cssLayer: {
			order: "theme, base, primevue",
		},
	},
};
