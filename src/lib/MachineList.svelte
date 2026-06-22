<script lang="ts">
  import type { Machine } from './types';
  import { isTodayISO } from './utils';
  import VirtualList from './VirtualList.svelte';

  interface Props {
    machines: Machine[];
    province: string;
    showProvince?: boolean;
    onMachineClick?: (machine: Machine) => void;
  }

  let { machines, province, showProvince = false, onMachineClick }: Props = $props();

  function findMachine(id: string): Machine | undefined {
    return machines.find((m) => m.id === id);
  }

  function handleClick(id: string) {
    const m = findMachine(id);
    if (m) onMachineClick?.(m);
  }
</script>

<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">{province === '全国' ? '全国' : province}舞萌机台</div>
    {#if machines.length > 0}
      <div class="cal-nav">
        <span class="badge">{machines.length} 台</span>
      </div>
    {/if}
  </div>
  <div class="cal-body cal-body-list">
    {#if machines.length > 0}
      <div class="virtual-list-wrapper">
        <VirtualList
          items={machines}
          itemHeight={56}
          key={(m) => m.id}
          overscan={8}
        >
          {#snippet child(m: Machine, _idx: number)}
            <div
              class="component-item"
              onclick={() => handleClick(m.id)}
              role="button"
              tabindex="0"
              onkeydown={(e: KeyboardEvent) => {
                if (e.key === 'Enter') handleClick(m.id);
              }}
            >
              <div class="dot" class:new={isTodayISO(m.first_seen_at)} class:online={!isTodayISO(m.first_seen_at)}></div>
              <div class="component-info">
                <div class="component-name">{m.arcade_name}</div>
                <div class="component-meta">
                  {showProvince ? `${m.province} · ${m.address}` : m.address}
                </div>
              </div>
              {#if isTodayISO(m.first_seen_at)}
                <span class="component-tag tag-new">今日新增</span>
              {/if}
            </div>
          {/snippet}
        </VirtualList>
      </div>
    {:else}
      <div class="empty-state">暂无机台数据</div>
    {/if}
  </div>
</div>

<style>
  .virtual-list-wrapper {
    height: 70vh;
  }
</style>
