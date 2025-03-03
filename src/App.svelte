<script>
  import { onMount } from "svelte";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import VideoControls from "./lib/components/Controls.svelte";
  import ChatPanel from "./lib/components/Chat.svelte";
  import RemoteVideos from "./lib/components/Videos.svelte";
  import { newWRTC } from "./lib/services/webrtc.js";
  import { newWS } from "./lib/services/websocket.js";

  let localVideo;
  let showChat = false;
  let mediaState = {
    isMuted: false,
    isCameraOn: true,
    isScreenSharing: false,
  };

  let webrtcService;
  let webSocketService;

  let remoteVideos = [];
  let messages = [];

  onMount(async () => {
    try {
      webrtcService = newWRTC();

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideo.srcObject = stream;

          webrtcService.setOnTrackCallback((event) => {
            if (event.track.kind === "audio") return;

            const trackId = event.track.id;

            if (!remoteVideos.some((video) => video.id === trackId)) {
              remoteVideos = [
                ...remoteVideos,
                {
                  id: trackId,
                  stream: event.streams[0],
                  kind: event.track.kind,
                },
              ];
            }

            event.streams[0].onremovetrack = (removeEvent) => {
              if (removeEvent.track.id === event.track.id) {
                remoteVideos = remoteVideos.filter(
                  (video) => video.id !== trackId
                );
              }
            };
          });

          webrtcService.setLocalTracks(stream);
          stream
            .getTracks()
            .forEach((track) => webrtcService.addTrack(track, stream));

          webSocketService = newWS(
            `${import.meta.env.VITE_WEBSOCKET_URL}?room=test`,
            webrtcService
          );

          webSocketService.setChatMessageCallback((msg) => {
            messages = [...messages, msg];
          });

          webrtcService.setWebsocketService(webSocketService);
        });
    } catch (error) {
      alert(error);
    }
  });

  const toggleChat = () => (showChat = !showChat);

  function toggleMute() {
    webrtcService.toggleAudio();
    mediaState.isMuted = !mediaState.isMuted;
  }

  function toggleCamera() {
    webrtcService.toggleVideo();
    mediaState.isCameraOn = !mediaState.isCameraOn;
    webrtcService.renegotiate();
  }

  async function toggleScreenShare() {
    if (!mediaState.isScreenSharing) {
      await webrtcService.startScreenSharing();
    } else {
      webrtcService.stopScreenSharing();
    }
    await webrtcService.renegotiate();
    mediaState.isScreenSharing = !mediaState.isScreenSharing;
  }

  function sendChatMessage(message) {
    webSocketService.sendMessage({ event: "message", data: message });
  }
</script>

<main
  class="flex justify-center w-full h-screen gap-4 p-4 bg-[var(--bg-primary)] text-sm text-[var(--text-primary)]"
>
  <video
    bind:this={localVideo}
    class="absolute bottom-4 right-4 h-[100px] rounded-lg border border-[var(--accent)]"
    muted
    autoplay
  ></video>

  <RemoteVideos {remoteVideos} />

  <VideoControls
    {toggleMute}
    {toggleCamera}
    {toggleScreenShare}
    {toggleChat}
    {mediaState}
    {showChat}
  />

  <ChatPanel onSendMessage={sendChatMessage} {messages} {showChat} />
</main>

<style lang="postcss">
  @reference "tailwindcss/theme";

  :global(html) {
    background-color: theme(--color-black);
  }
</style>
