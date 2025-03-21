<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { updateParams } from '$lib/helpers/url';
	import { onMount } from 'svelte';
	import { showAlert } from '$lib/stores/alertStore';
	import { goto } from '$app/navigation';

	const createNewRoom = async () => {
		try {
			const response = await fetch(`${PUBLIC_API_URL}/create?room=${$roomInfoStore.id}`, {
				method: 'POST'
			});

			const { room } = await response.json();

			$roomInfoStore.id = room;
			goto(`/${room}`);
		} catch (error) {
			alert('Failed to create, room already exists. Join instead.');
		}
	};

	const handleContinue = async () => {
		if (!$roomInfoStore.id) return;

		try {
			const response = await fetch(`${PUBLIC_API_URL}/check?room=${$roomInfoStore.id}`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			goto(`/${$roomInfoStore.id}`);
		} catch (error) {
			showAlert('Failed to join, room does not exist.', 'info');
			goto('/').then(() => ($roomInfoStore.id = ''));
		}
	};

	onMount(() => {
		if ($roomInfoStore.id) {
			handleContinue();
		}
	});
</script>

<div
	class="flex w-[400px] max-w-md flex-col gap-6 rounded-lg bg-[var(--bg-secondary)] p-6 shadow-lg"
>
	<div class="flex items-center justify-center gap-2">
		<h1 class="text-center text-2xl font-bold text-[var(--text-primary)]">Echos</h1>
		<img src="icon.ico" alt="logo" class="h-11 w-11" />
	</div>

	<div class="flex flex-col gap-4">
		<button
			onclick={createNewRoom}
			class="rounded-full bg-[var(--bg-primary)] p-4 hover:bg-[var(--accent)]"
		>
			<i class="fa fa-plus-circle mr-2"></i>
			Create New Meeting
		</button>

		<span class="text-center font-bold text-[var(--text-secondary)]">or</span>

		<form onsubmit={handleContinue} class="flex flex-col gap-4">
			<div>
				<label for="roomId" class="mb-2 block font-medium text-[var(--text-primary)]"
					>Enter Room Code</label
				>
				<input
					id="roomId"
					type="text"
					bind:value={$roomInfoStore.id}
					required
					autocomplete="on"
					placeholder="Code"
					class="w-full rounded-lg bg-[var(--bg-primary)] p-4 outline-none"
				/>
			</div>

			<button
				type="submit"
				class="rounded-full bg-[var(--bg-primary)] p-4 hover:bg-[var(--accent)]"
			>
				<i class="fa fa-arrow-right mr-2"></i>
				Continue
			</button>
		</form>
	</div>
</div>
