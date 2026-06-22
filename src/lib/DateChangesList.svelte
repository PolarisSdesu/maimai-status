<script lang="ts">
  import type { Machine, ChangesByDateResponse } from './types';
  import ClickableListItem from './ClickableListItem.svelte';

  interface Props {
    data: ChangesByDateResponse;
    /** 当前选中的省份，"全国" 时显示省份前缀 */
    province: string;
    onMachineClick: (machine: Machine) => void;
  }

  let { data, province, onMachineClick }: Props = $props();
</script>

{#if data.isInit}
  <p class="empty-state">初始化 · 首次数据采集</p>
{:else}
  {#if data.added.length > 0}
    <h3 class="section-title">
      新增 (+{data.added.length})
    </h3>
    {#each data.added as m (m.id)}
      <ClickableListItem onclick={() => onMachineClick(m)}>
        <div class="dot new"></div>
        <div class="info">
          <div class="name">{m.arcade_name}</div>
          <div class="meta">
            {province === '全国' ? `${m.province} · ${m.address}` : m.address}
          </div>
        </div>
      </ClickableListItem>
    {/each}
  {/if}
  {#if data.removed.length > 0}
    <h3 class="section-title">
      移除 (-{data.removed.length})
    </h3>
    {#each data.removed as m (m.id)}
      <ClickableListItem onclick={() => onMachineClick(m)}>
        <div class="dot offline"></div>
        <div class="info">
          <div class="name">{m.arcade_name}</div>
          <div class="meta">
            {province === '全国' ? `${m.province} · ${m.address}` : m.address}
          </div>
        </div>
      </ClickableListItem>
    {/each}
  {/if}
{/if}

<style>
  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: hsl(var(--muted-foreground));
    font-size: 14px;
  }
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: hsl(var(--muted-foreground));
    margin-bottom: 8px;
    padding: 0 0 4px;
    border-bottom: 1px solid hsl(var(--border));
  }
  .section-title + .section-title {
    margin-top: 16px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .dot.new {
    background: hsl(var(--warning));
    box-shadow: 0 0 0 3px hsl(var(--warning) / 0.2);
  }
  .dot.offline {
    background: hsl(var(--danger));
  }
  .info {
    flex: 1;
    min-width: 0;
  }
  .name {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--foreground));
  }
  .meta {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
