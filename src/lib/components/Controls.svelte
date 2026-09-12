<script lang="ts">
  import { copyCode } from "$lib/helpers/clip";
  import { roomInfoStore } from "$lib/stores/roomStore";
  import { toggleChat, toggleParticipants, uiStore } from "$lib/stores/uiStore";
  import AudioToggle from "./AudioToggle.svelte";
  import Cameratoggle from "./Cameratoggle.svelte";

  export let leaveRoom: () => void;
  export let toggleMute: () => void;
  export let toggleCamera: () => void;
  export let toggleScreenShare: () => void;

  $: joined = $roomInfoStore.joined;
  $: showChat = $uiStore.showChat;
  $: showParticipants = $uiStore.showParticipants;
  $: mediaState = $roomInfoStore.participants[$roomInfoStore.userId];
</script>

<div
  class="no-scrollbar mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-[var(--bg-secondary)]/85 px-2 py-2 shadow-xl shadow-black/20 backdrop-blur-xl"
>
  <button
    class="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--bg-primary)] px-4 transition hover:bg-[var(--accent)] md:h-12"
    onclick={copyCode}
    aria-label="copy room code"
    title="Copy room code"
  >
    <i class="fa-solid fa-copy text-sm"></i>
    <span class="max-w-24 truncate font-mono text-sm max-md:hidden">{$roomInfoStore.id}</span>
  </button>

  <span class="h-6 w-px shrink-0 bg-[var(--accent)]"></span>

  <AudioToggle {toggleMute} />
  <Cameratoggle {toggleCamera} />
  <button
    onclick={toggleScreenShare}
    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--accent)] md:h-12 md:w-12"
    aria-label="toggle screen share"
    title="Share screen"
  >
    <i
      class="fa-solid text-base"
      class:text-[var(--red)]={mediaState?.screen !== "disabled"}
      class:text-[var(--text-primary)]={mediaState?.screen === "disabled"}
      class:fa-desktop={mediaState?.screen === "disabled"}
      class:fa-stop={mediaState?.screen !== "disabled"}
    ></i>
  </button>
  {#if joined && leaveRoom}
    <button
      onclick={leaveRoom}
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--red)] text-white transition hover:brightness-110 md:h-12 md:w-12"
      aria-label="leave room"
      title="Leave"
    >
      <i class="fa-solid fa-phone rotate-[135deg] text-base"></i>
    </button>
  {/if}

  <span class="h-6 w-px shrink-0 bg-[var(--accent)]"></span>

  <button
    onclick={toggleParticipants}
    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--accent)] md:h-12 md:w-12"
    class:text-[var(--highlight)]={showParticipants}
    class:text-[var(--text-primary)]={!showParticipants}
    aria-label="toggle participants"
    title="Participants"
  >
    <i class="fa-solid fa-users text-base"></i>
  </button>
  <button
    onclick={toggleChat}
    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition hover:bg-[var(--accent)] md:h-12 md:w-12"
    class:text-[var(--highlight)]={showChat}
    class:text-[var(--text-primary)]={!showChat}
    aria-label="toggle chat"
    title="Chat"
  >
    <i class="fa-solid fa-message text-base"></i>
  </button>
</div>
