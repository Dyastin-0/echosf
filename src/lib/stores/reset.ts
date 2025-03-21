import { get } from 'svelte/store';
import { mediaStore } from './mediaStore';
import { roomInfoStore } from './roomStore';
import { uiStore } from './uiStore';
import { messagesStore } from './messagesStore';

export function resetRoomState() {
	const media = get(mediaStore);

	roomInfoStore.set({
		id: '',
		userName: '',
		joined: false,
		userId: crypto.randomUUID(),
		streamIdMapper: {},
		participants: {}
	});

	uiStore.set({
		showChat: false,
		showParticipants: false
	});

	mediaStore.set({
		localStream: media?.localStream,
		remoteStreams: {},
		audioLevels: {}
	});

	messagesStore.set([]);
}
