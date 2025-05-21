import type { UseFetchOptions } from "nuxt/app";

export const useCustomFetch = <T>(url: string | (() => string), options?: UseFetchOptions<T>) => {
	return useFetch(url, {
		...options,
		$fetch: useNuxtApp().$api as typeof $fetch,
		lazy: true,
		credentials: "include",
		baseURL: useRuntimeConfig().public.apiBaseUrl,
	});
};
