<script lang="ts">
  import { roomInfoStore } from "$lib/stores/roomStore";
  import Video from "./Video.svelte";
  import Cameratoggle from "./Cameratoggle.svelte";
  import AudioToggle from "./AudioToggle.svelte";
  import { onMount } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { showAlert } from "$lib/stores/alertStore";
  import { copyCode } from "$lib/helpers/clip";
  import { page } from "$app/state";

  export let toggleCamera: () => void;
  export let toggleMute: () => void;
  export let onJoinRoom;
  export let initMedia: () => void;

  onMount(initMedia);

  $roomInfoStore.id = page.params.room || "";

  const goBack = () => {
    $roomInfoStore.id = "";
    goto("/");
  };

  const join = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${PUBLIC_API_URL}/check?room=${$roomInfoStore.id}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to join room.");
      }

      onJoinRoom(e);
    } catch (error) {
      showAlert("Failed to join, room does not exist.", "info");
      goBack();
    }
  };
</script>

<div
  class="flex w-full max-w-4xl flex-col gap-5 rounded-3xl border border-white/10 bg-[var(--bg-secondary)] p-5 shadow-2xl shadow-black/20 sm:p-6 md:flex-row"
>
  <div class="flex w-full flex-col gap-4 md:w-1/2">
    <div
      class="relative w-full overflow-hidden rounded-2xl bg-[var(--bg-primary)]"
    >
      <Video height="h-fit" position="static" />
    </div>

    <div
      class="flex justify-center gap-2 rounded-full bg-[var(--bg-primary)] p-2"
    >
      <Cameratoggle {toggleCamera} />
      <AudioToggle {toggleMute} />
    </div>
  </div>

  <div class="flex w-full flex-col justify-between gap-5 md:w-1/2">
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-center gap-3">
        <img src="icon.ico" alt="echos logo" class="h-9 w-9" />
        <h1
          class="text-center text-2xl font-bold tracking-tight text-[var(--text-primary)]"
        >
          Echos
        </h1>
      </div>

      <form onsubmit={join} class="flex flex-col gap-3">
        <label for="name" class="text-sm font-medium">Display name</label>
        <input
          id="name"
          autocomplete="on"
          type="text"
          bind:value={$roomInfoStore.userName}
          required
          placeholder="Enter your name"
          class="w-full rounded-xl border border-transparent bg-[var(--bg-primary)] p-3.5 outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--highlight)]"
        />

        <div class="flex gap-2">
          <button
            type="button"
            onclick={goBack}
            class="w-full rounded-full bg-[var(--bg-primary)] p-3.5 font-semibold transition hover:bg-[var(--accent)] active:scale-[0.99]"
          >
            <i class="fa-solid fa-arrow-left mr-2"></i>
            Back
          </button>

          <button
            type="submit"
            class="w-full rounded-full bg-[var(--highlight)] p-3.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.99]"
          >
            <i class="fa-solid fa-right-to-bracket mr-2"></i>
            Join
          </button>
        </div>
      </form>
    </div>

    <div class="flex flex-col gap-2 rounded-2xl bg-[var(--bg-primary)] p-4">
      <h2 class="text-sm font-semibold text-[var(--text-primary)]">Share meeting</h2>
      <p class="text-sm text-[var(--text-secondary)]">
        Invite others with this code:
      </p>
      <div class="flex items-center gap-2">
        <input
          id="meetingCode"
          type="text"
          readonly
          value={$roomInfoStore.id}
          class="min-w-0 flex-grow rounded-xl bg-[var(--bg-secondary)] p-2.5 font-mono text-sm outline-none"
        />
        <button
          onclick={copyCode}
          class="shrink-0 rounded-full bg-[var(--bg-secondary)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[var(--accent)]"
        >
          Copy
        </button>
      </div>
    </div>
  </div>
</div>
