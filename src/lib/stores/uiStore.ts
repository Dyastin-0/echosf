import { writable } from 'svelte/store';

export const uiStore = writable<{
	showChat: boolean;
	showParticipants: boolean;
}>({
	showChat: false,
	showParticipants: false
});

export function toggleChat() {
	uiStore.update((store) => ({
		...store,
		showChat: !store.showChat
	}));
}

export function toggleParticipants() {
	uiStore.update((store) => ({
		...store,
		showParticipants: !store.showParticipants
	}));
}
