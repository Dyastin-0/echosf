<script lang="ts">
	import { setVideoStream } from '$lib/helpers/video';
	import { fly } from 'svelte/transition';
	import Avatar from './Avatar.svelte';
	import Wave from './Wave.svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';
	export let stream: MediaStream;
	export let isExpanded: boolean = false;
	export let owner: string;
	export let ownerId: string;
	export let isMuted: boolean = false;
	export let isCameraOpen: boolean = false;
	export let audioLevel: number = 0;
	export let isScreen: boolean = false;

	$: isAudioActive = audioLevel > 0.05;
	$: isLocalStream = ownerId === $roomInfoStore.userId;
	$: displayedName = `${ownerId === $roomInfoStore.userId ? 'You' : owner} ${isScreen ? '(Presenting)' : ''}`;

	function togglePinnedStream() {
		$roomInfoStore.pinnedStream = $roomInfoStore.pinnedStream === stream.id ? '' : stream.id;
	}
</script>

<div
	class="group relative flex max-w-full items-center justify-center rounded-lg border-2 transition-all duration-200"
	class:border-[var(--accent)]={isAudioActive}
	class:border-transparent={!isAudioActive}
	class:h-full={isExpanded}
	class:h-[170px]={!isExpanded}
	class:w-full={isExpanded}
	class:w-74={!isExpanded}
	class:bg-transparent={isExpanded}
	class:bg-[var(--bg-secondary)]={!isExpanded}
	in:fly={{ y: 100, opacity: 1 }}
>
	<div class="h-full w-full overflow-hidden">
		<video
			class="h-full w-full"
			style="object-fit: contain;"
			use:setVideoStream={stream}
			autoplay
			muted={isMuted || isLocalStream}
		>
			<track kind="captions" />
		</video>
	</div>

	{#if !isScreen}
		<Avatar {owner} {isAudioActive} {isCameraOpen} />
	{/if}

	<div class="absolute top-2 right-2">
		{#if isMuted}
			<i class="fa-solid fa-microphone-slash"></i>
		{:else}
			<Wave isAudioActive={isAudioActive && !isLocalStream} />
		{/if}
	</div>

	<span class="absolute bottom-2 left-2">{displayedName}</span>

	<button
		class="absolute right-2 bottom-2 flex flex h-6 w-6 items-center items-center justify-center justify-center rounded-full bg-black/50 p-4 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer"
		on:click={togglePinnedStream}
		aria-label="toggle expand"
	>
		<i class="fa-solid" class:fa-thumbtack={!isExpanded} class:fa-thumbtack-slash={isExpanded}></i>
	</button>
</div>
