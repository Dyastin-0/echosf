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

  let expandedId = null;

  function toggleExpand(videoId) {
    expandedId = expandedId === videoId ? null : videoId;
  }
</script>

<div class="flex h-full w-full">
  {#if expandedId}
    <div class="flex w-full h-full gap-4">
      <div class="flex-grow flex justify-center items-center p-4">
        {#each remoteVideos as video (video.id)}
          {#if video.id === expandedId}
            <div class="relative flex justify-center items-center max-w-full">
              <video
                use:setVideoStream={video.stream}
                class="object-cover rounded-lg aspect-video max-h-[75vh] w-auto"
                autoplay
                data-id={video.id}
              >
                <track kind="captions" />
              </video>
              <button
                class="absolute min-h-11 min-w-11 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity hover:cursor-pointer"
                on:click={() => toggleExpand(video.id)}
                aria-label="toggle expand"
              >
                <i class="fa-solid fa-compress"></i>
              </button>
            </div>
          {/if}
        {/each}
      </div>

      <div
        class="flex flex-col justify-center items-center gap-2 overflow-x-auto"
      >
        {#each remoteVideos as video (video.id)}
          {#if video.id !== expandedId}
            <div class="relative flex justify-center items-center">
              <video
                use:setVideoStream={video.stream}
                class="object-cover rounded-lg aspect-video max-h-[100px] w-auto"
                autoplay
                data-id={video.id}
              >
                <track kind="captions" />
              </video>
              <button
                class="absolute min-h-8 min-w-8 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity hover:cursor-pointer"
                on:click={() => toggleExpand(video.id)}
                aria-label="toggle expand"
              >
                <i class="fa-solid fa-expand"></i>
              </button>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex flex-wrap justify-center items-center w-full gap-4 p-4">
      {#each remoteVideos as video (video.id)}
        <div
          class="relative flex justify-center items-center group transition-all"
        >
          <video
            use:setVideoStream={video.stream}
            class="object-cover rounded-lg aspect-video max-h-[150px] w-auto"
            autoplay
            data-id={video.id}
          >
            <track kind="captions" />
          </video>
          <button
            class="absolute min-h-11 min-w-11 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer"
            on:click={() => toggleExpand(video.id)}
            aria-label="toggle expand"
          >
            <i class="fa-solid fa-expand"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
