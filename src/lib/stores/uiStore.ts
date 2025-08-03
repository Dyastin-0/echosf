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
    showParticipants: !store.showChat ? false : store.showParticipants,
    showChat: !store.showChat
  }));
}

export function toggleParticipants() {
  uiStore.update((store) => ({
    showChat: !store.showParticipants ? false : store.showChat,
    showParticipants: !store.showParticipants
  }));
}
