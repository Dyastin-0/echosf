import { roomInfoStore } from '$lib/stores/roomStore';
import { showToast } from '$lib/stores/toastStore';
import { get } from 'svelte/store';

export function copyCode() {
  const info = get(roomInfoStore);
  if (info.id) {
    navigator.clipboard.writeText(info.id);
    showToast('Room code copied.', 'info');
  }
}
