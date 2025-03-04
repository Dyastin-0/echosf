<script lang="ts">
	export let joinRoom: (e: { preventDefault: () => void }) => Promise<void>;
	export let room: string | null;
	export let name: string | null;
</script>

<form
	on:submit={joinRoom}
	class="h flex w-[250px] max-w-full flex-col gap-4 rounded-md bg-[var(--bg-secondary)] p-8 shadow"
>
	<h1 class="text-center text-lg font-semibold">Join a Room</h1>
	<input
		bind:value={room}
		class="w-full rounded-md bg-[var(--bg-primary)] p-2 outline-none"
		placeholder="room name"
	/>
	<input
		bind:value={name}
		class="w-full rounded-md bg-[var(--bg-primary)] p-2 outline-none"
		placeholder="name"
	/>
	<button type="submit" class="rounded bg-[var(--bg-primary)] p-2 hover:bg-[var(--accent)]">
		Join
	</button>
</form>
