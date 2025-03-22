import { writable } from 'svelte/store';

export const roomInfoStore = writable<{
	id: string;
	userName: string;
	userId: string;
	joined: boolean;
	pinnedStream: string;
	streamIdMapper: Record<string, string>;
	participants: Record<string, App.Participant>;
}>({
	id: '',
	userName: '',
	userId: crypto.randomUUID(),
	joined: false,
	pinnedStream: '',
	streamIdMapper: {},
	participants: {}
});
