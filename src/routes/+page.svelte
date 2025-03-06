<!-- App.svelte -->
<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { flowStep } from '$lib/stores/flowStore';
	import { useWRTC } from '$lib/hooks/useWRTC';
	import CreateRoom from '$lib/components/CreateRoom.svelte';
	import JoinRoom from '$lib/components/JoinRoom.svelte';
	import RemoteVideos from '$lib/components/Videos.svelte';
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import { onMount } from 'svelte';

	const {
		init,
		joinRoom,
		leaveRoom,
		sendChatMessage,
		toggleCamera,
		toggleChat,
		toggleMute,
		toggleScreenShare
	} = useWRTC();

	onMount(init);

	const handleJoinRoom = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		joinRoom($roomInfoStore.room, $roomInfoStore.name, $roomInfoStore.id);
	};
</script>

{#if !$roomInfoStore.joined}
	<main
		class="flex h-screen w-full flex-wrap items-center justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	>
		{#if $flowStep === 'create'}
			<CreateRoom />
		{:else if $flowStep === 'join'}
			<JoinRoom {toggleCamera} {toggleMute} onJoinRoom={handleJoinRoom} />
		{/if}
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
