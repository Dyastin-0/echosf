<script lang="ts">
	import { uiStore } from '$lib/stores/uiStore';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { roomInfoStore } from '$lib/stores/roomStore';

	$: showParticipants = $uiStore.showParticipants;
	$: participants = Object.entries($roomInfoStore.participants);
</script>

<div
	class="h-[500px] flex-shrink-0 overflow-hidden transition-all duration-300 ease-out"
	class:w-[300px]={showParticipants}
	class:w-[0px]={!showParticipants}
>
	{#if showParticipants}
		<section
			class="flex h-full w-[300px] flex-col gap-4 rounded-md bg-[var(--bg-secondary)] p-4"
			in:fly={{ x: -100, duration: 300, opacity: 1, easing: quintOut }}
			out:fly={{ x: -100, duration: 200, opacity: 1 }}
		>
			<h1 class="text-center font-semibold">Participants</h1>
			<div class="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto">
				{#each participants as [id, info]}
					<div in:fly|local={{ y: 20, duration: 200 }}>
						<div
							class="hover:bg-opacity-80 flex items-center gap-3 rounded-lg bg-[var(--bg-primary)] p-3"
						>
							<div
								class="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-[var(--accent)]"
							>
								<span>{info.name ? info.name.charAt(0).toUpperCase() : '?'}</span>
							</div>
							<div class="flex w-full justify-between gap-2">
								<span class="font-medium"
									>{`${info.name} ${id === $roomInfoStore.userId ? '(You)' : ''}`}</span
								>
								<div class="flex items-center gap-2 text-sm">
									<i
										class="fa-solid"
										class:fa-microphone={info.audio === 'enabled'}
										class:fa-microphone-slash={info.audio !== 'enabled'}
									></i>
								</div>
							</div>
						</div>
					</div>
				{/each}

				{#if participants.length === 0}
					<div class="flex h-full items-center justify-center opacity-70">No participants yet</div>
				{/if}
			</div>

			<div class="rounded-lg bg-[var(--bg-primary)] p-4">
				<p class="text-center text-sm">
					{participants.length} participant{participants.length !== 1 ? 's' : ''} in the meeting
				</p>
			</div>
		</section>
	{/if}
</div>
