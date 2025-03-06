<script lang="ts">
	import { mediaStore } from '$lib/stores/roomStore';

	$: localStream = $mediaStore.localStream;

	export let position: string;
	export let height: string;

	let videoRef: HTMLVideoElement;

	$: if (videoRef && localStream) {
		videoRef.srcObject = localStream;
	}
</script>

<video
	bind:this={videoRef}
	class="{position} {height} z-50 rounded-lg border border-[var(--accent)] object-cover"
	muted
	autoplay
></video>
