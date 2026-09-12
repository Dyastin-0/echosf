<script lang="ts">
  import { fade } from "svelte/transition";
  import { alertStore } from "$lib/stores/alertStore";

  $: alert = $alertStore;

  function closeAlert() {
    alertStore.update((state) => ({ ...state, isVisible: false }));
  }
</script>

{#if alert.isVisible}
  <div
    transition:fade={{ duration: 200 }}
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4"
  >
    <div
      class="w-full max-w-xs rounded-2xl border border-white/10 bg-[var(--bg-secondary)] p-6 shadow-xl shadow-black/20"
    >
      <p class="mb-1 text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)]">{alert.type}</p>
      <p class="mb-4 text-[var(--text-primary)]">{alert.message}</p>
      <button
        on:click={closeAlert}
        class="w-full rounded-full bg-[var(--bg-primary)] p-2 transition hover:bg-[var(--accent)]"
      >
        Close
      </button>
    </div>
  </div>
{/if}
