<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { messagesStore } from '$lib/stores/messagesStore';
	import { uiStore } from '$lib/stores/uiStore';

	$: showChat = $uiStore.showChat;
	$: messages = $messagesStore;

	export let onSendMessage: (msg: any) => void;

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
	class="h-[500px] w-[400px] flex-col gap-4 rounded-md bg-[var(--bg-secondary)] p-4"
	class:flex={showChat}
	class:hidden={!showChat}
>
	<h1 class="text-center font-semibold">Chat</h1>
	<div class="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto">
		{#each messages as message}
			<ChatMessage {message} />
		{/each}
	</div>
	<form class="flex rounded-full bg-[var(--bg-primary)]" on:submit={sendMessage}>
		<input name="chatInput" class="w-full p-4 outline-none" placeholder="Send a message" />
		<button
			class="flex min-h-14 min-w-14 items-center justify-center rounded-full p-4 hover:bg-[var(--accent)]"
			type="submit"
			aria-label="send message button"
		>
			<i class="fa-solid fa-paper-plane"></i>
		</button>
	</form>
</section>
