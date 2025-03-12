<script>
	export let owner = '';
	export let isCameraOpen = false;
	export let isAudioActive = false;
</script>

<div class="absolute inset-0 flex items-center justify-center">
	<div
		class="absolute z-20 min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--accent)]"
		class:hidden={isCameraOpen}
		class:flex={!isCameraOpen}
	>
		{owner ? owner.charAt(0).toUpperCase() : '?'}
	</div>

	{#if !isCameraOpen}
		<div
			class="absolute z-10 min-h-11 min-w-11 rounded-full bg-[var(--accent)]"
			class:animate-ping={isAudioActive}
			class:opacity-60={isAudioActive}
			class:opacity-0={!isAudioActive}
		></div>

		<div
			class="absolute z-10 min-h-11 min-w-11 rounded-full bg-[var(--accent)] opacity-30"
			class:animate-pulse={isAudioActive}
			class:opacity-30={isAudioActive}
			class:opacity-0={!isAudioActive}
		></div>
	{/if}
</div>
