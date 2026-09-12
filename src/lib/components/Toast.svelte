<script lang="ts">
  import { fade } from "svelte/transition";
  import { toastStore } from "$lib/stores/toastStore";

  $: toast = $toastStore;

  function closeToast() {
    toastStore.update((state) => ({ ...state, isVisible: false }));
  }
</script>

{#if toast.isVisible}
  <div
    transition:fade={{ duration: 200 }}
    class="fixed bottom-4 left-1/2 z-50 flex w-[calc(100vw-2rem)] max-w-xs -translate-x-1/2 items-center justify-center"
  >
    <div
      class="w-full rounded-2xl border border-white/10 bg-[var(--bg-secondary)] p-4 shadow-xl shadow-black/20"
    >
      <p class="mb-1 text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)]">{toast.type}</p>
      <p class="mb-3 text-[var(--text-primary)]">{toast.message}</p>
      <button
        on:click={closeToast}
        class="w-full rounded-full bg-[var(--bg-primary)] p-2 transition hover:bg-[var(--accent)]"
      >
        Close
      </button>
    </div>
  </div>
{/if}
