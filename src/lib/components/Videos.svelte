<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';
	import VideoPlayer from '$lib/components/RemoteVideo.svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';
	import Avatar from './Avatar.svelte';

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
					{#if Object.keys(info.streams || {}).includes(expandedId)}
						<VideoPlayer
							stream={$mediaStore.remoteStreams[expandedId]}
							isLocal={expandedId === $mediaStore.localStream?.id}
							isExpanded={true}
							onExpand={toggleExpand}
							streamId={expandedId}
							audioLevel={$mediaStore.audioLevels[
								$mediaStore.remoteStreams[expandedId]?.getAudioTracks()[0]?.id
							]}
							isMuted={info.audio === 'disabled' || info.audio === 'missing'}
							owner={info.name}
							isScreen={info.screen === expandedId}
							isCameraOpen={info.camera === 'enabled'}
							ownerId={id}
						/>
					{/if}
				{/each}
			</div>
			<div class="flex flex-col items-center justify-center gap-2 overflow-x-auto">
				{#each participants as [id, info]}
					{#if Object.keys(info.streams || {}).length > 0}
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
									isMuted={info.audio === 'disabled' || info.audio === 'missing'}
									owner={info.name}
									isScreen={info.screen === streamId}
									isCameraOpen={info.camera === 'enabled'}
									ownerId={id}
								/>
							{/if}
						{/each}
					{:else}
						<div class="relative flex h-32 w-32 items-center justify-center rounded-lg">
							<Avatar owner={info.name} isCameraOpen={false} isAudioActive={false} />
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex w-full flex-wrap gap-4">
			{#each participants as [id, info]}
				{#if Object.keys(info.streams || {}).length > 0}
					{#each Object.entries(info.streams) as [streamId, _]}
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
							isMuted={info.audio === 'disabled' || info.audio === 'missing'}
							owner={info.name}
							isScreen={info.screen === streamId}
							isCameraOpen={info.camera === 'enabled'}
							ownerId={id}
						/>
					{/each}
				{:else}
					<div
						class="relative flex h-[150px] w-64 items-center justify-center rounded-lg bg-[var(--bg-secondary)]"
					>
						<Avatar
							owner={info.name}
							isCameraOpen={false}
							isAudioActive={info.audio === 'enabled' &&
								Boolean($mediaStore.audioLevels[id]) &&
								Number($mediaStore.audioLevels[id]) > 0.05}
						/>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
