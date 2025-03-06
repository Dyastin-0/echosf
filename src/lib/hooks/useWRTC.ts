import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { newWRTC } from '$lib/services/webrtc';
import { newWS } from '$lib/services/websocket';
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import {
	roomInfoStore,
	uiStore,
	mediaStore,
	messagesStore,
	resetRoomState
} from '$lib/stores/roomStore';

export function useWRTC() {
	let webrtc: ReturnType<typeof newWRTC>;
	let websocket: ReturnType<typeof newWS>;

	async function initializeMedia() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
			mediaStore.update((state) => ({
				...state,
				localStream: stream,
				videos: [
					...state.videos,
					{
						id: 'local',
						stream: stream,
						kind: 'video'
					}
				]
			}));
			return stream;
		} catch (error) {
			console.error('Error accessing media devices:', error);
			return null;
		}
	}

	async function joinRoom(room: string | null, name: string | null, id: string | null) {
		await goto(`?room=${room}`);
		document.title = `echos - ${room}`;

		webrtc = newWRTC();
		websocket = newWS(`${PUBLIC_WEBSOCKET_URL}?room=${room}&id=${id}`, webrtc);

		setupWebRTCCallbacks(webrtc, websocket, id);
		roomInfoStore.update((state) => ({ ...state, joined: true, room, name }));
	}

	function setupWebRTCCallbacks(
		webrtc: ReturnType<typeof newWRTC>,
		websocket: ReturnType<typeof newWS>,
		id: string | null
	) {
		webrtc.setOnTrackCallback((event: RTCTrackEvent) => {
			if (event.track.kind === 'audio') return;

			mediaStore.update((state) => {
				const trackId = event.track.id;
				const newVideos = state.videos.some((video) => video.id === trackId)
					? state.videos
					: [
							...state.videos,
							{
								id: trackId,
								stream: event.streams[0],
								kind: event.track.kind
							}
						];

				event.streams[0].onremovetrack = (removeEvent) => {
					if (removeEvent.track.id === event.track.id) {
						mediaStore.update((state) => ({
							...state,
							videos: state.videos.filter((video) => video.id !== trackId)
						}));
					}
				};

				return { ...state, videos: newVideos };
			});
		});

		const localStream = get(mediaStore).localStream;
		webrtc.setLocalTracks(localStream);
		if (localStream)
			localStream
				.getTracks()
				.forEach((track: MediaStreamTrack) => webrtc.addTrack(track, localStream));

		websocket.setChatMessageCallback((msg: App.WebsocketMessage) => {
			if (msg.id === id) return;
			messagesStore.update((messages) => [...messages, msg]);
		});

		webrtc.setWebsocketService(websocket);
	}

	async function leaveRoom() {
		document.title = 'echos';
		await goto('?');

		const { id, name } = get(roomInfoStore);
		websocket.sendMessage({ id, event: 'message', data: 'Left the room 🤷‍♂️', name });
		webrtc.reset();
		initializeMedia();
		resetRoomState();
	}

	function sendChatMessage(message: string) {
		const { id, name } = get(roomInfoStore);

		messagesStore.update((state) => [
			...state,
			{
				event: 'message',
				data: message,
				name,
				id
			}
		]);

		websocket.sendMessage({
			event: 'message',
			data: message,
			name,
			id: id
		});
	}

	function toggleMute() {
		const state = get(roomInfoStore);
		if (!state.joined) return;

		webrtc.toggleAudio();

		mediaStore.update((store) => {
			const currentMediaState = store.mediaSate || {
				isMuted: false,
				isCameraOn: true,
				isScreenSharing: false
			};

			return {
				...store,
				mediaSate: {
					isMuted: !currentMediaState.isMuted,
					isCameraOn: currentMediaState.isCameraOn,
					isScreenSharing: currentMediaState.isScreenSharing
				}
			};
		});
	}

	function toggleCamera() {
		const state = get(roomInfoStore);
		if (!state.joined) return;

		webrtc.toggleVideo();

		mediaStore.update((store) => {
			const currentMediaState = store.mediaSate || {
				isMuted: false,
				isCameraOn: true,
				isScreenSharing: false
			};

			return {
				...store,
				mediaSate: {
					isMuted: currentMediaState.isMuted,
					isCameraOn: !currentMediaState.isCameraOn,
					isScreenSharing: currentMediaState.isScreenSharing
				}
			};
		});
	}

	async function toggleScreenShare() {
		const state = get(roomInfoStore);
		if (!state.joined) return;

		const isCurrentlySharing = get(mediaStore).mediaSate?.isScreenSharing;

		if (!isCurrentlySharing) {
			await webrtc.startScreenSharing(() => {
				webrtc.stopScreenSharing();
			});
		} else {
			webrtc.stopScreenSharing();
		}

		mediaStore.update((store) => {
			const currentMediaState = store.mediaSate || {
				isMuted: false,
				isCameraOn: true,
				isScreenSharing: false
			};

			return {
				...store,
				mediaSate: {
					isMuted: currentMediaState.isMuted,
					isCameraOn: currentMediaState.isCameraOn,
					isScreenSharing: !isCurrentlySharing
				}
			};
		});
	}

	function toggleChat() {
		uiStore.update((store) => ({
			...store,
			showChat: !store.showChat
		}));
	}

	return {
		initializeMedia,
		joinRoom,
		leaveRoom,
		sendChatMessage,
		toggleCamera,
		toggleChat,
		toggleMute,
		toggleScreenShare,
		getWebRTC: () => webrtc,
		getWebSocket: () => websocket
	};
}
