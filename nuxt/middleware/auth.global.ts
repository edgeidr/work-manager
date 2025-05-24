export default defineNuxtRouteMiddleware(async (to, from) => {
	const user = useLocalStorage<User>("user", null);
	const publicRoutes = ["login"];

	if (!user.value && !publicRoutes.includes(to.name as string)) {
		return navigateTo({ name: "login" });
	}

	if (user.value && publicRoutes.includes(to.name as string)) {
		return navigateTo({ name: "index" });
	}
});
