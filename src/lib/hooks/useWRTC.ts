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

	async function getAvailableMedia(): Promise<MediaStream | null> {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();

			const hasVideo = devices.some((device) => device.kind === 'videoinput');
			if (!hasVideo) {
				showToast('Video device missing', 'warning', 3000);
			}

			const hasAudio = devices.some((device) => device.kind === 'audioinput');
			if (!hasAudio) {
				showToast('Audio device missing', 'warning', 3000);
			}

			const constraints: {
				video: boolean;
				audio: boolean;
			} = {
				video: hasVideo,
				audio: hasAudio
			};

			return await navigator.mediaDevices.getUserMedia(constraints);
		} catch (error) {
			console.error('failed to get media devices: ', error);
			return null;
		}
	}

	async function initMedia() {
		webrtc = newWRTC();

		const stream = await getAvailableMedia();

		if (!stream) {
			showToast('No media device available.', 'warning', 3000);

			roomInfoStore.update((state) => {
				const updatedParticipants = state.participants;

				if (!updatedParticipants) return { ...state };

				const roomInfo = get(roomInfoStore);
				const participant = updatedParticipants[roomInfo.userId];

				updatedParticipants[roomInfo.userId] = {
					...participant,
					audio: 'missing',
					camera: 'missing',
					screen: ''
				};

				return {
					...state,
					participants: updatedParticipants
				};
			});
			return;
		}

		mediaStore.update((state) => ({
			...state,
			localStream: stream,
			remoteStreams: {
				[`${stream.id}`]: stream
			}
		}));

		roomInfoStore.update((state) => {
			const updatedParticipants = state.participants;

			if (!updatedParticipants) return { ...state };

			const roomInfo = get(roomInfoStore);
			const participant = updatedParticipants[roomInfo.userId];

			updatedParticipants[roomInfo.userId] = {
				...participant,
				audio: stream.getAudioTracks()[0]?.enabled
					? 'enabled'
					: stream.getAudioTracks()[0]
						? 'disabled'
						: 'missing',
				camera: stream.getVideoTracks()[0]?.enabled
					? 'enabled'
					: stream?.getVideoTracks()[0]
						? 'disabled'
						: 'missing',
				screen: 'disabled',
				streams: {
					[`${stream.id}`]: true
				}
			};

			return {
				...state,
				participants: updatedParticipants
			};
		});

		webrtc.setLocalTracks(stream);
	}

	async function joinRoom(roomId: string, name: string, id: string) {
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

		roomInfoStore.update((state) => {
			const updatedParticipants = state.participants;

			if (!updatedParticipants) return { ...state };

			const roomInfo = get(roomInfoStore);
			const participant = updatedParticipants[roomInfo.userId];

			updatedParticipants[roomInfo.userId] = {
				...participant,
				name: roomInfo.userName
			};

			return {
				...state,
				participants: updatedParticipants
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
				const updatedRemoteStreams = state.remoteStreams;

				updatedRemoteStreams[`${stream.id}`] = stream;

				stream.onremovetrack = (removeEvent) => {
					if (removeEvent.track.id === event.track.id) {
						mediaStore.update((state) => {
							const updatedRemoteStreams = state.remoteStreams;

							delete updatedRemoteStreams[`${stream.id}`];

							return {
								...state,
								remoteStreams: updatedRemoteStreams
							};
						});

						roomInfoStore.update((state) => {
							const updatedMapper = state.streamIdMapper;
							const updatedParticipants = state.participants;

							delete updatedParticipants[updatedMapper[stream.id]];
							delete updatedMapper[stream.id];

							return {
								...state,
								streamIdMapper: updatedMapper,
								participants: updatedParticipants
							};
						});
					}
				};

				return { ...state, remoteStreams: updatedRemoteStreams };
			});
		});

		websocket.setOnOpenCallback(() => {
			websocket.sendMessage({
				id: get(roomInfoStore).userId,
				name: get(roomInfoStore).userName,
				event: 'message',
				data: 'Joined the room 👋',
				type: 'join'
			});

			websocket.sendMessage({
				event: 'message',
				type: 'initialStates',
				audioState: get(mediaStore).localStream?.getAudioTracks()[0]?.enabled,
				videoState: get(mediaStore).localStream?.getVideoTracks()[0]?.enabled,
				name: get(roomInfoStore).userName,
				target: get(roomInfoStore).userId,
				data: get(mediaStore).localStream?.id
			});

			websocket.sendMessage({
				event: 'message',
				data: get(mediaStore).localStream?.id,
				type: 'stateRequest',
				target: get(roomInfoStore).userId
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

					case 'stream': {
						const { data: streamId, name, id } = msg;

						if (!id || !name) break;
						roomInfoStore.update((state) => {
							const updatedParticipants = state.participants;

							updatedParticipants[id] = {
								...updatedParticipants[id],
								screen: streamId,
								streams: {
									...updatedParticipants[id].streams,
									[`${streamId}`]: true
								}
							};

							const updatedMapper = state.streamIdMapper;

							updatedMapper[streamId] = id;

							return {
								...state,
								participants: updatedParticipants,
								streamIdMapper: updatedMapper
							};
						});
						break;
					}

					case 'audioToggle': {
						roomInfoStore.update((state) => {
							const { audioState, id } = msg;
							const updatedStates = state.participants;

							if (!id) return { ...state };

							updatedStates[id] = {
								...updatedStates[id],
								audio: audioState ? 'enabled' : 'disabled'
							};

							return {
								...state,
								participants: updatedStates
							};
						});
						break;
					}

					case 'cameraToggle': {
						roomInfoStore.update((state) => {
							const { videoState, id } = msg;
							const updatedStates = state.participants;

							if (!id) return { ...state };

							updatedStates[id] = {
								...updatedStates[id],
								camera: videoState ? 'enabled' : 'disabled'
							};

							return {
								...state,
								participants: updatedStates
							};
						});
						break;
					}

					case 'initialStates': {
						const {
							data: streamId,
							adData: screenStreamId,
							audioState,
							videoState,
							name,
							target
						} = msg;

						roomInfoStore.update((state) => {
							const updatedParticipants = state.participants;

							if (!target || !name) return { ...state };

							updatedParticipants[target] = {
								camera: videoState ? 'enabled' : 'disabled',
								audio: audioState ? 'enabled' : 'disabled',
								screen: screenStreamId,
								name,
								streams: {
									[`${streamId}`]: true
								}
							};

							const updatedMapper = state.streamIdMapper;

							updatedMapper[streamId] = target;

							return {
								...state,
								streamIdMapper: updatedMapper,
								participants: updatedParticipants
							};
						});
						break;
					}

					case 'stateRequest': {
						websocket.sendMessage({
							event: 'message',
							type: 'stateAnswer',
							data: get(mediaStore).localStream?.id,
							adData: webrtc.screenStream?.id,
							screen: webrtc.screenStream?.id,
							target: msg.target,
							name: get(roomInfoStore).userName,
							audioState: get(mediaStore).localStream?.getAudioTracks()[0]?.enabled,
							videoState: get(mediaStore).localStream?.getVideoTracks()[0]?.enabled
						});
						break;
					}

					case 'stateAnswer': {
						if (msg?.target !== get(roomInfoStore).userId) return;

						const {
							id,
							data: streamId,
							adData: screenStreamId,
							audioState,
							videoState,
							name
						} = msg;

						roomInfoStore.update((state) => {
							const updatedStates = state.participants;

							if (!id || !name) return { ...state };

							updatedStates[id] = {
								camera: videoState ? 'enabled' : 'disabled',
								audio: audioState ? 'enabled' : 'disabled',
								screen: screenStreamId,
								name,
								streams: {
									[`${streamId}`]: true
								}
							};

							if (screenStreamId) {
								updatedStates[id] = {
									...updatedStates[id],
									streams: {
										...updatedStates[id].streams,
										[`${screenStreamId}`]: true
									}
								};
							}

							return {
								...state,
								participants: updatedStates
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
	}

	function toggleCamera() {
		webrtc.toggleVideo();
	}

	async function toggleScreenShare() {
		const roomInfo = get(roomInfoStore);

		if (!roomInfo.joined) return;

		const isCurrentlySharing = webrtc.screenStream;

		if (!isCurrentlySharing) {
			await webrtc.startScreenSharing(() => {
				webrtc.stopScreenSharing();
			});
		} else {
			webrtc.stopScreenSharing();
		}
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
