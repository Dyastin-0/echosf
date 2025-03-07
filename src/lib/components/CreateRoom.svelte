<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { flowStep } from '$lib/stores/flowStore';
	import { generatecode } from '$lib/helpers/code';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { updateParams } from '$lib/helpers/url';
	import { page } from '$app/state';

	$roomInfoStore.room = page.url.searchParams.get('room');

	const createNewRoom = async () => {
		try {
			const newRoom = generatecode(3, 4, 3);
			$roomInfoStore.room = newRoom;
			await fetch(`${PUBLIC_API_URL}/create?room=${$roomInfoStore.room}`, {
				method: 'POST'
			});

			$flowStep = 'join';
			updateParams({ room: newRoom });
		} catch (error) {
			alert('Failed to create, room already exists. Join instead.');
		}
	};

	const handleContinue = async () => {
		if (!$roomInfoStore.room) return;

		try {
			const response = await fetch(`${PUBLIC_API_URL}/check?room=${$roomInfoStore.room}`, {
				method: 'POST'
			});

			if (!response.ok) {
				throw new Error(`API error: ${response.status} ${response.statusText}`);
			}

			$flowStep = 'join';
		} catch (error) {
			alert(`Failed to join, room not found.`);
			$roomInfoStore.room = '';
		}
	};

	if ($roomInfoStore.room) {
		handleContinue();
	}
</script>

<div class="flex w-full max-w-md flex-col gap-6 rounded-lg bg-[var(--bg-secondary)] p-6 shadow-lg">
	<div class="flex items-center justify-center gap-2">
		<h1 class="text-center text-2xl font-bold text-[var(--text-primary)]">Echos</h1>
		<img src="icon.ico" alt="logo" class="h-11 w-11" />
	</div>

	<div class="flex flex-col gap-4">
		<button
			on:click={createNewRoom}
			class="rounded-full bg-[var(--bg-primary)] p-4 hover:bg-[var(--accent)]"
		>
			<i class="fa fa-plus-circle mr-2"></i>
			Create New Meeting
		</button>

		<span class="text-center font-bold text-[var(--text-secondary)]">or</span>

		<form on:submit|preventDefault={handleContinue} class="flex flex-col gap-4">
			<div>
				<label for="room" class="mb-2 block font-medium text-[var(--text-primary)]"
					>Enter Room Code</label
				>
				<input
					type="text"
					bind:value={$roomInfoStore.room}
					required
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
