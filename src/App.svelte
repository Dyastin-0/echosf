<script>
  import { onMount } from "svelte";
  import { writable, get } from "svelte/store";
  import "@fortawesome/fontawesome-free/css/all.min.css";
  import VideoControls from "./lib/components/Controls.svelte";
  import ChatPanel from "./lib/components/ChatPanel.svelte";
  import RemoteVideos from "./lib/components/Videos.svelte";
  import { newWRTC } from "./lib/services/webrtc.js";
  import { newWS } from "./lib/services/websocket.js";
  import Video from "./lib/components/Video.svelte";

  let localStream;
  let showChat = false;

  const webrtcService = writable(newWRTC());
  const webrtc = get(webrtcService);

  let webSocketService;

  let remoteVideos = [];
  let messages = [];

  onMount(async () => {
    try {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then(async (stream) => {
          localStream = stream;

          webrtc.setOnTrackCallback((event) => {
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

          webrtc.setLocalTracks(stream);
          stream.getTracks().forEach((track) => webrtc.addTrack(track, stream));

          webSocketService = newWS(
            `${import.meta.env.VITE_WEBSOCKET_URL}?room=test`,
            webrtc
          );

          webSocketService.setChatMessageCallback((msg) => {
            messages = [...messages, msg];
          });

          webrtc.setWebsocketService(webSocketService);
        });
    } catch (error) {
      alert(error);
    }
  });

  const toggleChat = () => (showChat = !showChat);

  function toggleMute() {
    webrtc.toggleAudio();
    webrtc.mediaState.isMuted = !webrtc.mediaState.isMuted;
  }

  function toggleCamera() {
    webrtc.toggleVideo();
    webrtc.mediaState.isCameraOn = !webrtc.mediaState.isCameraOn;
  }

  async function toggleScreenShare() {
    if (!webrtc.mediaState.isScreenSharing) {
      await webrtc.startScreenSharing(() => {
        webrtc.stopScreenSharing();
        webrtc.mediaState.isScreenSharing = !webrtc.mediaState.isScreenSharing;
      });
    } else {
      webrtc.stopScreenSharing();
    }
    webrtc.mediaState.isScreenSharing = !webrtc.mediaState.isScreenSharing;
  }

  function sendChatMessage(message) {
    webSocketService.sendMessage({ event: "message", data: message });
  }
</script>

<main
  class="relative flex flex-col justify-center w-full h-screen gap-4 p-4 bg-[var(--bg-primary)] text-sm text-[var(--text-primary)]"
>
  <Video {localStream} />

  <div class="flex h-full gap-4">
    <RemoteVideos {remoteVideos} />
    <ChatPanel onSendMessage={sendChatMessage} {messages} {showChat} />
  </div>

  <VideoControls
    {toggleMute}
    {toggleCamera}
    {toggleScreenShare}
    {toggleChat}
    {webrtc}
    {showChat}
  />
</main>

<style lang="postcss">
  @reference "tailwindcss/theme";

  :global(html) {
    background-color: theme(--color-black);
  }
</style>
