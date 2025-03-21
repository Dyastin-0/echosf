<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { flowStep } from '$lib/stores/flowStore';
	import Video from './Video.svelte';
	import Cameratoggle from './Cameratoggle.svelte';
	import AudioToggle from './AudioToggle.svelte';
	import { onMount } from 'svelte';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { showAlert } from '$lib/stores/alertStore';
	import { copyCode } from '$lib/helpers/clip';
	import { page } from '$app/state';

	export let toggleCamera: () => void;
	export let toggleMute: () => void;
	export let onJoinRoom;
	export let initMedia: () => void;

	onMount(initMedia);

	$roomInfoStore.id = page.params.room || '';

	const goBack = () => {
		goto('/').then(() => {
			$flowStep = 'create';
			$roomInfoStore.id = '';
		});
	};

	const join = async (e: { preventDefault: () => void }) => {
		e.preventDefault();

		try {
			const response = await fetch(`${PUBLIC_API_URL}/check?room=${$roomInfoStore.id}`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error('Failed to join room.');
			}

			$flowStep = 'join';
			onJoinRoom(e);
		} catch (error) {
			showAlert('Failed to join, room does not exist.', 'info');
			goBack();
		}
	};
</script>

<div class="flex w-full max-w-4xl flex-row gap-4 rounded-lg bg-[var(--bg-secondary)] p-4 shadow-lg">
	<div class="flex w-1/2 flex-col gap-4">
		<div class="relative w-full overflow-hidden rounded-lg bg-[var(--bg-tertiary)]">
			<Video height="h-fit" position="static" />
		</div>

		<div class="flex justify-center gap-2 rounded-full bg-[var(--bg-primary)] p-2">
			<Cameratoggle {toggleCamera} />
			<AudioToggle {toggleMute} />
		</div>
	</div>

	<div class="flex w-1/2 flex-col justify-between gap-4">
		<div class="flex flex-col gap-4">
			<div class="flex items-center justify-center gap-2">
				<h1 class="text-center text-2xl font-bold text-[var(--text-primary)]">Echos</h1>
				<img src="icon.ico" alt="logo" class="h-11 w-11" />
			</div>

			<form onsubmit={join} class="flex flex-col gap-4">
				<div>
					<input
						id="name"
						autocomplete="on"
						type="text"
						bind:value={$roomInfoStore.userName}
						required
						placeholder="Enter your name"
						class="w-full rounded-lg bg-[var(--bg-primary)] p-4 outline-none"
					/>
				</div>

				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={goBack}
						class="w-full rounded-full bg-[var(--bg-primary)] p-4 hover:bg-[var(--accent)]"
					>
						<i class="fa fa-arrow-left mr-2"></i>
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

		<div class="flex flex-col gap-2 rounded-lg bg-[var(--bg-primary)] p-4">
			<h2 class="font-semibold text-[var(--text-primary)]">Share Meeting</h2>
			<p class="text-sm text-[var(--text-secondary)]">
				Invite others to join by sharing the meeting code:
			</p>
			<div class="flex items-center gap-2">
				<input
					id="meetingCode"
					type="text"
					readonly
					value={$roomInfoStore.id}
					class="flex-grow rounded-lg bg-[var(--bg-secondary)] p-2 outline-none"
				/>
				<button
					onclick={copyCode}
					class="rounded-lg bg-[var(--bg-secondary)] p-2 hover:bg-[var(--accent)]"
				>
					Copy
				</button>
			</div>
		</div>
	</div>
</div>
