<template>
	<div class="flex h-screen w-screen gap-8 p-8">
		<div class="flex-1 overflow-hidden rounded-lg bg-surface-400">
			<img src="~/assets/images/login-banner.jpg" class="size-full object-cover" />
		</div>

		<div class="min-h-96 w-96 rounded-lg bg-surface-800 p-8 text-surface-0">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts"></script>
