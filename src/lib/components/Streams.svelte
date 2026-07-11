<script lang="ts">
  import { mediaStore } from "$lib/stores/mediaStore";
  import Stream from "$lib/components/Stream.svelte";
  import { roomInfoStore } from "$lib/stores/roomStore";
  import Avatar from "./Avatar.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  type Tile = { id: string; info: App.Participant; streamId: string | null };
  type LayoutMode = "auto" | "spotlight" | "sidebar";

  let layoutMode: LayoutMode = "auto";
  let maxTiles = 0;
  let isMobile = false;

  let showSelector = false;
  let floatLeft: number | null = null;
  let floatTop: number | null = null;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOrigLeft = 0;
  let dragOrigTop = 0;
  let containerRef: HTMLDivElement;
  let floatRef: HTMLDivElement;

  $: participants = Object.entries($roomInfoStore.participants);

  $: allTiles = participants.flatMap(([id, info]): Tile[] => {
    const streams = Object.entries(info.streams || {});
    if (streams.length > 0) {
      return streams.map(([streamId]): Tile => ({ id, info, streamId }));
    }
    return [{ id, info, streamId: null }];
  });

  $: pinnedStream = $roomInfoStore.pinnedStream;

  $: {
    if (pinnedStream && layoutMode === "auto") {
      layoutMode = "spotlight";
    } else if (!pinnedStream && layoutMode !== "auto") {
      layoutMode = "auto";
    }
  }

  $: focusTile = pinnedStream
    ? (allTiles.find((t: Tile) => t.streamId === pinnedStream) ?? null)
    : null;

  $: remainingTiles = pinnedStream
    ? allTiles.filter((t: Tile) => t.streamId !== pinnedStream)
    : [];

  $: displayTiles = layoutMode === "auto" && maxTiles > 0 && allTiles.length > maxTiles
    ? allTiles.slice(0, maxTiles - 1)
    : allTiles;

  $: overflowCount = layoutMode === "auto" && maxTiles > 0 && allTiles.length > maxTiles
    ? allTiles.length - (maxTiles - 1)
    : 0;

  $: overflowParticipants = layoutMode === "auto" && maxTiles > 0 && allTiles.length > maxTiles
    ? allTiles.slice(maxTiles - 1)
    : [];

  $: localTile = allTiles.find((t: Tile) => t.id === $roomInfoStore.userId) ?? null;

  $: showFloating =
    !isMobile &&
    layoutMode === "spotlight" &&
    focusTile !== null &&
    focusTile.id !== $roomInfoStore.userId &&
    localTile !== null;

  onMount(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    isMobile = mq.matches;
    const handler = (e: MediaQueryListEvent) => { isMobile = e.matches; };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  });

  $: if (isMobile && layoutMode !== "spotlight") {
    layoutMode = "spotlight";
  }

  function toggleSelector(e: Event) {
    if ((e.target as Element)?.closest(".layout-selector, .mobile-count-badge")) return;
    showSelector = !showSelector;
  }

  function startDrag(e: PointerEvent) {
    dragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragOrigLeft = floatLeft ?? 0;
    dragOrigTop = floatTop ?? 0;
    e.preventDefault();
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging || !containerRef || !floatRef) return;
    let newLeft = dragOrigLeft + (e.clientX - dragStartX);
    let newTop = dragOrigTop + (e.clientY - dragStartY);
    const cw = containerRef.clientWidth;
    const ch = containerRef.clientHeight;
    const fw = floatRef.offsetWidth;
    const fh = floatRef.offsetHeight;
    const margin = 8;
    floatLeft = Math.max(margin, Math.min(cw - fw - margin, newLeft));
    floatTop = Math.max(margin, Math.min(ch - fh - margin, newTop));
  }

  function stopDrag() {
    dragging = false;
  }

  function getFloatStream(tile: Tile): MediaStream | undefined {
    return tile.streamId ? $mediaStore.remoteStreams[tile.streamId] : undefined;
  }

  function getFloatAudioLevel(tile: Tile): number {
    if (!tile.streamId) return 0;
    const s = $mediaStore.remoteStreams[tile.streamId];
    if (!s) return 0;
    return Number($mediaStore.audioLevels[s.getAudioTracks()[0]?.id]);
  }
</script>

<svelte:window
  onpointermove={onPointerMove}
  onpointerup={stopDrag}
  onpointerleave={stopDrag}
/>

<div
  class="streams-container"
  bind:this={containerRef}
  onclick={toggleSelector}
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleSelector(e); }}
  role="button"
  tabindex="-1"
>
  <div class="mobile-count-badge">
    <i class="fa-solid fa-user"></i>
    <span>{participants.length}</span>
  </div>
  <div class="layout-selector" class:visible={showSelector}>
      <button
        class="layout-btn"
        class:active={layoutMode === "auto"}
        onclick={() => { layoutMode = "auto"; $roomInfoStore.pinnedStream = ""; }}
        title="Auto grid"
      >
        <i class="fa-solid fa-table-cells-large"></i>
      </button>
      {#if layoutMode === "auto"}
        <div class="selector-divider"></div>
        <button
          class="layout-btn num-btn"
          class:active={maxTiles === 0}
          onclick={() => maxTiles = 0}
          title="No limit"
        >A</button>
        <button
          class="layout-btn num-btn"
          class:active={maxTiles === 1}
          onclick={() => maxTiles = 1}
          title="1 tile"
        >1</button>
        <button
          class="layout-btn num-btn"
          class:active={maxTiles === 2}
          onclick={() => maxTiles = 2}
          title="2 tiles"
        >2</button>
        <button
          class="layout-btn num-btn"
          class:active={maxTiles === 4}
          onclick={() => maxTiles = 4}
          title="4 tiles"
        >4</button>
        <button
          class="layout-btn num-btn"
          class:active={maxTiles === 6}
          onclick={() => maxTiles = 6}
          title="6 tiles"
        >6</button>
        <button
          class="layout-btn num-btn"
          class:active={maxTiles === 9}
          onclick={() => maxTiles = 9}
          title="9 tiles"
        >9</button>
      {/if}
      <button
        class="layout-btn"
        class:active={layoutMode === "spotlight"}
        disabled={!pinnedStream}
        onclick={() => layoutMode = "spotlight"}
        title="Spotlight"
      >
        <i class="fa-solid fa-expand"></i>
      </button>
      <button
        class="layout-btn"
        class:active={layoutMode === "sidebar"}
        disabled={!pinnedStream}
        onclick={() => layoutMode = "sidebar"}
        title="Sidebar"
      >
        <i class="fa-solid fa-rectangle-ad"></i>
      </button>
    </div>

  {#if layoutMode === "auto"}
    <div class="tile-grid">
      {#each displayTiles as tile (tile.streamId ?? tile.id)}
        <div class="grid-cell" in:fly={{ y: 20, opacity: 0, duration: 200 }}>
          {#if tile.streamId}
            <Stream
              stream={$mediaStore.remoteStreams[tile.streamId]}
              isExpanded={false}
              audioLevel={Number(
                $mediaStore.audioLevels[
                  $mediaStore.remoteStreams[tile.streamId]?.getAudioTracks()[0]
                    ?.id
                ],
              )}
              isMuted={tile.info.audio === "disabled" ||
                tile.info.audio === "missing"}
              owner={tile.info.name}
              isScreen={tile.info.screen === tile.streamId}
              isCameraOpen={tile.info.camera === "enabled"}
              ownerId={tile.id}
            />
          {:else}
            <div class="avatar-tile">
              <Avatar
                owner={tile.info.name}
                isCameraOpen={false}
                isAudioActive={tile.info.audio === "enabled" &&
                  Boolean($mediaStore.audioLevels[tile.id]) &&
                  Number($mediaStore.audioLevels[tile.id]) > 0.05}
              />
              <span class="tile-name">{tile.info.name}</span>
            </div>
          {/if}
        </div>
      {/each}

      {#if overflowCount > 0}
        <div class="grid-cell" in:fly={{ y: 20, opacity: 0, duration: 200 }}>
          <div class="overflow-tile">
            <span class="overflow-count">+{overflowCount}</span>
            <span class="overflow-label">more</span>
          </div>
        </div>
      {/if}
    </div>
  {:else if layoutMode === "spotlight"}
    <div class="spotlight-layout">
      {#if focusTile}
        <div class="spotlight-main">
          {#if focusTile.streamId}
            <Stream
              stream={$mediaStore.remoteStreams[focusTile.streamId]}
              isExpanded={true}
              audioLevel={$mediaStore.audioLevels[
                $mediaStore.remoteStreams[focusTile.streamId]?.getAudioTracks()[0]?.id
              ]}
              isMuted={focusTile.info.audio === "disabled" ||
                focusTile.info.audio === "missing"}
              owner={focusTile.info.name}
              isScreen={focusTile.info.screen === focusTile.streamId}
              isCameraOpen={focusTile.info.camera === "enabled"}
              ownerId={focusTile.id}
            />
          {:else}
            <div class="avatar-tile">
              <Avatar
                owner={focusTile.info.name}
                isCameraOpen={false}
                isAudioActive={focusTile.info.audio === "enabled" &&
                  Boolean($mediaStore.audioLevels[focusTile.id]) &&
                  Number($mediaStore.audioLevels[focusTile.id]) > 0.05}
              />
              <span class="tile-name">{focusTile.info.name}</span>
            </div>
          {/if}
        </div>
      {:else}
        <div class="empty">
          <p class="text-sm text-[var(--text-secondary)]">Pin a tile to spotlight</p>
        </div>
      {/if}
    </div>
  {:else if layoutMode === "sidebar"}
    <div class="sidebar-layout">
      {#if focusTile}
        <div class="sidebar-main">
          {#if focusTile.streamId}
            <Stream
              stream={$mediaStore.remoteStreams[focusTile.streamId]}
              isExpanded={true}
              audioLevel={$mediaStore.audioLevels[
                $mediaStore.remoteStreams[focusTile.streamId]?.getAudioTracks()[0]?.id
              ]}
              isMuted={focusTile.info.audio === "disabled" ||
                focusTile.info.audio === "missing"}
              owner={focusTile.info.name}
              isScreen={focusTile.info.screen === focusTile.streamId}
              isCameraOpen={focusTile.info.camera === "enabled"}
              ownerId={focusTile.id}
            />
          {:else}
            <div class="avatar-tile">
              <Avatar
                owner={focusTile.info.name}
                isCameraOpen={false}
                isAudioActive={focusTile.info.audio === "enabled" &&
                  Boolean($mediaStore.audioLevels[focusTile.id]) &&
                  Number($mediaStore.audioLevels[focusTile.id]) > 0.05}
              />
              <span class="tile-name">{focusTile.info.name}</span>
            </div>
          {/if}
        </div>

        {#if remainingTiles.length > 0}
          <div class="strip">
            {#each remainingTiles as tile (tile.streamId ?? tile.id)}
              <div class="strip-cell" in:fly={{ y: 20, opacity: 0, duration: 200 }}>
                {#if tile.streamId}
                  <Stream
                    stream={$mediaStore.remoteStreams[tile.streamId]}
                    isExpanded={false}
                    audioLevel={Number(
                      $mediaStore.audioLevels[
                        $mediaStore.remoteStreams[tile.streamId]?.getAudioTracks()[0]?.id
                      ],
                    )}
                    isMuted={tile.info.audio === "disabled" ||
                      tile.info.audio === "missing"}
                    owner={tile.info.name}
                    isScreen={tile.info.screen === tile.streamId}
                    isCameraOpen={tile.info.camera === "enabled"}
                    ownerId={tile.id}
                  />
                {:else}
                  <div class="avatar-tile">
                    <Avatar
                      owner={tile.info.name}
                      isCameraOpen={false}
                      isAudioActive={tile.info.audio === "enabled" &&
                        Boolean($mediaStore.audioLevels[tile.id]) &&
                        Number($mediaStore.audioLevels[tile.id]) > 0.05}
                    />
                    <span class="tile-name">{tile.info.name}</span>
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="empty">
          <p class="text-sm text-[var(--text-secondary)]">Pin a tile for sidebar view</p>
        </div>
      {/if}
    </div>
  {/if}

  {#if showFloating && localTile}
    {@const lt = localTile}
    <div
      bind:this={floatRef}
      class="float-tile"
      style={floatLeft !== null
        ? `left: ${floatLeft}px; top: ${floatTop}px; right: auto; bottom: auto;`
        : ''}
      onpointerdown={startDrag}
      role="button"
      tabindex="-1"
      aria-label="Your video"
    >
      {#if lt.streamId}
        <Stream
          stream={getFloatStream(lt)!}
          isExpanded={false}
          audioLevel={getFloatAudioLevel(lt)}
          isMuted={lt.info.audio === "disabled" ||
            lt.info.audio === "missing"}
          owner={lt.info.name}
          isScreen={lt.info.screen === lt.streamId}
          isCameraOpen={lt.info.camera === "enabled"}
          ownerId={lt.id}
        />
      {:else}
        <div class="avatar-tile">
          <Avatar
            owner={lt.info.name}
            isCameraOpen={false}
            isAudioActive={lt.info.audio === "enabled" &&
              Boolean($mediaStore.audioLevels[lt.id]) &&
              Number($mediaStore.audioLevels[lt.id]) > 0.05}
          />
          <span class="tile-name">{lt.info.name}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .streams-container {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .layout-selector {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 100;
    display: flex;
    gap: 4px;
    background: rgba(15, 21, 21, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 4px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .streams-container:hover .layout-selector,
  .layout-selector.visible {
    opacity: 1;
    pointer-events: auto;
  }

  @media (max-width: 640px) {
  .mobile-count-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(15, 21, 21, 0.7);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 6px 12px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    color: var(--text-primary);
    font-size: 0.8rem;
    font-weight: 600;
  }

  .layout-selector {
      top: 8px;
      left: 8px;
      right: auto;
    }

    .num-btn {
      display: none;
    }

    .layout-selector:hover .num-btn,
    .layout-selector:focus-within .num-btn {
      display: flex;
    }
  }

  .layout-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.75rem;
    font-weight: 600;
    font-family: inherit;
  }

  @media (max-width: 640px) {
    .layout-btn {
      width: 26px;
      height: 26px;
      font-size: 0.65rem;
    }
  }

  .layout-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .layout-btn.active {
    background: var(--highlight);
    color: white;
    box-shadow: 0 0 12px rgba(77, 170, 252, 0.4);
  }

  .layout-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .selector-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 2px;
    align-self: center;
  }

  .num-btn {
    font-family: inherit;
    font-weight: 700;
    font-size: 0.7rem;
  }

  .tile-grid {
    display: grid;
    gap: 8px;
    width: 100%;
    height: 100%;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-auto-rows: 1fr;
  }

  @media (max-width: 640px) {
    .tile-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: 1fr;
      max-height: 100%;
    }

    .streams-container {
      overflow-y: auto;
    }
  }

  .grid-cell {
    position: relative;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    border-radius: 12px;
    min-height: 120px;
  }

  .spotlight-layout {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .spotlight-main {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 12px;
  }

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .sidebar-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 8px;
    overflow: hidden;
  }

  .sidebar-main {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 12px;
  }

  .strip {
    display: flex;
    flex-direction: row;
    gap: 8px;
    height: 130px;
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  @media (max-width: 640px) {
    .strip {
      height: 80px;
    }
  }

  .strip-cell {
    position: relative;
    flex-shrink: 0;
    width: calc(130px * 16 / 9);
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .strip-cell {
      width: calc(80px * 16 / 9);
    }
  }

  .avatar-tile {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 12px;
    overflow: hidden;
  }

  .tile-name {
    position: absolute;
    bottom: 10px;
    left: 12px;
    font-size: 0.75rem;
    color: var(--text-primary);
    pointer-events: none;
  }

  .float-tile {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 50;
    width: 160px;
    height: 120px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: grab;
    touch-action: none;
    user-select: none;
  }

  .float-tile:active {
    cursor: grabbing;
  }

  .overflow-tile {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--bg-secondary);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .overflow-count {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1;
  }

  .overflow-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 640px) {
    .float-tile {
      width: 120px;
      height: 90px;
      bottom: 12px;
      right: 12px;
    }
  }
</style>
