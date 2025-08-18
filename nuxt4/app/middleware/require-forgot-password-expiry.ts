export default defineNuxtRouteMiddleware((to, from) => {
	const codeExpiry = useState<Date | null>("forgotPasswordCodeExpiry");

	if (!codeExpiry.value) {
		return navigateTo({ name: "forgot-password" });
	}
});
