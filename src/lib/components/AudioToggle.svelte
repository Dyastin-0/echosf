<script lang="ts">
  import { roomInfoStore } from "$lib/stores/roomStore";

  export let toggleMute: () => void;

  $: mediaState = $roomInfoStore.participants[$roomInfoStore.userId];
</script>

<button
  on:click={toggleMute}
  class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--accent)] md:h-12 md:w-12"
  aria-label="toggle audio"
>
  <i
    class="fa-solid text-lg max-md:text-base"
    class:fa-microphone={mediaState?.audio === "enabled"}
    class:fa-microphone-slash={mediaState?.audio === "disabled" ||
      mediaState?.audio === "missing"}
    class:text-[var(--red)]={mediaState?.audio === "missing"}
  ></i>
</button>
