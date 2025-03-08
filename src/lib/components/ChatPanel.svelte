<script lang="ts">
	import ChatMessage from '$lib/components/ChatMessage.svelte';
	import { messagesStore } from '$lib/stores/messagesStore';
	import { uiStore } from '$lib/stores/uiStore';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { afterUpdate } from 'svelte';

	$: showChat = $uiStore.showChat;
	$: messages = $messagesStore;

	export let onSendMessage: (msg: any) => void;

	let messagesContainer: HTMLDivElement;

	afterUpdate((): void => {
		if (messagesContainer && messages.length > 0) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});

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

<div
	class="h-[500px] flex-shrink-0 overflow-hidden transition-all duration-300 ease-out"
	class:w-[300px]={showChat}
	class:w-[0px]={!showChat}
>
	{#if showChat}
		<section
			class="flex h-full w-[300px] flex-col gap-4 rounded-md bg-[var(--bg-secondary)] p-4"
			in:fly={{ x: 100, duration: 300, opacity: 1, easing: quintOut }}
			out:fly={{ x: 100, duration: 200, opacity: 1 }}
		>
			<h1 class="text-center font-semibold">Chat</h1>
			<div
				bind:this={messagesContainer}
				class="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto"
			>
				{#each messages as message}
					<div in:fly|local={{ y: 20, duration: 200 }}>
						<ChatMessage {message} />
					</div>
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
	{/if}
</div>
