<template>
	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-color">{{ $t("auth.resetPassword.title") }}</h1>
		<p class="text-muted-color">{{ $t("auth.resetPassword.subtitle") }}</p>
	</div>

	<form @submit.prevent="onSubmit">
		<div class="space-y-4">
			<div>
				<label>{{ $t("auth.resetPassword.labels.password") }}</label>
				<Password v-model="form.password" :invalid="hasError('password')" :feedback="false" class="mt-1" fluid />
				<FieldErrors field="password" :formErrors />
			</div>

			<div>
				<label>{{ $t("auth.resetPassword.labels.confirmPassword") }}</label>
				<Password v-model="form.confirmPassword" :invalid="hasError('confirmPassword')" :feedback="false" class="mt-1" fluid />
				<FieldErrors field="confirmPassword" :formErrors />
			</div>

			<Button @click="navigateTo({ name: 'login' })" :label="$t('auth.resetPassword.buttons.submit')" fluid />

			<div class="flex justify-center">
				<Button @click="navigateTo({ name: 'login' })" :label="$t('auth.resetPassword.buttons.back')" variant="link" class="!p-0" size="small" />
			</div>
		</div>
	</form>
</template>

<script lang="ts" setup>
	definePageMeta({ layout: "auth" });

	const formErrors = ref<FormError[]>([]);
	const { hasError, clearAllErrors } = useFormErrors(formErrors);
	const form = ref({
		password: "",
		confirmPassword: "",
	});

	const onSubmit = () => {
		clearAllErrors();
	};
</script>
