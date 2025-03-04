<script lang="ts">
	import Controls from '$lib/components/Controls.svelte';
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import RemoteVideos from '$lib/components/Videos.svelte';
	import Video from '$lib/components/Video.svelte';
	import { newWRTC } from '$lib/services/webrtc';
	import { newWS } from '$lib/services/websocket';
	import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';

	let room: string;
	let joined = false;

	let localStream: MediaStream | undefined;
	let showChat = false;

	let webrtc: ReturnType<typeof newWRTC>;
	let websocket: ReturnType<typeof newWS>;

	let remoteVideos: Array<{ id: string; stream: MediaStream; kind: string }> = [];
	let messages: App.WebsocketMessage[] = [];

	const leaveRoom = async () => {
		if (localStream) {
			localStream.getTracks().forEach((track) => track.stop());
			localStream = undefined;
		}
		webrtc.stopScreenSharing();
		websocket.close();
		remoteVideos = [];
		messages = [];
		joined = false;
	};

	const joinRoom = async (e: { preventDefault: () => void }) => {
		e.preventDefault();

		if (!webrtc || webrtc.getPeerConnection().connectionState === 'closed') {
			webrtc = newWRTC();
		}

		const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
		localStream = stream;

		webrtc.setOnTrackCallback((event: RTCTrackEvent) => {
			if (event.track.kind === 'audio') return;

			const trackId = event.track.id;
			if (!remoteVideos.some((video) => video.id === trackId)) {
				remoteVideos = [
					...remoteVideos,
					{
						id: trackId,
						stream: event.streams[0],
						kind: event.track.kind
					}
				];
			}

			event.streams[0].onremovetrack = (removeEvent) => {
				if (removeEvent.track.id === event.track.id) {
					remoteVideos = remoteVideos.filter((video) => video.id !== trackId);
				}
			};
		});

		webrtc.setLocalTracks(stream);
		stream.getTracks().forEach((track) => webrtc.addTrack(track, stream));

		websocket = newWS(`${PUBLIC_WEBSOCKET_URL}?room=${room}`, webrtc);
		websocket.setChatMessageCallback((msg: App.WebsocketMessage) => {
			messages = [...messages, msg];
		});

		webrtc.setWebsocketService(websocket);
		joined = true;
	};

	const toggleChat = () => (showChat = !showChat);

	function toggleMute() {
		webrtc.toggleAudio();
		webrtc.mediaState.isMuted = !webrtc.mediaState.isMuted;
	}

	function toggleCamera() {
		webrtc.toggleVideo();
		webrtc.mediaState.isCameraOn = !webrtc.mediaState.isCameraOn;
	}

	async function toggleScreenShare() {
		if (!webrtc.mediaState.isScreenSharing) {
			await webrtc.startScreenSharing(() => {
				webrtc.stopScreenSharing();
				webrtc.mediaState.isScreenSharing = !webrtc.mediaState.isScreenSharing;
			});
		} else {
			webrtc.stopScreenSharing();
		}
		webrtc.mediaState.isScreenSharing = !webrtc.mediaState.isScreenSharing;
	}

	function sendChatMessage(message: string) {
		websocket.sendMessage({ event: 'message', data: message });
	}
</script>

{#if !joined}
	<main
		class="flex h-screen w-full flex-col items-center justify-center bg-[var(--bg-primary)] text-sm text-[var(--text-primary)]"
	>
		<form
			on:submit={joinRoom}
			class="flex flex-col gap-4 rounded bg-[var(--bg-secondary)] p-8 shadow"
		>
			<h1 class="text-center text-2xl font-semibold">Join a Room</h1>
			<input
				bind:value={room}
				name="chatInput"
				class="w-full rounded-md bg-[var(--bg-primary)] p-2 outline-none"
				placeholder="room name"
			/>
			<button type="submit" class="rounded bg-[var(--bg-primary)] p-2 hover:bg-[var(--accent)]">
				Join Room
			</button>
		</form>
	</main>
{:else}
	<main
		class="relative flex h-screen w-full flex-col justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	>
		<div class="relative flex h-full gap-4">
			<RemoteVideos {remoteVideos} />
			<ChatPanel onSendMessage={sendChatMessage} {messages} {showChat} />
			<Video {localStream} />
		</div>

		<Controls
			{leaveRoom}
			{joined}
			{toggleMute}
			{toggleCamera}
			{toggleScreenShare}
			{toggleChat}
			{webrtc}
			{showChat}
		/>
	</main>
{/if}
