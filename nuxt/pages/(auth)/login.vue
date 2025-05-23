<template>
	<div class="flex h-full items-center justify-center">
		<div>
			<div class="mb-8">
				<h1 class="text-2xl font-semibold text-primary">{{ $t("auth.title") }}</h1>
				<p class="text-muted-color">{{ $t("auth.subtitle") }}</p>
			</div>

			<form v-focustrap @submit.prevent="onSubmit">
				<div class="space-y-4">
					<div>
						<label>Username</label>
						<InputText type="email" v-model="form.email" class="mt-1" required fluid />
					</div>

					<div>
						<label>Password</label>
						<Password v-model="form.password" :feedback="false" class="mt-1" required fluid />

						<div class="my-2.5 text-right">
							<Button :label="$t('auth.buttons.forgotPassword')" variant="link" class="!p-0" size="small" />
						</div>
					</div>

					<Button type="submit" :label="$t('auth.buttons.signIn')" fluid />

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
	const form = ref({
		email: "",
		password: "",
	});

	const { execute: signIn, data: auth } = await useCustomFetch<User>("/auth/signin", {
		immediate: false,
		watch: false,
		method: "POST",
		body: form,
	});

	const { execute: getMe, data } = await useCustomFetch("/users/me", {
		immediate: false,
		watch: false,
	});

	const onSubmit = async () => {
		await signIn();
		user.value = auth.value;
		await getMe();
	};
</script>
