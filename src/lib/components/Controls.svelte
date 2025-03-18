<script lang="ts">
	import { copyCode } from '$lib/helpers/clip';
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { toggleChat, toggleParticipants, uiStore } from '$lib/stores/uiStore';
	import AudioToggle from './AudioToggle.svelte';
	import Cameratoggle from './Cameratoggle.svelte';

	export let leaveRoom: () => void;
	export let toggleMute: () => void;
	export let toggleCamera: () => void;
	export let toggleScreenShare: () => void;

	$: joined = $roomInfoStore.joined;
	$: showChat = $uiStore.showChat;
	$: showParticipants = $uiStore.showParticipants;
	$: mediaState = $roomInfoStore.participants[$roomInfoStore.userId];
</script>

<div class="bottom-4 flex w-full justify-between gap-4">
	<button
		class="flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] p-4"
		onclick={copyCode}
	>
		<span>{$roomInfoStore.id}</span>
	</button>
	<div class="flex gap-4">
		<AudioToggle {toggleMute} />
		<Cameratoggle {toggleCamera} />
		<button
			onclick={toggleScreenShare}
			class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
			aria-label="toggle screen share"
		>
			<i
				class="fa-solid text-lg"
				class:text-[var(--red)]={mediaState?.screen !== 'disabled'}
				class:text-[var(--text-primary)]={mediaState?.screen === 'disabled'}
				class:fa-desktop={mediaState?.screen === 'disabled'}
				class:fa-stop={mediaState?.screen !== 'disabled'}
			></i>
		</button>
		{#if joined && leaveRoom}
			<button
				onclick={leaveRoom}
				class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
				aria-label="leave room"
			>
				<i class="fa-solid fa-phone rotate-[135deg] text-lg text-[var(--red)]"></i>
			</button>
		{/if}
	</div>
	<div class="flex gap-2">
		<button
			onclick={toggleParticipants}
			class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
			class:text-[var(--highlight)]={showParticipants}
			class:text-[var(--text-primary)]={!showParticipants}
			aria-label="toggle participants"
		>
			<i class="fa-solid fa-users"></i>
		</button>
		<button
			onclick={toggleChat}
			class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
			class:text-[var(--highlight)]={showChat}
			class:text-[var(--text-primary)]={!showChat}
			aria-label="toggle chat"
		>
			<i class="fa-solid fa-message text-lg"></i>
		</button>
	</div>
</div>
