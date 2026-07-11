<script lang="ts">
  import { roomInfoStore } from "$lib/stores/roomStore";
  import { useWRTC } from "$lib/hooks/useEchos";
  import JoinRoom from "$lib/components/JoinRoom.svelte";
  import Streams from "$lib/components/Streams.svelte";
  import ChatPanel from "$lib/components/ChatPanel.svelte";
  import Controls from "$lib/components/Controls.svelte";
  import { fly } from "svelte/transition";
  import { fade } from "svelte/transition";
  import Alert from "$lib/components/Alert.svelte";
  import Toast from "$lib/components/Toast.svelte";
  import Participants from "$lib/components/Participants.svelte";
  import { toggleChat, toggleParticipants, uiStore } from "$lib/stores/uiStore";
  import { onMount } from "svelte";
  import { PUBLIC_API_URL } from "$env/static/public";
  import { goto } from "$app/navigation";
  import { showAlert } from "$lib/stores/alertStore";
  import { page } from "$app/state";

  let checkingRoom = true;

  const {
    initMedia,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    toggleCamera,
    toggleMute,
    toggleScreenShare,
  } = useWRTC();

  const handleJoinRoom = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    joinRoom($roomInfoStore.id, $roomInfoStore.userName, $roomInfoStore.userId);
  };

  onMount(async () => {
    const roomId = page.params.room;
    if (!roomId) {
      checkingRoom = false;
      return;
    }
    try {
      const res = await fetch(`${PUBLIC_API_URL}/check?room=${roomId}`, { method: "POST" });
      if (!res.ok) {
        showAlert("Room does not exist.", "error");
        goto("/");
      }
    } catch {
      showAlert("Room does not exist.", "error");
      goto("/");
    } finally {
      checkingRoom = false;
    }
  });
</script>

{#if checkingRoom}
  <main
    class="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)] text-sm text-[var(--text-secondary)]"
  >
    <p>Checking room...</p>
  </main>
{:else if !$roomInfoStore.joined}
  <main
    class="flex h-screen w-full flex-wrap items-center justify-center gap-4 overflow-hidden bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
    in:fly={{ duration: 300, y: 100 }}
    out:fly={{ duration: 200, y: 100 }}
  >
    <div in:fly={{ duration: 300, x: 100 }}>
      <JoinRoom
        {initMedia}
        {toggleCamera}
        {toggleMute}
        onJoinRoom={handleJoinRoom}
      />
    </div>
    <Alert />
    <Toast />
  </main>
{:else}
  <main
    class="relative flex h-screen w-full flex-col justify-center gap-4 overflow-hidden bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-primary)]"
    in:fly={{ duration: 300, y: 100 }}
    out:fly={{ duration: 200, y: 100 }}
  >
    <div
      class="relative flex flex-grow min-h-0 gap-4 overflow-hidden"
      in:fly={{ duration: 400 }}
    >
      <div
        class="flex-grow h-full min-h-0 overflow-hidden"
        in:fly={{ duration: 400, y: 100 }}
      >
        <Streams />
      </div>

      <div class="hidden md:flex">
        <ChatPanel onSendMessage={sendChatMessage} />
        <Participants />
      </div>

      {#if $uiStore.showChat}
        <button
          type="button"
          class="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 md:hidden"
          onclick={(e) => { if (e.target === e.currentTarget) toggleChat(); }}
          transition:fade={{ duration: 150 }}
        >
          <div
            class="max-h-[80vh] w-full overflow-hidden rounded-t-xl bg-[var(--bg-secondary)]"
          >
            <ChatPanel onSendMessage={sendChatMessage} />
          </div>
        </button>
      {/if}

      {#if $uiStore.showParticipants}
        <button
          type="button"
          class="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 md:hidden"
          onclick={(e) => { if (e.target === e.currentTarget) toggleParticipants(); }}
          transition:fade={{ duration: 150 }}
        >
          <div
            class="max-h-[80vh] w-full overflow-hidden rounded-t-xl bg-[var(--bg-secondary)]"
          >
            <Participants />
          </div>
        </button>
      {/if}
    </div>

    <div in:fly={{ y: 20, duration: 300 }} out:fly={{ y: -20, duration: 300 }}>
      <Controls {leaveRoom} {toggleMute} {toggleCamera} {toggleScreenShare} />
    </div>
    <Alert />
    <Toast />
  </main>
{/if}
