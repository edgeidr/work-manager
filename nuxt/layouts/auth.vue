<template>
	<div class="h-screen w-screen bg-surface-400 bg-[url('/assets/images/login-banner.jpg')] bg-cover bg-center">
		<div class="flex size-full items-center justify-center sm:justify-end">
			<div class="m-8 h-fit rounded-lg bg-surface-800/60 px-8 py-14 shadow-lg backdrop-blur-lg">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts"></script>
