<script lang="ts">
	export let message: { id?: string; data: string };
</script>

<div class="rounded-full bg-[var(--bg-primary)] pt-3 pr-4 pb-3 pl-4">
	{#if message.id}
		<p class="text-xs text-[var(--text-secondary)]">{message.id}</p>
	{/if}
	<p>{message.data}</p>
</div>
