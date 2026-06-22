<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    onclick: () => void;
    children: Snippet;
    /** 可选 aria-label，用于无障碍 */
    ariaLabel?: string;
  }

  let { onclick, children, ariaLabel }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onclick();
    }
  }
</script>

<div
  class="clickable-item"
  onclick={onclick}
  role="button"
  tabindex="0"
  aria-label={ariaLabel}
  onkeydown={handleKeydown}
>
  {@render children()}
</div>

<style>
  .clickable-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid hsl(var(--border));
    transition: background 0.15s;
    cursor: pointer;
  }
  .clickable-item:last-of-type {
    border-bottom: none;
  }
  .clickable-item:active {
    background: hsl(var(--muted) / 0.5);
  }
  @media (any-hover: hover) {
    .clickable-item:hover {
      background: hsl(var(--muted) / 0.5);
    }
  }
</style>
