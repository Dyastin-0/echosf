import { writable } from 'svelte/store';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
  duration?: number;
}

const initialState: Toast = {
  message: '',
  type: 'info',
  isVisible: false,
  duration: 3000
};

export const toastStore = writable<Toast>(initialState);

export function showToast(message: string, type: Toast['type'], duration?: number) {
  toastStore.set({ message, type, isVisible: true, duration });
  setTimeout(() => {
    toastStore.update((state) => ({ ...state, isVisible: false }));
  }, duration || initialState.duration);
}

export function hideToast() {
  toastStore.update((state) => ({ ...state, isVisible: false }));
}
