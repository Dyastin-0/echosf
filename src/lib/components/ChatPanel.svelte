<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte';

	export let onSendMessage: (msg: any) => void;
	export let showChat: boolean;
	export let messages: any[];

	function sendMessage(event: Event) {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const input = form.chatInput as HTMLInputElement;
		const message = input.value.trim();
		if (!message) return;
		onSendMessage(message);
		form.reset();
	}
</script>

<section
	class="h-full w-[400px] flex-col gap-4 rounded-md bg-[var(--bg-secondary)] p-4"
	class:flex={showChat}
	class:hidden={!showChat}
>
	<h1 class="text-center">Chat</h1>
	<div class="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto">
		{#each messages as message}
			<ChatMessage {message} />
		{/each}
	</div>
	<form on:submit={sendMessage}>
		<input
			name="chatInput"
			class="w-full rounded-md bg-[var(--bg-primary)] p-2 outline-none"
			placeholder="Send a message"
		/>
	</form>
</section>
