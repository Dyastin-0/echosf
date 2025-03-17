<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';
	import VideoPlayer from '$lib/components/RemoteVideo.svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';

	let expandedId: string | null = null;

	function toggleExpand(videoId: string) {
		expandedId = expandedId === videoId ? null : videoId;
	}

	$: participants = Object.entries($roomInfoStore.participants);
</script>

<div class="flex h-full w-full">
	{#if expandedId}
		<div class="flex h-full w-full gap-4">
			<div class="flex flex-grow items-center justify-center">
				{#each participants as [id, info]}
					{#each Object.entries(info.streams) as [streamId, _]}
						{#if streamId === expandedId}
							<VideoPlayer
								stream={$mediaStore.remoteStreams[streamId]}
								isLocal={streamId === $mediaStore.localStream?.id}
								isExpanded={true}
								onExpand={toggleExpand}
								{streamId}
								audioLevel={$mediaStore.audioLevels[
									$mediaStore.remoteStreams[streamId]?.getAudioTracks()[0]?.id
								]}
								isMuted={info.audio === 'disabled'}
								owner={info.name}
								isScreen={info.screen === streamId}
								isCameraOpen={info.camera === 'enabled'}
								ownerId={id}
							/>
						{/if}
					{/each}
				{/each}
			</div>
			<div class="flex flex-col items-center justify-center gap-2 overflow-x-auto">
				{#each participants as [id, info]}
					{#each Object.entries(info.streams) as [streamId, _]}
						{#if streamId !== expandedId}
							<VideoPlayer
								stream={$mediaStore.remoteStreams[streamId]}
								isLocal={streamId === $mediaStore.localStream?.id}
								isExpanded={false}
								onExpand={toggleExpand}
								{streamId}
								audioLevel={Number(
									$mediaStore.audioLevels[
										$mediaStore.remoteStreams[streamId]?.getAudioTracks()[0]?.id
									]
								)}
								isMuted={info.audio === 'disabled'}
								owner={info.name}
								isScreen={info.screen === streamId}
								isCameraOpen={info.camera === 'enabled'}
								ownerId={id}
							/>
						{/if}
					{/each}
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex w-full flex-wrap gap-4">
			{#each participants as [id, info]}
				{#each Object.entries(info.streams) as [streamId, _]}
					<VideoPlayer
						stream={$mediaStore.remoteStreams[streamId]}
						isLocal={streamId === $mediaStore.localStream?.id}
						isExpanded={false}
						onExpand={toggleExpand}
						{streamId}
						audioLevel={Number(
							$mediaStore.audioLevels[$mediaStore.remoteStreams[streamId]?.getAudioTracks()[0]?.id]
						)}
						isMuted={info.audio === 'disabled'}
						owner={info.name}
						isScreen={info.screen === streamId}
						isCameraOpen={info.camera === 'enabled'}
						ownerId={id}
					/>
				{/each}
			{/each}
		</div>
	{/if}
</div>
