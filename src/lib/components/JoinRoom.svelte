<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { flowStep } from '$lib/stores/flowStore';
	import Video from './Video.svelte';
	import Cameratoggle from './Cameratoggle.svelte';
	import AudioToggle from './AudioToggle.svelte';
	import { onMount } from 'svelte';

	export let toggleCamera: () => void;
	export let toggleMute: () => void;
	export let onJoinRoom;
	export let initMedia: () => void;

	onMount(initMedia);

	const goBack = () => {
		$flowStep = 'create';
	};
</script>

<div class="flex w-full max-w-md flex-col gap-4 rounded-lg bg-[var(--bg-secondary)] p-4 shadow-lg">
	<div class="flex items-center justify-center gap-2">
		<h1 class="text-center text-2xl font-bold text-[var(--text-primary)]">Echos</h1>
		<img src="icon.ico" alt="logo" class="h-11 w-11" />
	</div>
	<div class="relative w-full overflow-hidden rounded-lg bg-[var(--bg-tertiary)]">
		<Video height="h-fit" position="static" />
	</div>

	<div class="flex justify-center gap-2 rounded-full bg-[var(--bg-primary)] p-4">
		<Cameratoggle {toggleCamera} />
		<AudioToggle {toggleMute} />
	</div>

	<form on:submit|preventDefault={onJoinRoom} class="flex flex-col gap-4">
		<div class="flex gap-2">
			<p class="text-sm">Meeting code</p>
			<p class="font-medium text-[var(--text-secondary)]">{$roomInfoStore.room}</p>
		</div>

		<div>
			<input
				id="name"
				type="text"
				bind:value={$roomInfoStore.name}
				required
				placeholder="Enter your name"
				class="w-full rounded-md bg-[var(--bg-primary)] p-4 outline-none"
			/>
		</div>

		<div class="flex justify-end gap-2">
			<button
				type="button"
				on:click={goBack}
				class="w-full rounded-full bg-[var(--bg-primary)] p-4 hover:bg-[var(--accent)]"
			>
				Back
			</button>

			<button
				type="submit"
				class="w-full rounded-full bg-[var(--bg-primary)] p-4 hover:bg-[var(--accent)]"
			>
				<i class="fa fa-sign-in-alt mr-2"></i>
				Join Now
			</button>
		</div>
	</form>
</div>
