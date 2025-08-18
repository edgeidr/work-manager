<template>
	<div class="mb-8">
		<h1 class="text-2xl font-semibold text-color">{{ $t("auth.verifyCode.title") }}</h1>
		<p class="text-muted-color">{{ $t("auth.verifyCode.subtitle") }}</p>
	</div>

	<form>
		<div class="flex flex-col items-center space-y-4">
			<span class="text-sm">{{ codeCountdownTimerLabel }}</span>

			<div>
				<InputOtp v-model="form.code" :invalid="hasError" :disabled="verifyCodeStatus === 'pending'" :length="OTP_LENGTH" integerOnly fluid />
			</div>

			<div class="inline-flex flex-wrap items-center justify-center gap-x-1">
				<span class="text-sm text-muted-color">{{ $t("auth.verifyCode.labels.helper") }}</span>
				<Button @click="onResendCode" variant="link" class="!p-0" size="small" :disabled="!!resendCountdownTimer">
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
	import { OtpType } from "../../utils/otp-type";

	definePageMeta({
		layout: "auth",
		middleware: ["require-forgot-password-expiry", "require-forgot-password-email"],
	});

	const { t } = useI18n();
	const OTP_LENGTH = 6;
	const RESEND_DEFAULT_DURATION = 1000 * 30;
	const resetPasswordToken = useState<string>("resetPasswordToken");
	const email = useState<Date | null>("forgotPasswordEmail");
	const codeExpiry = useState<Date | null>("forgotPasswordCodeExpiry");
	const resendExpiry = useState<Date | null>("forgotPasswordResendExpiry");
	const codeCountdownTimer = useCountdownTimer(codeExpiry, "mm:ss");
	const resendCountdownTimer = useCountdownTimer(resendExpiry, "s");
	const hasError = ref<boolean>(false);
	const form = ref({
		code: "",
		email: email.value,
		type: OtpType.FORGOT_PASSWORD,
	});

	const { execute: resendCode, status: resendCodeStatus } = await useCustomFetch("/auth/forgot-password", {
		immediate: false,
		watch: false,
		method: "POST",
		body: {
			email: form.value.email,
		},
		onResponse: async ({ response }) => {
			if (!response.ok) return;

			const { expiresAt } = response._data as Otp;

			codeExpiry.value = new Date(expiresAt);
			resendExpiry.value = new Date(Date.now() + RESEND_DEFAULT_DURATION);
		},
	});

	const { execute: verifyCode, status: verifyCodeStatus } = await useCustomFetch("/otps/verify", {
		immediate: false,
		watch: false,
		method: "POST",
		body: form,
		onResponse: async ({ response }) => {
			if (!response.ok) return;

			const { value } = response._data as { value: string };

			resetPasswordToken.value = value;
			navigateTo({ name: "reset-password" });
		},
		onResponseError: () => {
			hasError.value = true;
		},
	});

	const codeCountdownTimerLabel = computed(() => {
		if (!codeCountdownTimer.value) return t("auth.verifyCode.labels.codeExpired");
		return `Expires in ${codeCountdownTimer.value}`;
	});

	const resendCountdownTimerLabel = computed(() => {
		if (!resendCountdownTimer.value) return "";
		return `(${resendCountdownTimer.value}s)`;
	});

	const onResendCode = async () => {
		if (resendCountdownTimer.value || resendCodeStatus.value === "pending") return;
		resendCode();
	};

	watch(
		() => form.value.code,
		(newValue) => {
			if (newValue.length === OTP_LENGTH) {
				verifyCode();
			} else {
				hasError.value = false;
			}
		},
	);
</script>
