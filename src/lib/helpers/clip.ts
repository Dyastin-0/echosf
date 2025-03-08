import { roomInfoStore } from '$lib/stores/roomStore';
import { showToast } from '$lib/stores/toastStore';
import { get } from 'svelte/store';

export function copyCode() {
	const info = get(roomInfoStore);
	if (info.room) {
		console.log('WAW');
		navigator.clipboard.writeText(info.room);
		showToast('Room code copied.', 'info');
	}
}
