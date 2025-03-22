<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';
	import Stream from '$lib/components/Stream.svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';
	import Avatar from './Avatar.svelte';

	$: participants = Object.entries($roomInfoStore.participants);
</script>

<div class="flex h-full w-full">
	{#if $roomInfoStore.pinnedStream}
		<div class="flex h-full w-full gap-4">
			<div class="flex flex-grow items-center justify-center">
				{#each participants as [id, info]}
					{#if Object.keys(info.streams || {}).includes($roomInfoStore.pinnedStream)}
						<Stream
							stream={$mediaStore.remoteStreams[$roomInfoStore.pinnedStream]}
							isExpanded={true}
							audioLevel={$mediaStore.audioLevels[
								$mediaStore.remoteStreams[$roomInfoStore.pinnedStream]?.getAudioTracks()[0]?.id
							]}
							isMuted={info.audio === 'disabled' || info.audio === 'missing'}
							owner={info.name}
							isScreen={info.screen === $roomInfoStore.pinnedStream}
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
							{#if streamId !== $roomInfoStore.pinnedStream}
								<Stream
									stream={$mediaStore.remoteStreams[streamId]}
									isExpanded={false}
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
						<div
							class="relative flex h-[150px] w-64 items-center justify-center rounded-lg bg-[var(--bg-secondary)]"
						>
							<Avatar owner={info.name} isCameraOpen={false} isAudioActive={false} />
							<span class="absolute bottom-3 left-3">{info.name}</span>
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
						<Stream
							stream={$mediaStore.remoteStreams[streamId]}
							isExpanded={false}
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

						<span class="absolute bottom-3 left-3">{info.name}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
