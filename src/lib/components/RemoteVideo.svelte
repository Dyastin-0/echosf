<script lang="ts">
	import { setVideoStream } from '$lib/helpers/video';
	import { fly } from 'svelte/transition';
	export let stream: MediaStream;
	export let isLocal: boolean = false;
	export let isExpanded: boolean = false;
	export let onExpand: (id: string) => void;
	export let id: string;
	export let owner: string;
	export let isMuted: boolean = false;
	export let audioLevel: number = 0;
</script>

<div
	class="group relative flex h-fit items-center justify-center p-1 transition-all duration-200"
	in:fly={{ y: 100, duration: 200, opacity: 1 }}
	out:fly={{ duration: 200, opacity: 1 }}
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

	<div
		class="absolute top-3 right-3 flex h-6 w-6 items-center justify-center gap-2 rounded-full bg-black/50 text-white"
	>
		{#if !isMuted}
			<i class="fa-solid fa-microphone"></i>
		{:else}
			<i class="fa-solid fa-microphone-slash"></i>
		{/if}
	</div>

	<div class="absolute bottom-3 min-h-6 min-w-6 font-bold">
		{#if owner !== 'undefined'}
			<span>{owner}</span>
		{:else}
			<span>You</span>
		{/if}
	</div>

	<button
		class="absolute right-3 bottom-3 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer"
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
