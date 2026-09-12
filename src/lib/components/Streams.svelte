<script lang="ts">
  import { mediaStore } from "$lib/stores/mediaStore";
  import Stream from "$lib/components/Stream.svelte";
  import { roomInfoStore } from "$lib/stores/roomStore";
  import Avatar from "./Avatar.svelte";
  import { fly } from "svelte/transition";
  import { onMount } from "svelte";

  type Tile = { id: string; info: App.Participant; streamId: string | null };
  // Only two modes: grid shows everyone, spotlight pins one tile with a rail.
  type LayoutMode = "auto" | "spotlight";

  // Rail capacity: 2 tiles + the overflow indicator.
  const STRIP_MAX = 2;

  let layoutMode: LayoutMode = "auto";
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

  // Meet-style takeover: a screen share pins itself to the stage the moment
  // it appears, so it shows instantly without manual pinning. Remembers the
  // previous pin and restores it when the share ends — unless the user pinned
  // something else meanwhile, in which case hands off quietly.
  let autoPinnedScreen: string | null = null;
  let preSharePin = "";

  $: {
    const liveScreens = allTiles.filter(
      (t: Tile) => t.streamId !== null && t.info.screen === t.streamId,
    );
    const current = liveScreens.length > 0 ? liveScreens[liveScreens.length - 1].streamId : null;
    if (current && current !== autoPinnedScreen) {
      if (!autoPinnedScreen) preSharePin = pinnedStream;
      autoPinnedScreen = current;
      $roomInfoStore.pinnedStream = current;
    } else if (!current && autoPinnedScreen) {
      if ($roomInfoStore.pinnedStream === autoPinnedScreen) {
        $roomInfoStore.pinnedStream = preSharePin;
      }
      autoPinnedScreen = null;
      preSharePin = "";
    }
  }

  $: restTiles = pinnedStream
    ? allTiles.filter((t: Tile) => t.streamId !== pinnedStream)
    : allTiles;

  // The floating self-view duplicates the local tile, so leave the local
  // tiles out of the rail while it is shown (unless screen sharing, where
  // the screen tile stays in the rail). Culled tiles unmount, but switching
  // layouts never touches the visible set, so videos never flash black.
  $: localSharing =
    !!localTile?.info.screen && localTile.info.screen !== "disabled";

  $: stripPool =
    showFloating && !localSharing
      ? restTiles.filter((t: Tile) => t.id !== $roomInfoStore.userId)
      : restTiles;

  // When overflowing, the "+N" indicator takes the last rail cell.
  $: shownRest =
    layoutMode === "auto" || !focusTile
      ? restTiles
      : stripPool.length > STRIP_MAX
        ? stripPool.slice(0, STRIP_MAX - 1)
        : stripPool.slice(0, STRIP_MAX);

  $: visibleTiles =
    layoutMode === "auto" || !focusTile ? allTiles : [focusTile, ...shownRest];

  $: extraCount =
    layoutMode === "auto" || !focusTile
      ? 0
      : Math.max(0, stripPool.length - shownRest.length);

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

  function isPinned(tile: Tile): boolean {
    return tile.streamId !== null && tile.streamId === pinnedStream;
  }

  function audioLevelFor(tile: Tile): number {
    const sourceId = tile.streamId
      ? ($mediaStore.remoteStreams[tile.streamId]?.getAudioTracks()[0]?.id ?? tile.id)
      : tile.id;
    return Number($mediaStore.audioLevels[sourceId] ?? 0);
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
  class:layout-auto={layoutMode === "auto"}
  class:layout-spotlight={layoutMode === "spotlight"}
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
      title="Grid"
    >
      <i class="fa-solid fa-table-cells-large"></i>
    </button>
    <button
      class="layout-btn"
      class:active={layoutMode === "spotlight"}
      disabled={!pinnedStream}
      onclick={() => layoutMode = "spotlight"}
      title="Spotlight"
    >
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>

  {#if layoutMode === "spotlight" && !focusTile}
    <div class="empty">
      <p class="text-sm text-[var(--text-secondary)]">Pin a tile to spotlight</p>
    </div>
  {:else}
    {#each visibleTiles as tile (tile.streamId ?? tile.id)}
      <div
        class="tile"
        class:tile-pinned={isPinned(tile)}
        in:fly={{ y: 16, opacity: 0, duration: 200 }}
      >
        {#if tile.streamId}
          <Stream
            stream={$mediaStore.remoteStreams[tile.streamId]}
            isExpanded={isPinned(tile)}
            audioLevel={audioLevelFor(tile)}
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

    {#if extraCount > 0}
      <div class="tile more-tile">
        <span class="overflow-count">+{extraCount}</span>
        <span class="overflow-label">more</span>
      </div>
    {/if}
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
    display: grid;
    gap: 8px;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Grid: every tile equal, scrolls when there are many. */
  .layout-auto {
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    grid-auto-rows: minmax(160px, 1fr);
    overflow-y: auto;
    align-content: stretch;
  }

  /* Spotlight (Meet-style): pinned tile takes the whole left, other tiles
     stack in a rail on the right (max 2 + the overflow indicator). */
  .layout-spotlight {
    grid-template-columns: minmax(0, 1fr) 168px;
    grid-auto-rows: minmax(0, 1fr);
    overflow: hidden;
  }

  .layout-spotlight .tile-pinned {
    grid-column: 1;
    grid-row: 1 / -1;
  }

  .layout-spotlight .tile:not(.tile-pinned):not(.more-tile) {
    grid-column: 2;
    /* Rail cells share the column height — cap them so a lone tile
       doesn't stretch into a giant card. */
    max-height: 200px;
  }

  .layout-spotlight .more-tile {
    grid-column: 2;
    max-height: 200px;
  }

  @media (max-width: 640px) {
    .layout-spotlight {
      grid-template-columns: minmax(0, 1fr) 120px;
    }

    .layout-spotlight .tile:not(.tile-pinned):not(.more-tile),
    .layout-spotlight .more-tile {
      max-height: 140px;
    }
  }

  .tile {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    border-radius: 16px;
  }

  .more-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: var(--bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.06);
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

  .mobile-count-badge {
    display: none;
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
    box-shadow: 0 0 12px rgba(63, 131, 196, 0.35);
  }

  .layout-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .avatar-tile {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border-radius: 16px;
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

  .empty {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
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
