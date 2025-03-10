<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';
	import VideoPlayer from '$lib/components/RemoteVideo.svelte';

	let expandedId: string | null = null;

	function toggleExpand(videoId: string) {
		expandedId = expandedId === videoId ? null : videoId;
	}
</script>

<div class="flex h-full w-full">
	{#if expandedId}
		<div class="flex h-full w-full gap-4">
			<div class="flex flex-grow items-center justify-center">
				{#each $mediaStore.remoteStreams as stream}
					{#if stream.id === expandedId}
						<VideoPlayer
							{stream}
							isLocal={stream.id === $mediaStore.localStream?.id}
							isExpanded={true}
							onExpand={toggleExpand}
							id={stream.id}
							audioLevel={Number(
								$mediaStore.remoteStreamStates[stream.getAudioTracks()[0].id]?.audioLevel
							)}
							isMuted={$mediaStore.remoteStreamStates[stream.id]?.audio === 'disabled'}
							owner={String($mediaStore.remoteStreamStates[stream.id]?.owner)}
							isCameraOpen={$mediaStore.remoteStreamStates[stream.id]?.video === 'enabled'}
						/>
					{/if}
				{/each}
			</div>
			<div class="flex flex-col items-center justify-center gap-2 overflow-x-auto">
				{#each $mediaStore.remoteStreams as stream}
					{#if stream.id !== expandedId}
						<VideoPlayer
							{stream}
							isLocal={stream.id === $mediaStore.localStream?.id}
							isExpanded={false}
							onExpand={toggleExpand}
							id={stream.id}
							audioLevel={Number(
								$mediaStore.remoteStreamStates[stream.getAudioTracks()[0].id]?.audioLevel
							)}
							isMuted={$mediaStore.remoteStreamStates[stream.id]?.audio === 'disabled'}
							owner={String($mediaStore.remoteStreamStates[stream.id]?.owner)}
							isCameraOpen={$mediaStore.remoteStreamStates[stream.id]?.video === 'enabled'}
						/>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex w-full flex-wrap gap-4">
			{#each $mediaStore.remoteStreams as stream}
				<VideoPlayer
					{stream}
					isLocal={stream.id === $mediaStore.localStream?.id}
					isExpanded={false}
					onExpand={toggleExpand}
					id={stream.id}
					audioLevel={Number(
						$mediaStore.remoteStreamStates[stream.getAudioTracks()[0].id]?.audioLevel
					)}
					isMuted={$mediaStore.remoteStreamStates[stream.id]?.audio === 'disabled'}
					owner={String($mediaStore.remoteStreamStates[stream.id]?.owner)}
					isCameraOpen={$mediaStore.remoteStreamStates[stream.id]?.video === 'enabled'}
				/>
			{/each}
		</div>
	{/if}
</div>
