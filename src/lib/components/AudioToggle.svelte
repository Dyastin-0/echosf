<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';

	export let toggleMute: () => void;

	$: mediaState = $roomInfoStore.participants[$roomInfoStore.userId];
</script>

<button
	on:click={toggleMute}
	class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
	aria-label="toggle audio"
>
	<i
		class="fa-solid text-lg"
		class:fa-microphone={mediaState?.audio === 'enabled'}
		class:fa-microphone-slash={mediaState?.audio === 'disabled'}
	></i>
</button>
