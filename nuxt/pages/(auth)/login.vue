<template>
	<div class="flex h-full items-center justify-center">
		<div>
			<div class="mb-8">
				<h1 class="text-2xl font-semibold text-primary">Welcome Back!</h1>
				<p class="text-muted-color">Please enter your details here.</p>
			</div>

			<form v-focustrap @submit.prevent="onSubmit">
				<div class="space-y-4">
					<div>
						<label>Username</label>
						<InputText v-model="form.email" class="mt-1" fluid />
					</div>

					<div>
						<label>Password</label>
						<Password v-model="form.password" :feedback="false" class="mt-1" fluid />

						<div class="my-2.5 text-right">
							<Button label="Forgot Password?" variant="link" class="!p-0" size="small" />
						</div>
					</div>

					<Button type="submit" label="Sign In" fluid />

					<div class="flex items-center">
						<div class="h-px flex-1 border border-surface-500"></div>
						<span class="px-2 text-sm text-muted-color">or continue with</span>
						<div class="h-px flex-1 border border-surface-500"></div>
					</div>

					<div class="flex gap-4">
						<Button label="Google" variant="outlined" severity="secondary" fluid>
							<template #icon>
								<Icon name="logos:google-icon" />
							</template>
						</Button>
						<Button label="GitHub" variant="outlined" severity="secondary" fluid>
							<template #icon>
								<Icon name="logos:github-icon" />
							</template>
						</Button>
					</div>
				</div>

				<div class="mt-8 text-center">
					<span class="text-sm">Don't have an account? </span>
					<Button label="Sign Up" variant="link" class="!p-0" size="small" />
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
