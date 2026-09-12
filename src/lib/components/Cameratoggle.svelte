<script lang="ts">
  import { roomInfoStore } from "$lib/stores/roomStore";

  export let toggleCamera: () => void;

  $: mediaState = $roomInfoStore.participants[$roomInfoStore.userId];
</script>

<button
  on:click={toggleCamera}
  class="ctrl-btn hover:bg-[var(--accent)]"
  aria-label="toggle camera"
>
  <i
    class="fa-solid text-lg max-md:text-base"
    class:fa-video={mediaState?.camera === "enabled"}
    class:fa-video-slash={mediaState?.camera === "disabled" ||
      mediaState?.camera === "missing"}
    class:text-[var(--red)]={mediaState?.camera === "missing"}
  ></i>
</button>
