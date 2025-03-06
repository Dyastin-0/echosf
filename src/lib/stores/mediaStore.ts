import { writable } from 'svelte/store';

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
