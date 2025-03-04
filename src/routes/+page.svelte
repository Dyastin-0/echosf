<script lang="ts">
	import { goto } from '$app/navigation';
	import Controls from '$lib/components/Controls.svelte';
	import ChatPanel from '$lib/components/ChatPanel.svelte';
	import RemoteVideos from '$lib/components/Videos.svelte';
	import Video from '$lib/components/Video.svelte';
	import { newWRTC } from '$lib/services/webrtc';
	import { newWS } from '$lib/services/websocket';
	import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
	import JoinRoom from '$lib/components/JoinRoom.svelte';

	let room: string | null;
	let name: string | null;
	let joined = false;

	let localStream: MediaStream | null;
	let showChat = false;

	let webrtc: ReturnType<typeof newWRTC>;
	let websocket: ReturnType<typeof newWS>;

	let videos: Array<{ id: string; stream: MediaStream; kind: string }> = [];
	let messages: App.WebsocketMessage[] = [];

	navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
		localStream = stream;
		videos = [
			...videos,
			{
				id: 'local',
				stream: stream,
				kind: 'video'
			}
		];
	});

	const leaveRoom = async () => {
		document.title = 'echos';
		await goto('');

		websocket.sendMessage({ id: name || 'Anonymous', event: 'message', data: 'Left the room 🤷‍♂️' });
		websocket.close();
		webrtc.close();

		videos = [...[]];
		messages = [...[]];
		joined = false;
	};

	const joinRoom = async (e: { preventDefault: () => void }) => {
		e.preventDefault();

		await goto(`?room=${room}`);
		document.title = `echos - ${room}`;

		webrtc = newWRTC();
		websocket = newWS(
			`${PUBLIC_WEBSOCKET_URL}?room=${room}&id=${name || 'Anonymous'}`,
			webrtc,
			name
		);

		webrtc.setOnTrackCallback((event: RTCTrackEvent) => {
			if (event.track.kind === 'audio') return;

			const trackId = event.track.id;
			if (!videos.some((video) => video.id === trackId)) {
				videos = [
					...videos,
					{
						id: trackId,
						stream: event.streams[0],
						kind: event.track.kind
					}
				];
			}

			event.streams[0].onremovetrack = (removeEvent) => {
				if (removeEvent.track.id === event.track.id) {
					videos = videos.filter((video) => video.id !== trackId);
				}
			};
		});

		webrtc.setLocalTracks(localStream);
		if (localStream)
			localStream.getTracks().forEach((track) => webrtc.addTrack(track, localStream));

		websocket.setChatMessageCallback((msg: App.WebsocketMessage) => {
			if (msg.id === name) return;
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
		websocket.sendMessage({
			event: 'message',
			data: message,
			id: null
		});
	}
</script>

{#if !joined}
	<main
		class="flex h-screen w-full flex-wrap items-center justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	>
		<div class="flex flex-wrap justify-center gap-4">
			<JoinRoom {joinRoom} bind:room bind:name />
			<Video {localStream} height="h-[250px]" position="static" />
		</div>
	</main>
{:else}
	<main
		class="relative flex h-screen w-full flex-col justify-center gap-4 bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	>
		<div class="relative flex h-full gap-4">
			<RemoteVideos remoteVideos={videos} />
			<ChatPanel onSendMessage={sendChatMessage} {messages} {showChat} />
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
