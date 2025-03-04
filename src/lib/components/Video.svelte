<script lang="ts">
	export let localStream: MediaStream | undefined;
	let videoRef: HTMLVideoElement;

	$: if (videoRef && localStream) {
		videoRef.srcObject = localStream;
	}
</script>

<video
	bind:this={videoRef}
	class="absolute right-0 bottom-0 z-50 aspect-video h-[100px] rounded-lg border border-[var(--accent)] object-cover"
	muted
	autoplay
></video>
