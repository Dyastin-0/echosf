import { writable } from 'svelte/store';

export const uiStore = writable<{
	showChat: boolean;
}>({
	showChat: false
});
