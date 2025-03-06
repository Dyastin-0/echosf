import { writable } from 'svelte/store';

export const roomInfoStore = writable<{
	room: string | null;
	name: string | null;
	id: string | null;
	joined: boolean;
}>({
	room: null,
	name: null,
	id: crypto.randomUUID(),
	joined: false
});
