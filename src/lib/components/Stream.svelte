<script lang="ts">
	import { setVideoStream } from '$lib/helpers/video';
	import { fly } from 'svelte/transition';
	import Avatar from './Avatar.svelte';
	import Wave from './Wave.svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';
	export let stream: MediaStream;
	export let isExpanded: boolean = false;
	export let onExpand: (id: string) => void;
	export let streamId: string;
	export let owner: string;
	export let ownerId: string;
	export let isMuted: boolean = false;
	export let isCameraOpen: boolean = false;
	export let audioLevel: number = 0;
	export let isScreen: boolean = false;

	$: isAudioActive = audioLevel > 0.05;
	$: isLocalStream = ownerId === $roomInfoStore.userId;
	$: displayedName = `${ownerId === $roomInfoStore.userId ? 'You' : owner} ${isScreen ? '(Presenting)' : ''}`;
</script>

<div
	class="group relative flex h-fit items-center justify-center transition-all duration-200"
	in:fly={{ y: 100, opacity: 1 }}
	out:fly={{ opacity: 1 }}
>
	<video
		use:setVideoStream={stream}
		class="relative rounded-lg bg-[var(--bg-secondary)]"
		class:min-h-[150px]={!isExpanded}
		class:w-64={!isExpanded}
		class:max-h-75vh={isExpanded}
		class:min-w-64={isExpanded}
		autoplay
		muted={isLocalStream}
	>
		<track kind="captions" />
	</video>

	{#if !isScreen}
		<Avatar {owner} {isAudioActive} {isCameraOpen} />
	{/if}
	<Wave isAudioActive={isAudioActive && !isLocalStream} />

	<div
		class="absolute bottom-3 left-3 flex items-center justify-center gap-1 rounded-md bg-black p-1"
	>
		{#if !isScreen}
			<i class="fa-solid" class:fa-microphone={!isMuted} class:fa-microphone-slash={isMuted}></i>
		{/if}
		<span>{displayedName}</span>
	</div>

	<button
		class="absolute right-3 bottom-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer"
		on:click={() => onExpand(streamId)}
		aria-label="toggle expand"
	>
		{#if isExpanded}
			<i class="fa-solid fa-compress"></i>
		{:else}
			<i class="fa-solid fa-expand"></i>
		{/if}
	</button>
</div>
