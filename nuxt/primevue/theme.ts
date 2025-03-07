import { definePreset } from "@primeuix/themes";
import Lara from "@primeuix/themes/lara";

const MyPreset = definePreset(Lara);

export default {
	preset: MyPreset,
	options: {
		darkModeSelector: ".p-dark",
		cssLayer: {
			name: "primevue",
			order: "tailwind-base, primevue, tailwind-utilities",
		},
	},
};
