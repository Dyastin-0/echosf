<script lang="ts">
	import { setVideoStream } from '$lib/helpers/video';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	export let stream: MediaStream;
	export let isLocal: boolean = false;
	export let isExpanded: boolean = false;
	export let onExpand: (id: string) => void;
	export let id: string;
	export let isMuted: boolean = false;
</script>

<div
	class="group relative flex h-fit items-center justify-center transition-all"
	in:fly={{ y: 100, duration: 200, opacity: 1 }}
	out:fly={{ duration: 200, opacity: 1 }}
>
	<video
		use:setVideoStream={stream}
		class="w-auto rounded-lg {isExpanded ? 'max-h-[75vh]' : 'max-h-[150px]'}"
		autoplay
		muted={isLocal}
	>
		<track kind="captions" />
	</video>

	<div
		class="bg-black/ absolute top-2 right-2 flex h-6 w-6 items-center justify-center gap-2 rounded-full text-white"
	>
		{#if !isMuted}
			<i class="fa-solid fa-microphone"></i>
		{:else}
			<i class="fa-solid fa-microphone-slash"></i>
		{/if}
	</div>

	<button
		class="absolute right-2 bottom-2 min-h-6 min-w-6 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer"
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
