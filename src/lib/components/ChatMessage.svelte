<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { get } from 'svelte/store';

	export let message: App.WebsocketMessage;

	const { id } = get(roomInfoStore);
</script>

<div class="rounded-full bg-[var(--bg-primary)] pt-3 pr-4 pb-3 pl-4">
	<p class="text-xs text-[var(--text-secondary)]">
		{id === message.id ? 'You' : message.name}
	</p>
	<p>{message.data}</p>
</div>
