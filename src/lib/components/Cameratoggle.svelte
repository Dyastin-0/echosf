<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';

	export let toggleCamera: () => void;

	$: mediaState = $mediaStore.mediaSate;
</script>

<button
	on:click={toggleCamera}
	class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
	aria-label="toggle camera"
>
	<i
		class="fa-solid text-lg"
		class:fa-video={mediaState?.isCameraOn}
		class:fa-video-slash={!mediaState?.isCameraOn}
	></i>
</button>
