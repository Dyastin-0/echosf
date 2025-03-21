<script lang="ts">
	import Alert from '$lib/components/Alert.svelte';
	import CreateRoom from '$lib/components/CreateRoom.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { fly } from 'svelte/transition';
</script>

<main
	class="flex h-screen w-full flex-wrap items-center justify-center gap-4 overflow-hidden bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
	in:fly={{ duration: 300, y: 100 }}
	out:fly={{ duration: 200, y: 100 }}
>
	<CreateRoom />
	<Alert />
	<Toast />
</main>
