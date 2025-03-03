<script>
  export let localStream;
  let videoRef;

  $: if (videoRef && localStream) {
    videoRef.srcObject = localStream;
  }
</script>

<video
  bind:this={videoRef}
  class="absolute bottom-4 right-4 object-cover h-[100px] rounded-lg border border-[var(--accent)] aspect-video z-50"
  muted
  autoplay
></video>
