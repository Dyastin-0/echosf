<script lang="ts">
	import { setVideoStream } from '$lib/helpers/video';
	import { fly } from 'svelte/transition';
	import Avatar from './Avatar.svelte';
	export let stream: MediaStream;
	export let isLocal: boolean = false;
	export let isExpanded: boolean = false;
	export let onExpand: (id: string) => void;
	export let id: string;
	export let owner: string;
	export let isMuted: boolean = false;
	export let isCameraOpen: boolean = false;
	export let audioLevel: number = 0;
</script>

<div
	class="group relative flex h-fit items-center justify-center p-1 transition-all duration-200"
	in:fly={{ y: 100, opacity: 1 }}
	out:fly={{ opacity: 1 }}
>
	<div
		class="absolute inset-0 rounded-lg bg-[var(--accent)] opacity-0 transition-opacity duration-200"
		style="opacity: {audioLevel};"
	></div>

	<video
		use:setVideoStream={stream}
		class="relative w-auto rounded-lg {isExpanded ? 'max-h-[75vh]' : 'max-h-[150px]'}"
		autoplay
		muted={isLocal}
	>
		<track kind="captions" />
	</video>

	<Avatar {owner} {audioLevel} {isCameraOpen} />

	<div class="absolute bottom-3 left-4 flex items-center justify-center gap-1">
		<div class="flex h-4 w-4 items-center justify-center">
			<i class="fa-solid" class:fa-microphone={!isMuted} class:fa-microphone-slash={isMuted}></i>
		</div>
		<span>{owner !== 'undefined' ? owner : 'You'}</span>
	</div>

	<button
		class="absolute right-4 bottom-3 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer"
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
