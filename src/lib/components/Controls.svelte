<script>
  export let toggleMute;
  export let toggleCamera;
  export let toggleScreenShare;
  export let webrtc;
  export let toggleChat;
  export let showChat;

  console.log(webrtc?.mediaState);
</script>

<div class="flex w-full justify-center bottom-4 gap-4">
  <button
    on:click={toggleMute}
    class="flex justify-center items-center min-w-14 min-h-14 min-w- p-4 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--accent)]"
    aria-label="toggle audio"
  >
    <i
      class="fa-solid text-lg"
      class:fa-microphone={!webrtc?.mediaState.isMuted}
      class:fa-microphone-slash={webrtc?.mediaState.isMuted}
    ></i>
  </button>
  <button
    on:click={toggleCamera}
    class="flex justify-center items-center min-w-14 min-h-14 p-4 bg-[var(--bg-secondary)] rounded-full hover:bg-[var(--accent)]"
    aria-label="toggle camera"
  >
    <i
      class="fa-solid text-lg"
      class:fa-video={webrtc?.mediaState.isCameraOn}
      class:fa-video-slash={!webrtc?.mediaState.isCameraOn}
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
      class:text-[var(--red)]={webrtc?.mediaState.isScreenSharing}
      class:text-[var(--text-primary)]={!webrtc?.mediaState.isScreenSharing}
      class:fa-desktop={!webrtc?.mediaState.isScreenSharing}
      class:fa-stop={webrtc?.mediaState.isScreenSharing}
    ></i>
  </button>
</div>
