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
	import { fade, slide, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	const {
		initMedia,
		joinRoom,
		leaveRoom,
		sendChatMessage,
		toggleCamera,
		toggleChat,
		toggleMute,
		toggleScreenShare
	} = useWRTC();

	const handleJoinRoom = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		joinRoom($roomInfoStore.room, $roomInfoStore.name, $roomInfoStore.id);
	};
</script>

{#if !$roomInfoStore.joined}
	<main
		class="flex h-screen w-full flex-wrap items-center justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		{#if $flowStep === 'create'}
			<div in:slide={{ duration: 300, delay: 150 }}>
				<CreateRoom />
			</div>
		{:else if $flowStep === 'join'}
			<div in:slide={{ duration: 300, delay: 150 }}>
				<JoinRoom {initMedia} {toggleCamera} {toggleMute} onJoinRoom={handleJoinRoom} />
			</div>
		{/if}
	</main>
{:else}
	<main
		class="relative flex h-screen w-full flex-col justify-center gap-4 overflow-hidden bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
		in:fade={{ duration: 300 }}
		out:fade={{ duration: 200 }}
	>
		<div class="relative flex h-full" in:slide={{ duration: 400, delay: 100, easing: quintOut }}>
			<div class="flex-grow" in:fade={{ duration: 400, delay: 200 }}>
				<RemoteVideos />
			</div>
			<ChatPanel onSendMessage={sendChatMessage} />
		</div>

		<div in:fly={{ y: 20, duration: 300, delay: 400 }}>
			<Controls {leaveRoom} {toggleMute} {toggleCamera} {toggleScreenShare} {toggleChat} />
		</div>
	</main>
{/if}
