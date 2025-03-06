<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';

	export let toggleMute: () => void;

	$: mediaState = $mediaStore.mediaSate;
</script>

<button
	on:click={toggleMute}
	class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
	aria-label="toggle audio"
>
	<i
		class="fa-solid text-lg"
		class:fa-microphone={!mediaState?.isMuted}
		class:fa-microphone-slash={mediaState?.isMuted}
	></i>
</button>
