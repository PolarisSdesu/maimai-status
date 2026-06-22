<script lang="ts">
  import type { Machine } from './types';
  import { isTodayISO } from './utils';

  interface Props {
    machines: Machine[];
    province: string;
    showProvince?: boolean;
    onMachineClick?: (machine: Machine) => void;
  }

  let { machines, province, showProvince = false, onMachineClick }: Props = $props();
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
  <div class="cal-body cal-body-list" class:cal-body-virtual={machines.length > 200}>
    {#if machines.length > 0}
      {#each machines as m (m.id)}
        <div class="component-item" onclick={() => onMachineClick?.(m)} role="button" tabindex="0" onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') onMachineClick?.(m); }}>
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
      {/each}
    {:else}
      <div class="empty-state">暂无机台数据</div>
    {/if}
  </div>
</div>
