import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { newWRTC } from '$lib/services/webrtc';
import { newWS } from '$lib/services/websocket';
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import { roomInfoStore } from '$lib/stores/roomStore';
import { resetRoomState } from '$lib/stores/reset';
import { mediaStore } from '$lib/stores/mediaStore';
import { messagesStore } from '$lib/stores/messagesStore';
import { uiStore } from '$lib/stores/uiStore';
import { flowStep } from '$lib/stores/flowStore';
import { showToast } from '$lib/stores/toastStore';

export function useWRTC() {
	let webrtc: ReturnType<typeof newWRTC>;
	let websocket: ReturnType<typeof newWS>;

	async function initMedia() {
		webrtc = newWRTC();

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

			mediaStore.update((state) => ({
				...state,
				localStream: stream,
				remoteStreams: [
					...state.remoteStreams,
					{
						id: stream.id,
						stream: stream,
						isMuted: !stream.getAudioTracks()[0].enabled
					}
				]
			}));

			webrtc.setLocalTracks(stream);
		} catch (error) {
			console.error('Error accessing media devices:', error);
		}
	}

	async function joinRoom(room: string | null, name: string | null, id: string | null) {
		await goto(`?room=${room}`);
		document.title = `echos - ${room}`;

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
				const stream = event.streams[0];
				const streamExists = state.remoteStreams.some((s) => s.id === stream.id);

				const newStreams = streamExists
					? state.remoteStreams
					: [
							...state.remoteStreams,
							{
								id: stream.id,
								stream: stream,
								isMuted: !stream.getAudioTracks()[0]?.enabled
							}
						];

				stream.onremovetrack = (removeEvent) => {
					if (removeEvent.track.id === event.track.id) {
						mediaStore.update((state) => ({
							...state,
							remoteStreams: state.remoteStreams.filter((s) => s.id !== stream.id)
						}));
					}
				};

				return { ...state, remoteStreams: newStreams };
			});
		});

		websocket.setChatMessageCallback((msg: App.WebsocketMessage) => {
			if (msg.id === id) return;
			if (msg?.type) {
				switch (msg.type) {
					case 'join':
						showToast(`${msg.name} ${msg.data}`, 'info');
						messagesStore.update((messages) => [...messages, msg]);
						break;

					case 'audioToggle':
						mediaStore.update((state) => {
							const streamId = msg.data;
							const updatedStates = { ...state.remoteStreamStates };

							if (!updatedStates[streamId]) {
								updatedStates[streamId] = { audio: 'unknown', video: 'unknown' };
							}

							updatedStates[streamId].audio = msg.state ? 'enabled' : 'disabled';

							return {
								...state,
								remoteStreamStates: updatedStates
							};
						});
						break;

					case 'initialAudioState':
						mediaStore.update((state) => {
							const streamId = msg.data;
							const updatedStates = { ...state.remoteStreamStates };

							if (!updatedStates[streamId]) {
								updatedStates[streamId] = { audio: 'unknown', video: 'unknown' };
							}

							updatedStates[streamId].audio = msg.state ? 'enabled' : 'disabled';

							return {
								...state,
								remoteStreamStates: updatedStates
							};
						});
						break;

					case 'audioStateRequest':
						websocket.sendMessage({
							event: 'message',
							type: 'audioStateAnswer',
							data: get(mediaStore).localStream?.id,
							target: msg.target,
							state: get(mediaStore).localStream?.getAudioTracks()[0]?.enabled || false
						});
						break;

					case 'audioStateAnswer':
						if (msg?.target !== get(roomInfoStore).id) return;

						mediaStore.update((state) => {
							const streamId = msg.data;
							const updatedStates = { ...state.remoteStreamStates };

							if (!updatedStates[streamId]) {
								updatedStates[streamId] = { audio: 'unknown', video: 'unknown' };
							}

							updatedStates[streamId].audio = msg.state ? 'enabled' : 'disabled';

							return {
								...state,
								remoteStreamStates: updatedStates
							};
						});
						break;

					default:
						break;
				}
				return;
			}
			messagesStore.update((messages) => [...messages, msg]);
		});

		webrtc.setWebsocketService(websocket);

		const localStream = get(mediaStore).localStream;

		if (localStream)
			localStream.getTracks().forEach((track: MediaStreamTrack) => {
				webrtc.addTrack(track, localStream);
			});
	}

	async function leaveRoom() {
		document.title = 'echos';

		const { id, name } = get(roomInfoStore);
		websocket.sendMessage({ id, event: 'message', data: 'Left the room 🤷‍♂️', name });
		webrtc.reset();
		resetRoomState();
		flowStep.set('create');
	}

	function sendChatMessage(message: string) {
		const { id, name } = get(roomInfoStore);

		messagesStore.update((state) => [
			...state,
			{
				event: 'message',
				data: message,
				name,
				id,
				type: null,
				state: false,
				target: null
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
		initMedia,
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
