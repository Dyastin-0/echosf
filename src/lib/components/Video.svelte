<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';

	$: localStream = $mediaStore.localStream;

	export let position: string;
	export let height: string;

	function setVideoStream(node: HTMLVideoElement, stream: MediaStream | null) {
		if (stream) {
			node.srcObject = stream;
		}
		return {
			update(newStream: MediaStream) {
				if (newStream !== node.srcObject) {
					node.srcObject = newStream;
				}
			},
			destroy() {
				node.srcObject = null;
			}
		};
	}
</script>

{#if !localStream}
	<div class="flex h-[200px] w-[350px] items-center justify-center bg-[var(--bg-primary)]">
		<span>No media device found</span>
	</div>
{:else}
	<video
		use:setVideoStream={localStream}
		class="{position} {height} z-50 rounded-lg border border-[var(--accent)] object-cover"
		muted
		autoplay
	></video>
{/if}
