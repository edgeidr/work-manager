export default defineNuxtRouteMiddleware((to, from) => {
	const email = useState<Date | null>("forgotPasswordEmail");

	if (!email.value) {
		return navigateTo({ name: "forgot-password" });
	}
});
