<script>
  export let audioLevel = 0;
  export let owner = '';
  export let isCameraOpen = false;
  
  $: isAudioActive = audioLevel > 0.2;
</script>

<div class="absolute flex justify-center items-center inset-0">
  <div
    class="absolute min-h-11 min-w-11 items-center justify-center rounded-full bg-[var(--accent)] z-20"
    class:hidden={isCameraOpen}
    class:flex={!isCameraOpen}
  >
    {owner ? owner.charAt(0).toUpperCase() : '?'}
  </div>
  
  <div 
    class="absolute min-h-11 min-w-11 rounded-full bg-[var(--accent)] z-10"
    class:animate-ping={isAudioActive}
    class:opacity-60={isAudioActive}
    class:opacity-0={!isAudioActive}
  ></div>
    
  <div 
    class="absolute min-h-11 min-w-11 rounded-full bg-[var(--accent)] opacity-30 z-10"
    class:animate-pulse={isAudioActive}
    class:opacity-30={isAudioActive}
    class:opacity-0={!isAudioActive}
  ></div>
</div>
