<template>
	<div class="flex h-full items-center justify-center">
		<div class="w-full">
			<div class="mb-8">
				<h1 class="text-2xl font-semibold text-primary">{{ $t("auth.title") }}</h1>
				<p class="text-muted-color">{{ $t("auth.subtitle") }}</p>
			</div>

			<form v-focustrap @submit.prevent="onSubmit">
				<div class="space-y-4">
					<div>
						<label>Email</label>
						<InputText v-model="form.email" :invalid="hasError('email')" class="mt-1" inputmode="email" fluid />
						<FieldErrors field="email" :formErrors />
					</div>

					<div>
						<label>Password</label>
						<Password v-model="form.password" :invalid="hasError('password')" :feedback="false" class="mt-1" fluid />
						<FieldErrors field="password" :formErrors />

						<div class="my-2.5 text-right">
							<Button :label="$t('auth.buttons.forgotPassword')" variant="link" class="!p-0" size="small" />
						</div>
					</div>

					<Button type="submit" :label="$t('auth.buttons.signIn')" :loading="signInStatus === 'pending'" fluid />

					<div class="flex items-center">
						<div class="h-px flex-1 border border-surface-500"></div>
						<span class="px-2 text-sm text-muted-color">{{ $t("auth.buttons.continueWith") }}</span>
						<div class="h-px flex-1 border border-surface-500"></div>
					</div>

					<div class="flex gap-4">
						<Button :label="$t('auth.buttons.google')" variant="outlined" severity="secondary" fluid>
							<template #icon>
								<Icon name="logos:google-icon" />
							</template>
						</Button>
						<Button :label="$t('auth.buttons.github')" variant="outlined" severity="secondary" fluid>
							<template #icon>
								<Icon name="logos:github-icon" />
							</template>
						</Button>
					</div>
				</div>

				<div class="mt-8 space-x-1 text-center">
					<span class="text-sm">{{ $t("auth.buttons.signUpPrompt") }}</span>
					<Button :label="$t('auth.buttons.signUp')" variant="link" class="!p-0" size="small" />
				</div>
			</form>
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
