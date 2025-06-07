<template>
	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-color">{{ $t("auth.forgotPassword.title") }}</h1>
		<p class="text-muted-color">{{ $t("auth.forgotPassword.subtitle") }}</p>
	</div>

	<form @submit.prevent="onSubmit">
		<div class="space-y-4">
			<div>
				<label>{{ $t("auth.forgotPassword.labels.email") }}</label>
				<InputText v-model="form.email" :invalid="hasError('email')" class="mt-1" inputmode="email" fluid />
				<FieldErrors field="email" :formErrors />
			</div>

			<Button @click="navigateTo({ name: 'verify-code' })" :label="$t('auth.forgotPassword.buttons.submit')" fluid />

			<div class="flex justify-center">
				<Button @click="navigateTo({ name: 'login' })" :label="$t('auth.forgotPassword.buttons.back')" variant="link" class="!p-0" size="small" />
			</div>
		</div>
	</form>
</template>

<script lang="ts" setup>
	definePageMeta({ layout: "auth" });

	const formErrors = ref<FormError[]>([]);
	const { hasError, clearAllErrors } = useFormErrors(formErrors);
	const form = ref({
		email: "",
	});

	const onSubmit = () => {
		clearAllErrors();
	};
</script>
