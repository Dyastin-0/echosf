<script lang="ts">
  import { roomInfoStore } from "$lib/stores/roomStore";
  import { get } from "svelte/store";

  export let message: App.WebsocketMessage;

  const { userId } = get(roomInfoStore);
</script>

<div class="rounded-2xl bg-[var(--bg-primary)] px-4 py-2.5">
  <p class="text-xs font-medium text-[var(--text-secondary)]">
    {userId === message.id ? "You" : message.name}
  </p>
  <p class="break-words text-[var(--text-primary)]">{message.data}</p>
</div>
