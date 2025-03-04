<script lang="ts">
	export let remoteVideos: Array<{ id: string; stream: MediaStream; kind: string }>;

	// Directive to set the video stream on the video element.
	function setVideoStream(node: HTMLVideoElement, stream: MediaStream) {
		if (stream) {
			node.srcObject = stream;
		}
		return {
			update(newStream: MediaStream) {
				if (newStream !== node.srcObject) {
					node.srcObject = newStream;
				}
			},
			destroy() {
				node.srcObject = null;
			}
		};
	}

	let expandedId: string | null = null;

	function toggleExpand(videoId: string) {
		expandedId = expandedId === videoId ? null : videoId;
	}
</script>

<div class="flex h-full w-full">
	{#if expandedId}
		<div class="flex h-full w-full gap-4">
			<div class="flex flex-grow items-center justify-center p-4">
				{#each remoteVideos as video (video.id)}
					{#if video.id === expandedId}
						<div class="relative flex max-w-full items-center justify-center">
							<video
								use:setVideoStream={video.stream}
								class="aspect-video max-h-[75vh] w-auto rounded-lg object-cover"
								autoplay
								data-id={video.id}
							>
								<track kind="captions" />
							</video>
							<button
								class="absolute min-h-11 min-w-11 rounded-full bg-black/50 opacity-0 transition-opacity hover:cursor-pointer hover:opacity-100"
								on:click={() => toggleExpand(video.id)}
								aria-label="toggle expand"
							>
								<i class="fa-solid fa-compress"></i>
							</button>
						</div>
					{/if}
				{/each}
			</div>

			<div class="flex flex-col items-center justify-center gap-2 overflow-x-auto">
				{#each remoteVideos as video (video.id)}
					{#if video.id !== expandedId}
						<div class="relative flex items-center justify-center">
							<video
								use:setVideoStream={video.stream}
								class="aspect-video max-h-[100px] w-auto rounded-lg object-cover"
								autoplay
								data-id={video.id}
							>
								<track kind="captions" />
							</video>
							<button
								class="absolute min-h-8 min-w-8 rounded-full bg-black/50 opacity-0 transition-opacity hover:cursor-pointer hover:opacity-100"
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
		<div class="flex w-full flex-wrap items-center justify-center gap-4 p-4">
			{#each remoteVideos as video (video.id)}
				<div class="group relative flex items-center justify-center transition-all">
					<video
						use:setVideoStream={video.stream}
						class="aspect-video max-h-[150px] w-auto rounded-lg object-cover"
						autoplay
						data-id={video.id}
					>
						<track kind="captions" />
					</video>
					<button
						class="absolute min-h-11 min-w-11 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 hover:cursor-pointer"
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
