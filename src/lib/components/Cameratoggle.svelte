<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';

	export let toggleCamera: () => void;

	$: mediaState = $roomInfoStore.participants[$roomInfoStore.userId];
</script>

<button
	on:click={toggleCamera}
	class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
	aria-label="toggle camera"
>
	<i
		class="fa-solid text-lg"
		class:fa-video={mediaState?.camera === 'enabled'}
		class:fa-video-slash={mediaState?.camera === 'disabled'}
	></i>
</button>
