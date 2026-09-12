<script lang="ts">
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";
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

  let videoEl: HTMLVideoElement;

  $: isAudioActive = audioLevel > 0.05;
  $: isLocalStream = ownerId === $roomInfoStore.userId;
  $: displayedName = `${ownerId === $roomInfoStore.userId ? "You" : owner} ${isScreen ? "(Presenting)" : ""}`;

  // play() can reject when there is no data yet or when the browser blocks
  // audible autoplay (remote tiles arriving mid-call, after any click
  // gesture expired). The rejection used to be swallowed with no retry, so
  // tiles stayed black until something remounted them. Retry on media
  // readiness events and on the next user gesture instead.
  function tryPlay() {
    if (!videoEl) return;
    const attempt = videoEl.play();
    if (attempt) attempt.catch(() => {});
  }

  function attachSource() {
    if (!videoEl) return;
    const next = stream ?? null;
    if (videoEl.srcObject !== next) videoEl.srcObject = next;
    if (next) tryPlay();
  }

  $: videoEl, stream, attachSource();

  onMount(() => {
    const resume = () => tryPlay();
    document.addEventListener("pointerdown", resume);
    document.addEventListener("keydown", resume);
    return () => {
      document.removeEventListener("pointerdown", resume);
      document.removeEventListener("keydown", resume);
    };
  });

  function togglePinnedStream() {
    $roomInfoStore.pinnedStream =
      $roomInfoStore.pinnedStream === stream.id ? "" : stream.id;
  }
</script>

<div
  class="stream-tile group"
  class:audio-active={isAudioActive}
  class:expanded={isExpanded}
  in:fly={{ y: 16, opacity: 0, duration: 220 }}
>
  <div class="video-container">
    <video
      bind:this={videoEl}
      class="video-el"
      class:mirrored={isLocalStream && !isScreen}
      style="object-fit: {isScreen ? 'contain' : 'cover'};"
      autoplay
      playsinline
      muted={isMuted || isLocalStream}
      on:loadedmetadata={tryPlay}
      on:canplay={tryPlay}
    >
      <track kind="captions" />
    </video>
  </div>

  {#if !isScreen}
    <Avatar {owner} {isAudioActive} {isCameraOpen} />
  {/if}

  <div class="top-right">
    {#if isMuted}
      <div class="muted-badge">
        <i class="fa-solid fa-microphone-slash"></i>
      </div>
    {:else}
      <Wave isAudioActive={isAudioActive && !isLocalStream} />
    {/if}
  </div>

  <div class="bottom-bar">
    <span class="name-label">{displayedName}</span>
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
</div>

<style>
  .stream-tile {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary);
    border: 2px solid transparent;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
  }

  .stream-tile.audio-active {
    border-color: var(--highlight);
    box-shadow: inset 0 0 30px rgba(63, 131, 196, 0.05);
  }

  .stream-tile.expanded {
    width: 100%;
    height: 100%;
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

  .top-right {
    position: absolute;
    top: 8px;
    right: 10px;
    z-index: 10;
  }

  .muted-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: var(--red);
    font-size: 0.75rem;
    backdrop-filter: blur(4px);
  }

  .bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
    z-index: 10;
  }

  .name-label {
    font-size: 0.75rem;
    color: #e2e8f0;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    pointer-events: none;
  }

  .pin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.45);
    padding: 5px;
    opacity: 0;
    transition: opacity 0.2s ease, background 0.2s ease;
    cursor: pointer;
    z-index: 10;
    border: none;
    color: #e2e8f0;
    font-size: 0.65rem;
    backdrop-filter: blur(4px);
  }

  .pin-btn:hover {
    background: rgba(63, 131, 196, 0.55);
  }

  @media (hover: hover) {
    .stream-tile:hover .pin-btn {
      opacity: 1;
    }
  }

  @media (hover: none) {
    .pin-btn {
      opacity: 0.6;
    }
  }
</style>
