<script lang="ts">
  import { uiStore } from "$lib/stores/uiStore";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { roomInfoStore } from "$lib/stores/roomStore";

  $: showParticipants = $uiStore.showParticipants;
  $: participants = Object.entries($roomInfoStore.participants);

  function getStreamId(id: string, info: App.Participant): string {
    const keys = Object.keys(info.streams);
    return keys.length > 0 ? keys[0] : id;
  }

  function togglePin(id: string, info: App.Participant) {
    const sid = getStreamId(id, info);
    $roomInfoStore.pinnedStream = $roomInfoStore.pinnedStream === sid ? "" : sid;
  }

  function togglePinScreen(info: App.Participant) {
    const sid = info.screen;
    if (!sid || sid === "disabled") return;
    $roomInfoStore.pinnedStream = $roomInfoStore.pinnedStream === sid ? "" : sid;
  }
</script>

<div
  class="flex-shrink-0 overflow-hidden transition-all duration-300 ease-out max-md:w-full md:h-[500px]"
  class:w-[300px]={showParticipants}
  class:w-[0px]={!showParticipants}
>
  {#if showParticipants}
    <section
      class="flex h-full flex-col gap-4 bg-[var(--bg-secondary)] p-4 max-md:w-full md:h-full md:w-[300px] md:rounded-md"
      in:fly={{ x: -100, duration: 300, opacity: 1, easing: quintOut }}
      out:fly={{ x: -100, duration: 200, opacity: 1 }}
    >
      <h1 class="text-center font-semibold">Participants</h1>
      <div class="custom-scrollbar flex h-full flex-col gap-2 overflow-y-auto">
        {#each participants as [id, info]}
          <div in:fly|local={{ y: 20, duration: 200 }}>
            <div
              class="hover:bg-opacity-80 flex items-center gap-3 rounded-lg bg-[var(--bg-primary)] p-3"
            >
              <div
                class="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-[var(--accent)]"
              >
                <span
                  >{info.name ? info.name.charAt(0).toUpperCase() : "?"}</span
                >
              </div>
              <div class="flex w-full items-center justify-between gap-2">
                <span class="font-medium truncate"
                  >{`${info.name} ${id === $roomInfoStore.userId ? "(You)" : ""}`}</span
                >
                <div class="flex items-center gap-1 text-sm flex-shrink-0">
                  <button
                    class="pin-btn"
                    class:active={$roomInfoStore.pinnedStream === getStreamId(id, info)}
                    onclick={() => togglePin(id, info)}
                    title="Pin camera"
                  >
                    <i class="fa-solid fa-thumbtack"></i>
                  </button>
                  {#if info.screen && info.screen !== "disabled"}
                    <button
                      class="pin-btn"
                      class:active={$roomInfoStore.pinnedStream === info.screen}
                      onclick={() => togglePinScreen(info)}
                      title="Pin screen"
                    >
                      <i class="fa-solid fa-display"></i>
                    </button>
                  {/if}
                  <i
                    class="fa-solid"
                    class:fa-microphone={info.audio === "enabled"}
                    class:fa-microphone-slash={info.audio !== "enabled"}
                  ></i>
                </div>
              </div>
            </div>
          </div>
        {/each}

        {#if participants.length === 0}
          <div class="flex h-full items-center justify-center opacity-70">
            No participants yet
          </div>
        {/if}
      </div>

      <div class="rounded-lg bg-[var(--bg-primary)] p-4">
        <p class="text-center text-sm">
          {participants.length} participant{participants.length !== 1
            ? "s"
            : ""} in the meeting
        </p>
      </div>
    </section>
  {/if}
</div>

<style>
  .pin-btn {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pin-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
  }

  .pin-btn.active {
    color: var(--highlight);
  }
</style>
