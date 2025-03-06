import { writable } from 'svelte/store';

export const messagesStore = writable<App.WebsocketMessage[]>([]);
