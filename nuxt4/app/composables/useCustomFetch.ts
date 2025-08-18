import type { UseFetchOptions } from "nuxt/app";

export const useCustomFetch = <T>(url: string | (() => string), options?: UseFetchOptions<T>) => {
	const { t, te } = useI18n();
	const toast = useToast();
	const runtimeConfig = useRuntimeConfig();

	return useFetch(url, {
		...options,
		$fetch: useNuxtApp().$api as typeof $fetch,
		lazy: true,
		credentials: "include",
		baseURL: useRuntimeConfig().public.apiBaseUrl,
		onResponseError: (ctx) => {
			if (typeof options?.onResponseError === "function") {
				options.onResponseError(ctx);
			}

			const { response } = ctx;
			const { message, payload } = response._data;
			const defaultSummary = t("httpStatus.unexpected");
			const defaultDetail = t("messages.tryAgain");
			const summary = te(`httpStatus.${response.status}`) ? t(`httpStatus.${response.status}`) : defaultSummary;

			if (message) {
				if (Array.isArray(message)) {
					const detail = t("messages.reviewAll");

					toast.add({
						summary,
						detail,
						severity: "error",
						life: runtimeConfig.public.toastLife,
					});
				} else {
					const detail = te(message) ? t(message, payload || {}) : defaultDetail;

					toast.add({
						summary,
						detail,
						severity: "error",
						life: runtimeConfig.public.toastLife,
					});
				}
			} else {
				toast.add({
					summary: defaultSummary,
					detail: defaultDetail,
					severity: "error",
					life: runtimeConfig.public.toastLife,
				});
			}
		},
	});
};
