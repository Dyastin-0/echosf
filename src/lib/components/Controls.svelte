<script lang="ts">
	export let leaveRoom: () => void;
	export let toggleMute: () => void;
	export let toggleCamera: () => void;
	export let toggleScreenShare: () => void;
	export let webrtc: any;
	export let toggleChat: () => void;
	export let showChat: boolean;
	export let joined: boolean;
</script>

<div class="bottom-4 flex w-full justify-center gap-4">
	<button
		on:click={toggleMute}
		class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
		aria-label="toggle audio"
	>
		<i
			class="fa-solid text-lg"
			class:fa-microphone={!webrtc?.mediaState.isMuted}
			class:fa-microphone-slash={webrtc?.mediaState.isMuted}
		></i>
	</button>
	<button
		on:click={toggleCamera}
		class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
		aria-label="toggle camera"
	>
		<i
			class="fa-solid text-lg"
			class:fa-video={webrtc?.mediaState.isCameraOn}
			class:fa-video-slash={!webrtc?.mediaState.isCameraOn}
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
			class:text-[var(--red)]={webrtc?.mediaState.isScreenSharing}
			class:text-[var(--text-primary)]={!webrtc?.mediaState.isScreenSharing}
			class:fa-desktop={!webrtc?.mediaState.isScreenSharing}
			class:fa-stop={webrtc?.mediaState.isScreenSharing}
		></i>
	</button>
	{#if joined && leaveRoom}
		<button
			on:click={leaveRoom}
			class="flex min-h-14 min-w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] p-4 hover:bg-[var(--accent)]"
			aria-label="toggle screen share"
		>
			<i class="fa-solid fa-phone rotate-[135deg] text-lg text-[var(--red)]"></i>
		</button>
	{/if}
</div>
