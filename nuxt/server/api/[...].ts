import { joinURL } from "ufo";

export default defineEventHandler(async (event) => {
	const { proxyUrl } = useRuntimeConfig().public;
	const path = event.path.replace(/^\/api\//, "");
	const target = joinURL(proxyUrl, path);
	const accessToken = getCookie(event, "accessToken");

	return proxyRequest(event, target, {
		headers: {
			Authorization: accessToken ? `Bearer ${accessToken}` : "",
			...getRequestHeaders(event),
		},
	});
});
