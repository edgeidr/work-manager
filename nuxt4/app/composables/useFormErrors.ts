export const useFormErrors = (errors: Ref<FormError[]>) => {
	const { t } = useI18n();

	const hasError = (field: string): boolean => {
		return errors.value.some((e) => e.field === field);
	};

	const getError = (field: string): string[] | null => {
		const error = errors.value.find((e) => e.field === field);
		return error ? error.error.map((message) => t(message)) : null;
	};

	const clearError = (field: string) => {
		errors.value = errors.value.filter((e) => e.field !== field);
	};

	const clearAllErrors = () => {
		errors.value = [];
	};

	return { hasError, getError, clearError, clearAllErrors };
};
