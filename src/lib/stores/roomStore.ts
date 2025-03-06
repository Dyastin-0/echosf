import { get, writable } from 'svelte/store';

export const roomInfoStore = writable<{
	room: string | null;
	name: string | null;
	joined: boolean;
}>({
	room: null,
	name: null,
	joined: false
});

export const uiStore = writable<{
	showChat: boolean;
}>({
	showChat: false
});

export const mediaStore = writable<{
	localStream: MediaStream | null;
	mediaSate: App.MediaState | null;
	videos: Array<{ id: string; stream: MediaStream; kind: string }>;
}>({
	localStream: null,
	mediaSate: {
		isCameraOn: true,
		isMuted: false,
		isScreenSharing: false
	},
	videos: []
});

export const messagesStore = writable<App.WebsocketMessage[]>([]);

export function resetRoomState() {
	const media = get(mediaStore);

	roomInfoStore.set({
		room: null,
		name: null,
		joined: false
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
		videos: []
	});

	messagesStore.set([]);
}
