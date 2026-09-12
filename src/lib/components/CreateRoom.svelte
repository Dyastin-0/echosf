<script lang="ts">
  import { roomInfoStore } from "$lib/stores/roomStore";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { onMount } from "svelte";
  import { showAlert } from "$lib/stores/alertStore";
  import { goto } from "$app/navigation";

  const createNewRoom = async () => {
    try {
      const response = await fetch(
        `${PUBLIC_API_URL}/create?room=${$roomInfoStore.id}`,
        {
          method: "POST",
        },
      );

      const { room } = await response.json();

      $roomInfoStore.id = room;
      goto(`/${room}`);
    } catch (error) {
      alert("Failed to create, room already exists. Join instead.");
    }
  };

  const handleContinue = async () => {
    if (!$roomInfoStore.id) return;

    try {
      const response = await fetch(
        `${PUBLIC_API_URL}/check?room=${$roomInfoStore.id}`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      goto(`/${$roomInfoStore.id}`);
    } catch (error) {
      showAlert("Failed to join, room does not exist.", "info");
      goto("/").then(() => ($roomInfoStore.id = ""));
    }
  };

  onMount(() => {
    if ($roomInfoStore.id) {
      handleContinue();
    }
  });
</script>

<div
  class="flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/10 bg-[var(--bg-secondary)] p-6 shadow-2xl shadow-black/20 sm:w-[400px] sm:p-8"
>
  <div class="flex items-center justify-center gap-3">
    <img src="icon.ico" alt="echos logo" class="h-10 w-10" />
    <h1
      class="text-center text-2xl font-bold tracking-tight text-[var(--text-primary)]"
    >
      Echos
    </h1>
  </div>

  <div class="flex flex-col gap-4">
    <button
      onclick={createNewRoom}
      class="rounded-full bg-[var(--highlight)] p-3.5 font-semibold text-white transition hover:brightness-110 active:scale-[0.99]"
    >
      <i class="fa-solid fa-plus mr-2"></i>
      Create New Meeting
    </button>

    <div class="flex items-center gap-3 text-[var(--text-secondary)]">
      <span class="h-px flex-1 bg-[var(--accent)]"></span>
      <span class="text-xs font-medium uppercase tracking-widest">or</span>
      <span class="h-px flex-1 bg-[var(--accent)]"></span>
    </div>

    <form onsubmit={handleContinue} class="flex flex-col gap-3">
      <label
        for="roomId"
        class="text-sm font-medium text-[var(--text-primary)]"
        >Enter Room Code</label
      >
      <input
        id="roomId"
        type="text"
        bind:value={$roomInfoStore.id}
        required
        autocomplete="on"
        placeholder="e.g. abc-def-ghi"
        class="w-full rounded-xl border border-transparent bg-[var(--bg-primary)] p-3.5 outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--highlight)]"
      />

      <button
        type="submit"
        class="rounded-full bg-[var(--bg-primary)] p-3.5 font-semibold transition hover:bg-[var(--accent)] active:scale-[0.99]"
      >
        <i class="fa-solid fa-arrow-right mr-2"></i>
        Continue
      </button>
    </form>
  </div>
</div>
