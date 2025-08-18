export const useCountdownTimer = (targetTime: Ref<Date | null>, format?: "mm:ss" | "mm" | "m" | "ss" | "s"): ComputedRef<string> => {
	const now = useNow({ interval: 1000 });

	return computed(() => {
		if (!targetTime.value) return "";

		const remainingMs = targetTime.value.getTime() - now.value.getTime();

		if (remainingMs <= 0) return "";

		const totalSeconds = Math.floor(remainingMs / 1000);
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		const paddedTotalSeconds = totalSeconds.toString().padStart(2, "0");
		const paddedMinutes = minutes.toString().padStart(2, "0");
		const paddedSeconds = seconds.toString().padStart(2, "0");

		switch (format) {
			case "s":
				return `${totalSeconds}`;

			case "ss":
				return `${paddedTotalSeconds}`;

			case "m":
				return `${minutes}`;

			default:
				return `${paddedMinutes}:${paddedSeconds}`;
		}
	});
};
