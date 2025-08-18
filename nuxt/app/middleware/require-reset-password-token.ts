export default defineNuxtRouteMiddleware((to, from) => {
	const token = useState<Date | null>("resetPasswordToken");

	if (!token.value) {
		return navigateTo({ name: "forgot-password" });
	}
});
