<script lang="ts">
  import { setVideoStream } from "$lib/helpers/video";
  import { fly } from "svelte/transition";
  import Avatar from "./Avatar.svelte";
  import Wave from "./Wave.svelte";
  import { roomInfoStore } from "$lib/stores/roomStore";

  export let stream: MediaStream;
  export let isExpanded: boolean = false;
  export let owner: string;
  export let ownerId: string;
  export let isMuted: boolean = false;
  export let isCameraOpen: boolean = false;
  export let audioLevel: number = 0;
  export let isScreen: boolean = false;

  $: isAudioActive = audioLevel > 0.05;
  $: isLocalStream = ownerId === $roomInfoStore.userId;
  $: displayedName = `${ownerId === $roomInfoStore.userId ? "You" : owner} ${isScreen ? "(Presenting)" : ""}`;

  function togglePinnedStream() {
    $roomInfoStore.pinnedStream =
      $roomInfoStore.pinnedStream === stream.id ? "" : stream.id;
  }
</script>

<div
  class="stream-tile group"
  class:audio-active={isAudioActive}
  class:expanded={isExpanded}
  in:fly={{ y: 40, opacity: 0, duration: 220 }}
>
  <div class="video-container">
    <video
      class="video-el"
      class:mirrored={isLocalStream && !isScreen}
      style="object-fit: {isScreen ? 'contain' : 'cover'};"
      use:setVideoStream={stream}
      autoplay
      muted={isMuted || isLocalStream}
    >
      <track kind="captions" />
    </video>
  </div>

  {#if !isScreen}
    <Avatar {owner} {isAudioActive} {isCameraOpen} />
  {/if}

  <!-- Top-right: mute indicator / wave -->
  <div class="indicator-top-right">
    {#if isMuted}
      <i class="fa-solid fa-microphone-slash"></i>
    {:else}
      <Wave isAudioActive={isAudioActive && !isLocalStream} />
    {/if}
  </div>

  <!-- Bottom-left: participant name -->
  <span class="name-label">{displayedName}</span>

  <!-- Bottom-right: pin button (shown on hover) -->
  <button
    class="pin-btn"
    on:click={togglePinnedStream}
    aria-label="toggle expand"
  >
    <i
      class="fa-solid"
      class:fa-thumbtack={!isExpanded}
      class:fa-thumbtack-slash={isExpanded}
    ></i>
  </button>
</div>

<style>
  /* Grid tile: fills its grid cell */
  .stream-tile {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    background: var(--bg-secondary);
    border: 2px solid transparent;
    transition: border-color 0.2s ease;
  }

  .stream-tile.audio-active {
    border-color: var(--highlight);
  }

  /*
	 * Expanded / spotlight: the tile sizes to the video's natural
	 * aspect ratio, constrained by the parent's available space.
	 * The spotlight-main flex container centres it.
	 */
  .stream-tile.expanded {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 16px;
  }

  .video-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .video-el {
    width: 100%;
    height: 100%;
    display: block;
  }

  .indicator-top-right {
    position: absolute;
    top: 8px;
    right: 10px;
    z-index: 10;
  }

  .name-label {
    position: absolute;
    bottom: 8px;
    left: 10px;
    font-size: 0.75rem;
    color: #e2e8f0;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    z-index: 10;
    pointer-events: none;
  }

  .pin-btn {
    position: absolute;
    bottom: 8px;
    right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    padding: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;
    cursor: pointer;
    z-index: 10;
    border: none;
    color: #e2e8f0;
  }

  .stream-tile:hover .pin-btn {
    opacity: 1;
  }
</style>
