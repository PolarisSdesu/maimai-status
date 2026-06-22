<script lang="ts">
  import type { Machine } from './types';
  import VirtualList from './VirtualList.svelte';
  import ClickableListItem from './ClickableListItem.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    onMachineClick: (machine: Machine) => void;
    /** 全量机台数据，搜索完全在客户端进行 */
    allMachines: Machine[];
  }

  let { open, onclose, onMachineClick, allMachines }: Props = $props();

  let query = $state('');
  let inputEl = $state<HTMLInputElement | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let debouncedQuery = $state('');

  // 客户端即时搜索：直接过滤全量数据
  let results = $derived.by(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return allMachines.filter(
      (m) =>
        m.arcade_name.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.province.toLowerCase().includes(q),
    );
  });
  let hasSearched = $derived(debouncedQuery.trim().length > 0);

  function handleGlobalKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (query) {
        query = '';
        debouncedQuery = '';
      } else {
        onclose();
      }
    }
  }

  $effect(() => {
    if (open) {
      document.addEventListener('keydown', handleGlobalKeydown);
      document.body.style.overflow = 'hidden';
      query = '';
      debouncedQuery = '';
      requestAnimationFrame(() => inputEl?.focus());
    }
    return () => {
      document.removeEventListener('keydown', handleGlobalKeydown);
      document.body.style.overflow = '';
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  });

  function onInput(e: Event) {
    const val = (e.target as HTMLInputElement).value;
    query = val;

    if (debounceTimer) clearTimeout(debounceTimer);

    if (!val.trim()) {
      debouncedQuery = '';
      return;
    }

    // 200ms 防抖，仅控制搜索触发频率
    debounceTimer = setTimeout(() => {
      debouncedQuery = val.trim();
    }, 200);
  }

  function handleResultClick(m: Machine) {
    onMachineClick(m);
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="search-backdrop"
    onclick={onclose}
    role="presentation"
  ></div>
  <div
    class="search-panel"
    role="dialog"
    aria-modal="true"
    aria-label="搜索全国机台"
    tabindex="-1"
  >
    <!-- Search bar -->
    <div class="search-bar">
      <svg
        class="search-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        bind:this={inputEl}
        type="text"
        class="search-input"
        placeholder="搜索机台名称、地址或省份..."
        value={query}
        oninput={onInput}
        aria-label="搜索全国机台"
      />
      {#if query}
        <button
          class="search-clear"
          onclick={() => {
            query = '';
            debouncedQuery = '';
            inputEl?.focus();
          }}
          aria-label="清除"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      {/if}
      <button class="search-close-btn" onclick={onclose} aria-label="关闭搜索">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </div>

    <!-- Results -->
    <div class="search-body">
      {#if !hasSearched}
        <div class="search-hint">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            opacity="0.3"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <p>输入关键词搜索全国舞萌机台</p>
        </div>
      {:else if results.length === 0}
        <div class="search-status">未找到匹配的机台</div>
      {:else}
        <div class="search-result-count">
          找到 <strong>{results.length}</strong> 个结果
        </div>
        <div class="search-results">
          <VirtualList
            items={results}
            itemHeight={56}
            key={(m: Machine) => m.id}
            overscan={8}
          >
            {#snippet child(m: Machine, _idx: number)}
              <ClickableListItem
                onclick={() => handleResultClick(m)}
                ariaLabel={m.arcade_name}
              >
                <div class="dot online"></div>
                <div class="component-info">
                  <div class="component-name">{m.arcade_name}</div>
                  <div class="component-meta">
                    {m.province} · {m.address}
                  </div>
                </div>
              </ClickableListItem>
            {/snippet}
          </VirtualList>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .search-backdrop {
    position: fixed;
    inset: 0;
    z-index: 59;
    background: hsl(var(--foreground) / 0.3);
    backdrop-filter: blur(2px);
    animation: backdrop-in 0.15s ease-out;
  }

  @keyframes backdrop-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .search-panel {
    position: fixed;
    top: 16px;
    left: 50%;
    translate: -50% 0;
    z-index: 60;
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
    box-shadow:
      0 4px 24px hsl(var(--foreground) / 0.12),
      0 0 0 1px hsl(var(--border) / 0.5);
    width: 100%;
    max-width: 520px;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    animation: panel-in 0.18s ease-out;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid hsl(var(--border));
  }

  .search-icon {
    color: hsl(var(--muted-foreground));
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    color: hsl(var(--foreground));
    font-size: 16px;
    font-family: inherit;
    outline: none;
    min-width: 0;
  }

  .search-input::placeholder {
    color: hsl(var(--muted-foreground));
    opacity: 0.6;
  }

  .search-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  .search-clear:active {
    background: hsl(var(--accent));
    color: hsl(var(--foreground));
  }
  @media (any-hover: hover) {
    .search-clear:hover {
      background: hsl(var(--accent));
      color: hsl(var(--foreground));
    }
  }

  .search-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.15s, color 0.15s;
  }

  .search-close-btn:active {
    background: hsl(var(--accent));
    color: hsl(var(--foreground));
  }
  @media (any-hover: hover) {
    .search-close-btn:hover {
      background: hsl(var(--accent));
      color: hsl(var(--foreground));
    }
  }

  .search-body {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .search-status {
    padding: 40px 20px;
    text-align: center;
    color: hsl(var(--muted-foreground));
    font-size: 14px;
  }

  .search-hint {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    color: hsl(var(--muted-foreground));
    gap: 16px;
  }

  .search-hint p {
    font-size: 14px;
    margin: 0;
  }

  .search-result-count {
    padding: 10px 16px 6px;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    border-bottom: 1px solid hsl(var(--border) / 0.5);
  }

  .search-results {
    height: 50vh;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot.online {
    background: hsl(var(--success));
  }
  .component-info {
    flex: 1;
    min-width: 0;
  }
  .component-name {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }
  .component-meta {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @keyframes panel-in {
    from { opacity: 0; scale: 0.97; }
    to   { opacity: 1; scale: 1; }
  }

  @media (max-width: 560px) {
    .search-panel {
      top: 0;
      left: 0;
      right: 0;
      translate: none;
      max-width: none;
      max-height: 100vh;
      border-radius: 0;
      height: 100vh;
    }

    .search-results {
      height: auto;
      flex: 1;
    }

    .search-body {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
  }
</style>
