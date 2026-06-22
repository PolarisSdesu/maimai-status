<script lang="ts">
  import type { Machine } from './types';

  interface Props {
    machine: Machine;
  }

  let { machine }: Props = $props();
</script>

<div class="machine-detail">
  <div class="detail-row">
    <span class="detail-label">省份：</span>
    <span class="detail-value">{machine.province}</span>
  </div>
  <div class="detail-row detail-row-top">
    <span class="detail-label">地址：</span>
    <span class="detail-value detail-value-addr">{machine.address}</span>
  </div>
  <div class="detail-row">
    <span class="detail-label">状态：</span>
    <span class="detail-value">
      {#if machine.is_active === 1}
        <span class="detail-status-active">在线</span>
      {:else}
        <span class="detail-status-offline">离线</span>
      {/if}
    </span>
  </div>
  <div class="detail-divider"></div>
  <div class="detail-row">
    <span class="detail-label">首次发现：</span>
    <span class="detail-value">
      {new Date(machine.first_seen_at).toLocaleString('zh-CN')}
    </span>
  </div>
  <div class="detail-row">
    <span class="detail-label">最后更新：</span>
    <span class="detail-value">
      {new Date(machine.last_seen_at).toLocaleString('zh-CN')}
    </span>
  </div>
</div>

<style>
  .machine-detail {
    display: flex;
    flex-direction: column;
  }
  .detail-divider {
    height: 1px;
    background: hsl(var(--border));
    margin: 10px 0 12px;
  }
  .detail-row {
    display: flex;
    align-items: center;
    padding: 5px 0;
  }
  .detail-row-top {
    align-items: flex-start;
  }
  .detail-label {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
    flex-shrink: 0;
    width: 72px;
  }
  .detail-value {
    font-size: 12px;
    color: hsl(var(--foreground));
    font-weight: 500;
    flex: 1;
    font-feature-settings: "tnum" 1;
    white-space: nowrap;
  }
  .detail-value-addr {
    font-weight: 400;
    color: hsl(var(--muted-foreground));
    word-break: break-word;
    white-space: normal;
  }
  .detail-status-active {
    color: hsl(142 71% 40%);
    font-weight: 500;
  }
  .detail-status-offline {
    color: hsl(var(--muted-foreground));
    font-weight: 400;
  }
  :global(.dark) .detail-status-active {
    color: hsl(142 71% 60%);
  }
</style>
