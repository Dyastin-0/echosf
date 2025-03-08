<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { flowStep } from '$lib/stores/flowStore';
	import { useWRTC } from '$lib/hooks/useWRTC';
	import CreateRoom from '$lib/components/CreateRoom.svelte';
	import JoinRoom from '$lib/components/JoinRoom.svelte';
	import RemoteVideos from '$lib/components/Videos.svelte';
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import Controls from '$lib/components/Controls.svelte';
	import { fly } from 'svelte/transition';
	import Alert from '$lib/components/Alert.svelte';
	import Toast from '$lib/components/Toast.svelte';

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
		joinRoom($roomInfoStore.id, $roomInfoStore.userName, $roomInfoStore.userId);
	};
</script>

{#if !$roomInfoStore.joined}
	<main
		class="flex h-screen w-full flex-wrap items-center justify-center gap-4 overflow-hidden bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
		in:fly={{ duration: 300, y: 100 }}
		out:fly={{ duration: 200, y: 100 }}
	>
		{#if $flowStep === 'create'}
			<div in:fly={{ duration: 300, x: -100 }}>
				<CreateRoom />
			</div>
		{:else if $flowStep === 'join'}
			<div in:fly={{ duration: 300, x: 100 }}>
				<JoinRoom {initMedia} {toggleCamera} {toggleMute} onJoinRoom={handleJoinRoom} />
			</div>
		{/if}
		<Alert />
		<Toast />
	</main>
{:else}
	<main
		class="relative flex h-screen w-full flex-col justify-center gap-4 overflow-hidden bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
		in:fly={{ duration: 300, y: 100 }}
		out:fly={{ duration: 200, y: 100 }}
	>
		<div class="relative flex h-full gap-4 overflow-hidden" in:fly={{ duration: 400 }}>
			<div class="flex-grow" in:fly={{ duration: 400, y: 100 }}>
				<RemoteVideos />
			</div>
			<ChatPanel onSendMessage={sendChatMessage} />
		</div>

		<div in:fly={{ y: 20, duration: 300 }} out:fly={{ y: -20, duration: 300 }}>
			<Controls {leaveRoom} {toggleMute} {toggleCamera} {toggleScreenShare} {toggleChat} />
		</div>
		<Alert />
		<Toast />
	</main>
{/if}
