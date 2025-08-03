import { writable } from 'svelte/store';

export const alertStore = writable<{
  message: string;
  isVisible: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
}>({
  message: '',
  isVisible: false,
  type: 'info'
});

export function showAlert(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) {
  alertStore.set({ message, isVisible: true, type });

  setTimeout(() => {
    hideAlert();
  }, 3000);
}

export function hideAlert() {
  alertStore.update((state) => ({ ...state, isVisible: false }));
}
