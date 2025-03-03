<script>
  export let toggleMute;
  export let toggleCamera;
  export let toggleScreenShare;
  export let mediaState;
  export let toggleChat;
  export let showChat;
</script>

<div class="absolute bottom-4 flex gap-4">
  <button
    on:click={toggleMute}
    class="flex justify-center items-center min-w-14 min-h-14 min-w- p-4 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--accent)]"
    aria-label="toggle audio"
  >
    <i
      class="fa-solid text-lg"
      class:fa-microphone={!mediaState.isMuted}
      class:fa-microphone-slash={mediaState.isMuted}
    ></i>
  </button>
  <button
    on:click={toggleCamera}
    class="flex justify-center items-center min-w-14 min-h-14 p-4 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--accent)]"
    aria-label="toggle camera"
  >
    <i
      class="fa-solid text-lg"
      class:fa-video={mediaState.isCameraOn}
      class:fa-video-slash={!mediaState.isCameraOn}
    ></i>
  </button>
  <button
    on:click={toggleChat}
    class="flex justify-center items-center min-w-14 min-h-14 p-4 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--accent)]"
    class:text-[var(--highlight)]={showChat}
    class:text-[var(--text-primary)]={!showChat}
    aria-label="toggle chat"
  >
    <i class="fa-solid fa-message text-lg"></i>
  </button>
  <button
    on:click={toggleScreenShare}
    class="flex justify-center items-center min-w-14 min-h-14 p-4 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--accent)]"
    aria-label="toggle screen share"
  >
    <i
      class="fa-solid text-lg"
      class:text-[var(--red)]={mediaState.isScreenSharing}
      class:fa-desktop={!mediaState.isScreenSharing}
      class:fa-stop={mediaState.isScreenSharing}
    ></i>
  </button>
</div>
