import { get } from 'svelte/store';
import { showToast } from '$lib/stores/toastStore';
import { mediaStore } from '$lib/stores/mediaStore';
import { roomInfoStore } from '$lib/stores/roomStore';
import type { WRTC } from './webrtc';

export async function getAvailableMedia(): Promise<MediaStream | null> {
	try {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const hasVideo = devices.some((device) => device.kind === 'videoinput');
		const hasAudio = devices.some((device) => device.kind === 'audioinput');

		if (!hasVideo) showToast('Video device missing', 'warning', 3000);
		if (!hasAudio) showToast('Audio device missing', 'warning', 3000);

		return await navigator.mediaDevices.getUserMedia({
			video: hasVideo,
			audio: hasAudio
		});
	} catch (error) {
		console.error('Failed to get media devices: ', error);
		return null;
	}
}

export function handleNoMediaAvailable() {
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
}

export function updateMediaStoreWithLocalStream(stream: MediaStream) {
	mediaStore.update((state) => ({
		...state,
		localStream: stream,
		remoteStreams: {
			[`${stream.id}`]: stream
		}
	}));
}

export function updateParticipantMediaState(stream: MediaStream) {
	roomInfoStore.update((state) => {
		const updatedParticipants = state.participants;
		if (!updatedParticipants) return { ...state };

		const roomInfo = get(roomInfoStore);
		const participant = updatedParticipants[roomInfo.userId];

		updatedParticipants[roomInfo.userId] = {
			...participant,
			audio: getTrackState(stream.getAudioTracks()[0]),
			camera: getTrackState(stream.getVideoTracks()[0]),
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
}

export function addLocalTracksToWebRTC(webrtc: WRTC) {
	const localStream = get(mediaStore).localStream;

	if (localStream) {
		localStream.getTracks().forEach((track) => {
			webrtc.addTrack(track, localStream);
		});
	}
}

export function getTrackState(track?: MediaStreamTrack): 'enabled' | 'disabled' | 'missing' {
	if (!track) return 'missing';
	return track.enabled ? 'enabled' : 'disabled';
}

export function handleStreamRemoval(stream: MediaStream) {
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
