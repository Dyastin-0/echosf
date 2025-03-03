<script>
  export let message;
</script>

<div class="pl-4 pr-4 pb-3 pt-3 bg-[var(--bg-primary)] rounded-full">
  {#if message.id}
    <p class="text-xs text-[var(--text-secondary)]">{message.id}</p>
  {/if}
  <p>{message.data}</p>
</div>
