import { writable } from 'svelte/store';

export const mediaStore = writable<{
	localStream: MediaStream | null;
	remoteStreams: Record<string, MediaStream>;
	audioLevels: Record<string, number>;
}>({
	localStream: null,
	remoteStreams: {},
	audioLevels: {}
});
