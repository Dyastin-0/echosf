<script lang="ts">
	import { setVideoStream } from '$lib/helpers/video';
	import { fly } from 'svelte/transition';
	import Avatar from './Avatar.svelte';
	import Wave from './Wave.svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';
	export let stream: MediaStream;
	export let isLocal: boolean = false;
	export let isExpanded: boolean = false;
	export let onExpand: (id: string) => void;
	export let id: string;
	export let owner: string;
	export let ownerId: string;
	export let isMuted: boolean = false;
	export let isCameraOpen: boolean = false;
	export let audioLevel: number = 0;

	$: isAudioActive = audioLevel > 0.05;
</script>

<div
	class="group relative flex h-fit items-center justify-center p-1 transition-all duration-200"
	in:fly={{ y: 100, opacity: 1 }}
	out:fly={{ opacity: 1 }}
>
	<div
		class="absolute inset-0 rounded-lg bg-[var(--accent)] opacity-0 transition-opacity duration-200"
		class:opacity-100={isAudioActive}
	></div>

	<video
		use:setVideoStream={stream}
		class="relative w-auto rounded-lg {isExpanded ? 'max-h-[75vh]' : 'max-h-[150px]'}"
		autoplay
		muted={isLocal}
	>
		<track kind="captions" />
	</video>

	{#if owner !== 'undefined'}
		<Avatar {owner} {isAudioActive} {isCameraOpen} />
	{/if}
	<Wave {isAudioActive} />

	<div
		class="absolute bottom-3 left-3 flex items-center justify-center gap-1 rounded-sm bg-black/50"
	>
		<div class="flex h-4 w-4 items-center justify-center">
			<i class="fa-solid" class:fa-microphone={!isMuted} class:fa-microphone-slash={isMuted}></i>
		</div>
		<span>{ownerId === $roomInfoStore.userId ? 'You' : owner}</span>
	</div>

	<button
		class="absolute bottom-3 right-3 rounded-full bg-black/50 opacity-0 transition-opacity hover:cursor-pointer group-hover:opacity-100"
		on:click={() => onExpand(id)}
		aria-label="toggle expand"
	>
		{#if isExpanded}
			<i class="fa-solid fa-compress"></i>
		{:else}
			<i class="fa-solid fa-expand"></i>
		{/if}
	</button>
</div>
