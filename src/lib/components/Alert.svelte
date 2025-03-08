<script lang="ts">
	import { fade } from 'svelte/transition';
	import { alertStore } from '$lib/stores/alertStore';

	$: alert = $alertStore;

	function closeAlert() {
		alertStore.update((state) => ({ ...state, isVisible: false }));
	}
</script>

{#if alert.isVisible}
	<div
		transition:fade={{ duration: 300 }}
		class="fixed inset-0 flex items-center justify-center bg-black/50"
	>
		<div class="rounded-lg bg-[var(--bg-secondary)] p-6 shadow-lg">
			<p class="mb-4 text-[var(--text-secondary)]">{alert.type}</p>
			<p class="mb-4 text-[var(--text-primary)]">{alert.message}</p>
			<button
				on:click={closeAlert}
				class="w-full rounded-full bg-[var(--bg-primary)] p-2 hover:bg-[var(--accent)]"
			>
				Close
			</button>
		</div>
	</div>
{/if}
