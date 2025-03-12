import { get } from 'svelte/store';
import { mediaStore } from './mediaStore';
import { roomInfoStore } from './roomStore';
import { uiStore } from './uiStore';
import { messagesStore } from './messagesStore';

export function resetRoomState() {
	const media = get(mediaStore);

	roomInfoStore.set({
		id: null,
		userName: null,
		joined: false,
		userId: crypto.randomUUID()
	});

	uiStore.set({
		showChat: false,
		showParticipants: false
	});

	mediaStore.set({
		localStream: media?.localStream,
		mediaSate: {
			isCameraOn: true,
			isMuted: false,
			isScreenSharing: false
		},
		remoteStreams: [],
		remoteStreamStates: {}
	});

	messagesStore.set([]);
}
