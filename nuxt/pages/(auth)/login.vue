<template>
	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-color">{{ $t("auth.login.title") }}</h1>
		<p class="text-muted-color">{{ $t("auth.login.subtitle") }}</p>
	</div>

	<form @submit.prevent="onSubmit">
		<div class="space-y-4">
			<div>
				<label>{{ $t("auth.login.labels.email") }}</label>
				<InputText v-model="form.email" :invalid="hasError('email')" class="mt-1" inputmode="email" fluid />
				<FieldErrors field="email" :formErrors />
			</div>

			<div>
				<label>{{ $t("auth.login.labels.password") }}</label>
				<Password v-model="form.password" :invalid="hasError('password')" :feedback="false" class="mt-1" fluid />
				<FieldErrors field="password" :formErrors />
			</div>

			<div class="flex items-center justify-between gap-4 whitespace-nowrap">
				<div class="flex items-center gap-2">
					<Checkbox v-model="form.staySignedIn" inputId="staySignedIn" size="small" binary />
					<label for="staySignedIn" class="text-sm">{{ $t("auth.login.labels.staySignedIn") }}</label>
				</div>

				<Button
					@click="navigateTo({ name: 'forgot-password' })"
					:label="$t('auth.login.buttons.forgotPassword')"
					variant="link"
					class="!p-0"
					size="small" />
			</div>

			<Button type="submit" :label="$t('auth.login.buttons.signIn')" :loading="signInStatus === 'pending'" fluid />
		</div>
	</form>

	<div class="mt-4 space-y-4">
		<div class="flex items-center">
			<div class="h-px flex-1 border border-surface-500"></div>
			<span class="px-2 text-sm text-muted-color">{{ $t("auth.login.buttons.continueWith") }}</span>
			<div class="h-px flex-1 border border-surface-500"></div>
		</div>

		<div class="flex gap-4">
			<Button :label="$t('auth.login.buttons.google')" severity="contrast" variant="outlined" fluid>
				<template #icon>
					<Icon name="logos:google-icon" />
				</template>
			</Button>
			<Button :label="$t('auth.login.buttons.github')" severity="contrast" variant="outlined" fluid>
				<template #icon>
					<Icon name="logos:github-icon" />
				</template>
			</Button>
		</div>

		<div class="space-x-1 text-center">
			<span class="text-sm">{{ $t("auth.login.buttons.signUpPrompt") }}</span>
			<Button :label="$t('auth.login.buttons.signUp')" variant="link" class="!p-0" size="small" />
		</div>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({ layout: "auth" });

	const user = useLocalStorage<User>("user", null);
	const formErrors = ref<FormError[]>([]);
	const { hasError, clearAllErrors } = useFormErrors(formErrors);
	const form = ref({
		email: "",
		password: "",
		staySignedIn: false,
	});

	const { execute: signIn, status: signInStatus } = await useCustomFetch("/auth/signin", {
		immediate: false,
		watch: false,
		method: "POST",
		body: form,
		onResponse: async ({ response }) => {
			if (!response.ok) return;

			const { user: userData } = response._data as { user: User };

			user.value = userData;
			navigateTo({ name: "index" });
		},
		onResponseError: ({ response }) => {
			const { message } = response._data;

			if (message && Array.isArray(message)) {
				formErrors.value = message;
			}
		},
	});

	const onSubmit = () => {
		clearAllErrors();
		signIn();
	};
</script>
