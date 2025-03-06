<script lang="ts">
	import { mediaStore } from '$lib/stores/mediaStore';
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { uiStore } from '$lib/stores/uiStore';

	export let leaveRoom: () => void;
	export let toggleMute: () => void;
	export let toggleCamera: () => void;
	export let toggleScreenShare: () => void;
	export let toggleChat: () => void;

	$: joined = $roomInfoStore.joined;
	$: showChat = $uiStore.showChat;
	$: mediaState = $mediaStore.mediaSate;
</script>

<div class="bottom-4 flex w-full justify-center gap-4">
	<button
		on:click={toggleMute}
		class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
		aria-label="toggle audio"
	>
		<i
			class="fa-solid text-lg"
			class:fa-microphone={!mediaState?.isMuted}
			class:fa-microphone-slash={mediaState?.isMuted}
		></i>
	</button>
	<button
		on:click={toggleCamera}
		class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
		aria-label="toggle camera"
	>
		<i
			class="fa-solid text-lg"
			class:fa-video={mediaState?.isCameraOn}
			class:fa-video-slash={!mediaState?.isCameraOn}
		></i>
	</button>
	<button
		on:click={toggleChat}
		class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
		class:text-[var(--highlight)]={showChat}
		class:text-[var(--text-primary)]={!showChat}
		aria-label="toggle chat"
	>
		<i class="fa-solid fa-message text-lg"></i>
	</button>
	<button
		on:click={toggleScreenShare}
		class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
		aria-label="toggle screen share"
	>
		<i
			class="fa-solid text-lg"
			class:text-[var(--red)]={mediaState?.isScreenSharing}
			class:text-[var(--text-primary)]={!mediaState?.isScreenSharing}
			class:fa-desktop={!mediaState?.isScreenSharing}
			class:fa-stop={mediaState?.isScreenSharing}
		></i>
	</button>
	{#if joined && leaveRoom}
		<button
			on:click={leaveRoom}
			class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
			aria-label="leave room"
		>
			<i class="fa-solid fa-phone rotate-[135deg] text-lg text-[var(--red)]"></i>
		</button>
	{/if}
</div>
