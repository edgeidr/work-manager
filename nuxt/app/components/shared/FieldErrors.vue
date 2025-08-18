<template>
	<div v-if="hasError(field)" class="mt-1">
		<Message v-for="(message, index) in getError(field)" :key="index" severity="error" variant="simple" size="small">
			{{ message }}
		</Message>
	</div>
</template>

<script setup lang="ts">
	const formErrors = defineModel<FormError[]>("formErrors");
	const { field } = defineProps<{
		field: string;
	}>();

	const { hasError, getError } = useFormErrors(formErrors as Ref);
</script>
