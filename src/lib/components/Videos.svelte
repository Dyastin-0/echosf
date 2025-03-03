<script>
  export let remoteVideos = [];

  function setVideoStream(node, stream) {
    if (stream) {
      node.srcObject = stream;
    }

    return {
      update(newStream) {
        if (newStream !== node.srcObject) {
          node.srcObject = newStream;
        }
      },
      destroy() {
        node.srcObject = null;
      },
    };
  }
</script>

<div class="flex flex-wrap w-full gap-4" id="remoteVideos">
  {#each remoteVideos as video (video.id)}
    <video
      use:setVideoStream={video.stream}
      autoplay
      class="rounded-lg max-h-[200px]"
      data-id={video.id}
    >
      <track kind="captions" />
    </video>
  {/each}
</div>
