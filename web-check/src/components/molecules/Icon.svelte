<script lang="ts">
  import { library } from '@fortawesome/fontawesome-svg-core';
  import { fas } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

  library.add(fas, fab);

  const iconMap = {
    check: 'check',
    plus: 'plus',
    github: 'github',
    code: 'code',
    rocket: 'rocket',
    copy: 'copy',
  };

  export let name: string;
  export let size: number = 1;
  export let color: string = 'currentColor';
  export let styles: string = '';
</script>

{#if iconMap[name]}
  <FontAwesomeIcon 
    class="fa-icon"
    style={`--icon-size: ${size}rem; --icon-color: ${color}; ${styles}`}
    :icon="iconMap[name]" />
{/if}

<style>
  :global(.fa-icon) {
    width: var(--icon-size, 1rem);
    color: var(--icon-color, currentColor);
  }
</style>
