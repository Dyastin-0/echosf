<script lang="ts">
  import { mediaStore } from "$lib/stores/mediaStore";
  import Stream from "$lib/components/Stream.svelte";
  import { roomInfoStore } from "$lib/stores/roomStore";
  import Avatar from "./Avatar.svelte";

  type Tile = { id: string; info: App.Participant; streamId: string | null };
  type LayoutMode = "grid" | "sidebar" | "spotlight";

  let layoutMode: LayoutMode = "grid";

  $: participants = Object.entries($roomInfoStore.participants);

  // Flatten all tiles: each stream or avatar-only participant becomes one tile
  $: tiles = participants.flatMap(([id, info]): Tile[] => {
    const streams = Object.entries(info.streams || {});
    if (streams.length > 0) {
      return streams.map(([streamId]): Tile => ({ id, info, streamId }));
    }
    return [{ id, info, streamId: null }];
  });

  $: pinnedStream = $roomInfoStore.pinnedStream;

  // Automatically switch layout mode when a stream is pinned
  $: {
    if (pinnedStream && layoutMode === "grid") {
      layoutMode = "sidebar";
    } else if (!pinnedStream && layoutMode !== "grid") {
      layoutMode = "grid";
    }
  }

  $: pinnedTile = pinnedStream
    ? (tiles.find((t: Tile) => t.streamId === pinnedStream) ?? null)
    : null;
  $: remainingTiles = pinnedStream
    ? tiles.filter((t: Tile) => t.streamId !== pinnedStream)
    : tiles;

  // Computes columns for standard grid mode
  function getGridCols(count: number): number {
    if (count <= 1) return 1;
    if (count <= 2) return 2;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    if (count <= 9) return 3;
    return Math.ceil(Math.sqrt(count));
  }

  $: gridCols = getGridCols(tiles.length);
  $: gridStyle = `grid-template-columns: repeat(${gridCols}, minmax(0, 1fr)); grid-auto-rows: 1fr;`;
</script>

<div class="streams-container">
  <!-- Layout controls (floating pill top-left) -->
  <div class="layout-selector">
    <button
      class="layout-btn"
      class:active={layoutMode === "grid"}
      onclick={() => {
        layoutMode = "grid";
        $roomInfoStore.pinnedStream = "";
      }}
      title="Grid Layout"
    >
      <i class="fa-solid fa-table-cells-large"></i>
    </button>
    <button
      class="layout-btn"
      class:active={layoutMode === "sidebar"}
      disabled={!pinnedStream}
      onclick={() => {
        layoutMode = "sidebar";
      }}
      title="Sidebar Layout"
    >
      <i class="fa-solid fa-rectangle-ad"></i>
    </button>
    <button
      class="layout-btn"
      class:active={layoutMode === "spotlight"}
      disabled={!pinnedStream}
      onclick={() => {
        layoutMode = "spotlight";
      }}
      title="Spotlight Layout"
    >
      <i class="fa-solid fa-expand"></i>
    </button>
  </div>

  {#if layoutMode === "grid" || !pinnedTile}
    <!-- GRID LAYOUT -->
    <div class="tile-grid" style={gridStyle}>
      {#each tiles as tile (tile.streamId ?? tile.id)}
        <div class="grid-cell">
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
    </div>
  {:else if layoutMode === "sidebar"}
    <!-- SIDEBAR/FILMSTRIP LAYOUT -->
    <div class="sidebar-layout">
      <div class="main-focus">
        {#if pinnedTile.streamId}
          <Stream
            stream={$mediaStore.remoteStreams[pinnedTile.streamId]}
            isExpanded={true}
            audioLevel={$mediaStore.audioLevels[
              $mediaStore.remoteStreams[
                pinnedTile.streamId
              ]?.getAudioTracks()[0]?.id
            ]}
            isMuted={pinnedTile.info.audio === "disabled" ||
              pinnedTile.info.audio === "missing"}
            owner={pinnedTile.info.name}
            isScreen={pinnedTile.info.screen === pinnedTile.streamId}
            isCameraOpen={pinnedTile.info.camera === "enabled"}
            ownerId={pinnedTile.id}
          />
        {/if}
      </div>

      {#if remainingTiles.length > 0}
        <div class="filmstrip">
          {#each remainingTiles as tile (tile.streamId ?? tile.id)}
            <div class="filmstrip-cell">
              {#if tile.streamId}
                <Stream
                  stream={$mediaStore.remoteStreams[tile.streamId]}
                  isExpanded={false}
                  audioLevel={Number(
                    $mediaStore.audioLevels[
                      $mediaStore.remoteStreams[
                        tile.streamId
                      ]?.getAudioTracks()[0]?.id
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
    </div>
  {:else if layoutMode === "spotlight"}
    <!-- SPOTLIGHT LAYOUT -->
    <div class="spotlight-layout">
      {#if pinnedTile.streamId}
        <Stream
          stream={$mediaStore.remoteStreams[pinnedTile.streamId]}
          isExpanded={true}
          audioLevel={$mediaStore.audioLevels[
            $mediaStore.remoteStreams[pinnedTile.streamId]?.getAudioTracks()[0]
              ?.id
          ]}
          isMuted={pinnedTile.info.audio === "disabled" ||
            pinnedTile.info.audio === "missing"}
          owner={pinnedTile.info.name}
          isScreen={pinnedTile.info.screen === pinnedTile.streamId}
          isCameraOpen={pinnedTile.info.camera === "enabled"}
          ownerId={pinnedTile.id}
        />
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

  /* ── Layout Controls ── */
  .layout-selector {
    position: absolute;
    top: 12px;
    left: 12px;
    z-index: 100;
    display: flex;
    gap: 6px;
    background: rgba(15, 21, 21, 0.75);
    backdrop-filter: blur(8px);
    padding: 4px;
    border-radius: 9999px;
    border: 1px solid var(--accent);
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
  }

  .layout-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .layout-btn.active {
    background: var(--highlight);
    color: white;
  }

  .layout-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Grid Layout ── */
  .tile-grid {
    display: grid;
    gap: 8px;
    width: 100%;
    height: 100%;
  }

  .grid-cell {
    position: relative;
    width: 100%;
    min-height: 0;
    overflow: hidden;
    border-radius: 12px;
  }

  /* ── Sidebar Layout ── */
  .sidebar-layout {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 8px;
    overflow: hidden;
  }

  .main-focus {
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 12px;
  }

  .filmstrip {
    display: flex;
    flex-direction: row;
    gap: 8px;
    height: 130px;
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 4px;
  }

  .filmstrip-cell {
    position: relative;
    flex-shrink: 0;
    width: calc(130px * 16 / 9);
    height: 100%;
    border-radius: 10px;
    overflow: hidden;
  }

  /* ── Spotlight Layout ── */
  .spotlight-layout {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  /* ── Generic Avatar Tile ── */
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
</style>
