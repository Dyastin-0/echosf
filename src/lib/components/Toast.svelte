<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toastStore } from '$lib/stores/toastStore';

	$: toast = $toastStore;

	function closeToast() {
		toastStore.update((state) => ({ ...state, isVisible: false }));
	}
</script>

{#if toast.isVisible}
	<div
		transition:fade={{ duration: 300 }}
		class="fixed top-4 right-4 flex items-center justify-center"
	>
		<div class="w-[200px] rounded-lg bg-[var(--bg-secondary)] p-4 shadow-lg">
			<p class="mb-2 text-[var(--text-secondary)]">{toast.type}</p>
			<p class="mb-2 text-[var(--text-primary)]">{toast.message}</p>
			<button
				on:click={closeToast}
				class="w-full rounded-full bg-[var(--bg-primary)] p-2 hover:bg-[var(--accent)]"
			>
				Close
			</button>
		</div>
	</div>
{/if}
