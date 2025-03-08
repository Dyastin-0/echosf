import { writable } from 'svelte/store';

export const roomInfoStore = writable<{
	id: string | null;
	userName: string | null;
	userId: string | null;
	joined: boolean;
}>({
	id: null,
	userName: null,
	userId: crypto.randomUUID(),
	joined: false
});
