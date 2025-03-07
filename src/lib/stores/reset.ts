import { get } from 'svelte/store';
import { mediaStore } from './mediaStore';
import { roomInfoStore } from './roomStore';
import { uiStore } from './uiStore';
import { messagesStore } from './messagesStore';

export function resetRoomState() {
	const media = get(mediaStore);

	roomInfoStore.set({
		room: null,
		name: null,
		joined: false,
		id: crypto.randomUUID()
	});

	uiStore.set({
		showChat: false
	});

	mediaStore.set({
		localStream: media?.localStream,
		mediaSate: {
			isCameraOn: true,
			isMuted: false,
			isScreenSharing: false
		},
		remoteStreams: []
	});

	messagesStore.set([]);
}
