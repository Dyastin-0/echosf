import { get } from 'svelte/store';
import { goto } from '$app/navigation';
import { newWRTC } from '$lib/services/webrtc';
import { newWS } from '$lib/services/websocket';
import { PUBLIC_WEBSOCKET_URL } from '$env/static/public';
import { roomInfoStore } from '$lib/stores/roomStore';
import { resetRoomState } from '$lib/stores/reset';
import { mediaStore } from '$lib/stores/mediaStore';
import { messagesStore } from '$lib/stores/messagesStore';
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
				remoteStreams: [stream]
			}));

			webrtc.setLocalTracks(stream);
		} catch (error) {
			console.error('Error accessing media devices:', error);
		}
	}

	async function joinRoom(roomId: string | null, name: string | null, id: string | null) {
		await goto(`?room=${roomId}`);
		document.title = `echos - ${roomId}`;

		websocket = newWS(`${PUBLIC_WEBSOCKET_URL}?room=${roomId}&id=${id}`, webrtc);

		setupWebRTCCallbacks(webrtc, websocket, id);
		roomInfoStore.update((state) => ({
			...state,
			joined: true,
			id: roomId,
			userName: name,
			userId: id
		}));

		mediaStore.update((state) => {
			const updatedRemoteStreamStates = { ...state.remoteStreamStates };
			const localStream = get(mediaStore).localStream;
			const roomInfo = get(roomInfoStore);

			if (!localStream)
				return {
					...state
				};

			updatedRemoteStreamStates[localStream.id] = {
				ownerId: String(roomInfo.userId),
				owner: String(roomInfo.userName),
				audio: localStream?.getAudioTracks()[0]?.enabled ? 'enabled' : 'disabled',
				video: localStream?.getVideoTracks()[0]?.enabled ? 'enabled' : 'disabled'
			};

			return {
				...state,
				remoteStreamStates: updatedRemoteStreamStates
			};
		});
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

				const newStreams = streamExists ? state.remoteStreams : [...state.remoteStreams, stream];

				stream.onremovetrack = (removeEvent) => {
					if (removeEvent.track.id === event.track.id) {
						mediaStore.update((state) => {
							const updatedRemoteStreamStates = { ...state.remoteStreamStates };

							delete updatedRemoteStreamStates[stream.id];

							return {
								...state,
								remoteStreamStates: updatedRemoteStreamStates,
								remoteStreams: state.remoteStreams.filter((s) => s.id !== stream.id)
							};
						});
					}
				};

				return { ...state, remoteStreams: newStreams };
			});
		});

		websocket.setChatMessageCallback((msg: App.WebsocketMessage) => {
			if (msg.id === id) return;
			if (msg?.type) {
				switch (msg.type) {
					case 'left':
					case 'join': {
						showToast(`${msg.name} ${msg.data}`, 'info');
						messagesStore.update((messages) => [...messages, msg]);
						break;
					}

					case 'audioToggle': {
						mediaStore.update((state) => {
							const streamId = msg.data;
							const updatedStates = { ...state.remoteStreamStates };

							if (!updatedStates[streamId]) {
								updatedStates[streamId] = { audio: 'unknown' };
							}

							updatedStates[streamId].audio = msg.state ? 'enabled' : 'disabled';

							return {
								...state,
								remoteStreamStates: updatedStates
							};
						});
						break;
					}

					case 'cameraToggle': {
						mediaStore.update((state) => {
							const streamId = msg.data;
							const updatedStates = { ...state.remoteStreamStates };

							if (!updatedStates[streamId]) {
								updatedStates[streamId] = { video: 'unknown' };
							}

							updatedStates[streamId].video = msg.state ? 'enabled' : 'disabled';

							return {
								...state,
								remoteStreamStates: updatedStates
							};
						});
						break;
					}

					case 'initialStates': {
						const { data, audioState, videoState, name, target } = msg;

						mediaStore.update((prevState) => {
							const updatedRemoteStreamStates = { ...prevState.remoteStreamStates };

							if (!updatedRemoteStreamStates[data]) {
								updatedRemoteStreamStates[data] = {
									audio: 'unknown',
									video: 'unknown',
									ownerId: '',
									owner: ''
								};
							}

							updatedRemoteStreamStates[data].audio = audioState ? 'enabled' : 'disabled';
							updatedRemoteStreamStates[data].video = videoState ? 'enabled' : 'disabled';
							updatedRemoteStreamStates[data].owner = name || '';
							updatedRemoteStreamStates[data].ownerId = target || '';

							return {
								...prevState,
								remoteStreamStates: updatedRemoteStreamStates
							};
						});
						break;
					}

					case 'stateRequest': {
						websocket.sendMessage({
							event: 'message',
							type: 'stateAnswer',
							data: get(mediaStore).localStream?.id,
							target: msg.target,
							name: get(roomInfoStore).userName,
							audioState: get(mediaStore).localStream?.getAudioTracks()[0]?.enabled,
							videoState: get(mediaStore).localStream?.getVideoTracks()[0]?.enabled
						});
						break;
					}

					case 'stateAnswer': {
						if (msg?.target !== get(roomInfoStore).userId) return;

						const { id, data, audioState, videoState, name } = msg;

						mediaStore.update((state) => {
							const updatedStates = { ...state.remoteStreamStates };

							if (!updatedStates[data]) {
								updatedStates[data] = {
									audio: 'unknown',
									video: 'unknown',
									owner: '',
									ownerId: ''
								};
							}

							updatedStates[data].audio = audioState ? 'enabled' : 'disabled';
							updatedStates[data].video = videoState ? 'enabled' : 'disabled';
							updatedStates[data].owner = name || '';
							updatedStates[data].ownerId = id || '';

							return {
								...state,
								remoteStreamStates: updatedStates
							};
						});
						break;
					}

					default: {
						break;
					}
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

		websocket.sendMessage({
			id: get(roomInfoStore).userId,
			event: 'message',
			type: 'left',
			data: 'Left the room 🤷‍♂️',
			name: get(roomInfoStore).userName
		});

		webrtc.reset();
		resetRoomState();
		flowStep.set('create');
	}

	function sendChatMessage(message: string) {
		messagesStore.update((state) => [
			...state,
			{
				event: 'message',
				data: message,
				name: get(roomInfoStore).userName,
				id: get(roomInfoStore).userId
			}
		]);

		websocket.sendMessage({
			event: 'message',
			data: message,
			name: get(roomInfoStore).userName,
			id: get(roomInfoStore).userId,
			type: '',
			target: ''
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
		if (!get(roomInfoStore).joined) return;

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

	return {
		initMedia,
		joinRoom,
		leaveRoom,
		sendChatMessage,
		toggleCamera,
		toggleMute,
		toggleScreenShare,
		getWebRTC: () => webrtc,
		getWebSocket: () => websocket
	};
}
