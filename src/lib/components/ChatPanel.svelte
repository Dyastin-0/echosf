<script lang="ts">
    import ChatMessage from "$lib/components/ChatMessage.svelte";
  
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
    class="flex-col min-w-[300px] max-h-[400px] bg-[var(--bg-secondary)] gap-4 p-4 rounded-md"
    class:flex={showChat}
    class:hidden={!showChat}
  >
    <h1 class="text-center">Chat</h1>
    <div class="h-full flex flex-col gap-2 overflow-y-auto custom-scrollbar">
      {#each messages as message}
        <ChatMessage {message} />
      {/each}
    </div>
    <form on:submit={sendMessage}>
      <input
        name="chatInput"
        class="outline-none p-2 w-full rounded-md bg-[var(--bg-primary)]"
        placeholder="Send a message"
      />
    </form>
  </section>
  