<script lang="ts">
	import { roomInfoStore } from '$lib/stores/roomStore';
	import { get } from 'svelte/store';

	export let message: App.WebsocketMessage;

	const { userId } = get(roomInfoStore);
</script>

<div class="rounded-full bg-[var(--bg-primary)] pt-3 pr-6 pb-3 pl-6">
	<p class="text-xs text-[var(--text-secondary)]">
		{userId === message.id ? 'You' : message.name}
	</p>
	<p>{message.data}</p>
</div>
