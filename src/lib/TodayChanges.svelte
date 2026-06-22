<script lang="ts">
  interface ChangesData {
    added: number;
    removed: number;
  }

  interface ChangeItem {
    province: string;
    arcade_name: string;
  }

  interface RecentChanges {
    added?: ChangeItem[];
    removed?: ChangeItem[];
  }

  interface Props {
    todayChanges: ChangesData;
    recentChanges?: RecentChanges;
    onClick?: () => void;
  }

  let { todayChanges, recentChanges, onClick }: Props = $props();

  function fmtNames(items: ChangeItem[], max = 3): string {
    const names = items.slice(0, max).map((i) => `「${i.province}」 ${i.arcade_name}`);
    const suffix = items.length > max ? ` 等 ${items.length} 家` : '';
    return names.join('、') + suffix;
  }

  function tooltipLines(items: ChangeItem[]): string {
    return items.map((i) => `「${i.province}」 ${i.arcade_name}`).join('\n');
  }
</script>

{#if todayChanges.added > 0 || todayChanges.removed > 0}
  <div class="cal-card">
    <div class="cal-header">
      <div class="cal-title">今日变更</div>
      <div class="cal-nav">
        {#if todayChanges.added > 0}
          <span class="badge badge-success">+{todayChanges.added}</span>
        {/if}
        {#if todayChanges.removed > 0}
          <span class="badge badge-danger">-{todayChanges.removed}</span>
        {/if}
      </div>
    </div>
    <div class="cal-body cal-body-list">
      {#if todayChanges.added > 0}
        <div class="component-item" title={recentChanges?.added?.length ? tooltipLines(recentChanges.added) : ''} onclick={() => onClick?.()} role="button" tabindex="0" onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') onClick?.(); }}>
          <div class="dot new"></div>
          <div class="component-info">
            <div class="component-name">新增 {todayChanges.added} 台机台</div>
            <div class="component-meta">
              {#if recentChanges?.added?.length}
                {fmtNames(recentChanges.added)}
              {:else}
                今天有新机台上线
              {/if}
            </div>
          </div>
        </div>
      {/if}
      {#if todayChanges.removed > 0}
        <div class="component-item" title={recentChanges?.removed?.length ? tooltipLines(recentChanges.removed) : ''} onclick={() => onClick?.()} role="button" tabindex="0" onkeydown={(e: KeyboardEvent) => { if (e.key === 'Enter') onClick?.(); }}>
          <div class="dot offline"></div>
          <div class="component-info">
            <div class="component-name">移除 {todayChanges.removed} 台机台</div>
            <div class="component-meta">
              {#if recentChanges?.removed?.length}
                {fmtNames(recentChanges.removed)}
              {:else}
                有机台从注册列表中消失
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
