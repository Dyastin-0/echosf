<script>
  import ChatMessage from "./Message.svelte";

  export let onSendMessage;
  export let showChat;
  export let messages;

  function sendMessage(event) {
    event.preventDefault();
    const message = event.target.chatInput.value.trim();
    if (!message) return;

    onSendMessage(message);
    event.target.reset();
  }
</script>

<section
  class="flex-col min-w-[300px] h-[500px] bg-[var(--bg-secondary)] gap-4 p-4 rounded-md"
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
