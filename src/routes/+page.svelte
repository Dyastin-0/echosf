<script lang="ts">
	import { onMount } from 'svelte';
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { useWRTC } from '$lib/hooks/useWRTC';
	import Controls from '$lib/components/Controls.svelte';
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import RemoteVideos from '$lib/components/Videos.svelte';
	import Video from '$lib/components/Video.svelte';
	import JoinRoom from '$lib/components/JoinRoom.svelte';

	const {
		initializeMedia,
		joinRoom,
		leaveRoom,
		sendChatMessage,
		toggleCamera,
		toggleChat,
		toggleMute,
		toggleScreenShare
	} = useWRTC();

	onMount(initializeMedia);
</script>

{#if !$roomInfoStore.joined}
	<main
		class="flex h-screen w-full flex-wrap items-center justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	>
		<div class="flex flex-wrap justify-center gap-4">
			<JoinRoom
				joinRoom={(e) => {
					e.preventDefault();
					joinRoom($roomInfoStore.room, $roomInfoStore.name, $roomInfoStore.id);
				}}
				bind:room={$roomInfoStore.room}
				bind:name={$roomInfoStore.name}
			/>
			<Video height="h-[250px]" position="static" />
		</div>
	</main>
{:else}
	<main
		class="relative flex h-screen w-full flex-col justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	>
		<div class="relative flex h-full gap-4">
			<RemoteVideos />
			<ChatPanel onSendMessage={sendChatMessage} />
		</div>

		<Controls {leaveRoom} {toggleMute} {toggleCamera} {toggleScreenShare} {toggleChat} />
	</main>
{/if}
