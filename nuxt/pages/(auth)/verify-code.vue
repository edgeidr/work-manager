<template>
	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-color">{{ $t("auth.verifyCode.title") }}</h1>
		<p class="text-muted-color">{{ $t("auth.verifyCode.subtitle") }}</p>
	</div>

	<form>
		<div class="flex flex-col items-center space-y-4">
			<span class="text-sm">{{ codeCountdownTimerLabel }}</span>

			<div>
				<InputOtp v-model="form.code" :invalid="hasError('code')" :length="OTP_LENGTH" integerOnly fluid />
				<FieldErrors field="code" :formErrors />
			</div>

			<div class="inline-flex flex-wrap items-center justify-center gap-x-1">
				<span class="text-sm text-muted-color">{{ $t("auth.verifyCode.labels.helper") }}</span>
				<Button @click="resetResendExpiry" variant="link" class="!p-0" size="small" :disabled="!!resendCountdownTimer">
					<div class="p-button-label">
						{{ $t("auth.verifyCode.buttons.submit") }}
						<span class="text-xs">{{ resendCountdownTimerLabel }}</span>
					</div>
				</Button>
			</div>

			<div class="flex justify-center">
				<Button @click="navigateTo({ name: 'login' })" :label="$t('auth.verifyCode.buttons.back')" variant="link" class="!p-0" size="small" />
			</div>
		</div>
	</form>
</template>

<script lang="ts" setup>
	definePageMeta({ layout: "auth" });

	const { t } = useI18n();
	const CODE_DEFAULT_DURATION = 1000 * 60 * 5;
	const RESEND_DEFAULT_DURATION = 1000 * 30;
	const OTP_LENGTH = 6;
	const codeExpiry = ref<Date | null>(null);
	const resendExpiry = ref<Date | null>(null);
	const codeCountdownTimer = useCountdownTimer(codeExpiry, "mm:ss");
	const resendCountdownTimer = useCountdownTimer(resendExpiry, "s");
	const formErrors = ref<FormError[]>([]);
	const { hasError, clearAllErrors } = useFormErrors(formErrors);
	const form = ref({
		code: "",
	});

	const codeCountdownTimerLabel = computed(() => {
		if (!codeCountdownTimer.value) return t("auth.verifyCode.labels.codeExpired");
		return `Expires in ${codeCountdownTimer.value}`;
	});

	const resendCountdownTimerLabel = computed(() => {
		if (!resendCountdownTimer.value) return "";
		return `(${resendCountdownTimer.value}s)`;
	});

	const resetCodeExpiry = (): void => {
		codeExpiry.value = new Date(Date.now() + CODE_DEFAULT_DURATION);
	};

	const resetResendExpiry = (): void => {
		if (resendCountdownTimer.value) return;
		resetCodeExpiry();
		resendExpiry.value = new Date(Date.now() + RESEND_DEFAULT_DURATION);
	};

	const verifyCode = () => {
		clearAllErrors();
		navigateTo({ name: "reset-password" });
	};

	onMounted(() => {
		resetCodeExpiry();
		resetResendExpiry();
	});

	watch(
		() => form.value.code,
		(newValue) => {
			if (newValue.length === OTP_LENGTH) {
				verifyCode();
			}
		},
	);
</script>
