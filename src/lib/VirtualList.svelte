<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  let {
    items,
    itemHeight,
    key,
    overscan = 5,
    child,
  }: {
    items: T[];
    itemHeight: number;
    key: (item: T, index: number) => string | number;
    overscan?: number;
    child: Snippet<[item: T, index: number]>;
  } = $props();

  let containerHeight = $state(0);
  let scrollTop = $state(0);
  let containerEl = $state<HTMLDivElement | null>(null);

  const totalHeight = $derived(items.length * itemHeight);
  const startIndex = $derived(Math.max(0, Math.floor(scrollTop / itemHeight) - overscan));
  const endIndex = $derived(
    Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan),
  );
  const visibleItems = $derived(items.slice(startIndex, endIndex));
  const offsetY = $derived(startIndex * itemHeight);

  $effect(() => {
    const el = containerEl;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      // 使用 entries[0] 直接获取，避免读取 clientHeight
      const entry = entries[0];
      if (entry) {
        containerHeight = entry.contentRect.height;
      }
    });
    ro.observe(el);
    // 初始化高度
    containerHeight = el.clientHeight;

    return () => ro.disconnect();
  });
</script>

<div
  bind:this={containerEl}
  onscroll={(e) => scrollTop = (e.target as HTMLDivElement).scrollTop}
  style="overflow-y: auto; contain: strict; height: 100%;"
>
  <div style="height: {totalHeight}px; position: relative;">
    <div style="position: absolute; top: {offsetY}px; left: 0; right: 0;">
      {#each visibleItems as item, idx (key(item, startIndex + idx))}
        {@render child(item, startIndex + idx)}
      {/each}
    </div>
  </div>
</div>
