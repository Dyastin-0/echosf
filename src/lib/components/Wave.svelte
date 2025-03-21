<script lang="ts">
	export let isAudioActive = false;
</script>

{#if isAudioActive}
	<div class="absolute top-0 right-0 flex h-11 w-11 items-center justify-center gap-1">
		<div class="animate-height w-1 rounded-md bg-[var(--highlight)]"></div>
		<div class="animate-height-1 w-1 rounded-md bg-[var(--highlight)]"></div>
		<div class="animate-height-2 w-1 rounded-md bg-[var(--highlight)]"></div>
	</div>
{/if}

<style>
	@keyframes heightGrow {
		0% {
			height: 5px;
		}
		50% {
			height: 12px;
		}
		100% {
			height: 5px;
		}
	}

	.animate-height {
		animation: heightGrow 1s ease-in-out infinite;
	}

	.animate-height-1 {
		animation: heightGrow 0.6s ease-in-out infinite;
	}
	.animate-height-2 {
		animation: heightGrow 0.8s ease-in-out infinite;
	}
</style>
