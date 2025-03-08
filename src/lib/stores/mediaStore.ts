import { writable } from 'svelte/store';

export const mediaStore = writable<{
	localStream: MediaStream | null;
	mediaSate: App.MediaState | null;
	remoteStreams: Array<{ id: string; stream: MediaStream }>;
	remoteStreamStates: Record<string, Record<string, string>>;
}>({
	localStream: null,
	mediaSate: {
		isCameraOn: true,
		isMuted: false,
		isScreenSharing: false
	},
	remoteStreams: [],
	remoteStreamStates: {}
});
