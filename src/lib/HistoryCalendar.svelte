<script lang="ts">
  import type { CalendarDay } from './types';
  import { WEEKDAYS, getCalendarGrid, monthLabel } from './utils';

  interface Props {
    calYear: number;
    calMonth: number;
    calDays: CalendarDay[];
    calLoading: boolean;
    canGoNext: boolean;
    highlightDates?: Set<string>;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onDateClick?: (dateStr: string) => void;
  }

  let {
    calYear,
    calMonth,
    calDays,
    calLoading,
    canGoNext,
    highlightDates = new Set(),
    onPrevMonth,
    onNextMonth,
    onDateClick,
  }: Props = $props();
</script>

<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">历史事件</div>
    <div class="cal-nav">
      <button class="cal-nav-btn" onclick={onPrevMonth} aria-label="上个月">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <span class="cal-month-label">{monthLabel(calYear, calMonth)}</span>
      <button class="cal-nav-btn" onclick={onNextMonth} disabled={!canGoNext} aria-label="下个月">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
  <div class="cal-body">
    <div class="cal-weekdays">
      {#each WEEKDAYS as w}
        <div class="cal-weekday">{w}</div>
      {/each}
    </div>
    {#if calLoading}
      <div class="cal-grid">
        {#each Array(30) as _}
          <div class="cal-cell">
            <div class="skel" style="width:min(28px,100%);aspect-ratio:1;border-radius:50%"></div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="cal-grid">
        {#each getCalendarGrid(calYear, calMonth, calDays) as cell}
          {@const hasAdded = cell.added > 0 && cell.isCurrentMonth}
          {@const hasRemoved = cell.removed > 0 && cell.isCurrentMonth}
          {@const hasChanges = hasAdded || hasRemoved}
          {@const provinceActive = highlightDates.has(cell.dateStr)}
          <div
            class="cal-cell"
            class:cal-cell-other={!cell.isCurrentMonth}
            class:cal-cell-clickable={hasChanges}
            class:cal-cell-province-active={provinceActive}
            title={hasChanges ? `${cell.dateStr}\n新增 ${cell.added} 台\n移除 ${cell.removed} 台` : provinceActive ? `${cell.dateStr}\n当前省份有变更` : ''}
            onclick={() => { if (hasChanges) onDateClick?.(cell.dateStr); }}
            role="button"
            tabindex={hasChanges ? 0 : -1}
            onkeydown={(e: KeyboardEvent) => { if (hasChanges && e.key === 'Enter') onDateClick?.(cell.dateStr); }}
          >
            <div class="cal-day" class:cal-day-today={cell.isToday} class:cal-day-added={hasAdded && !hasRemoved} class:cal-day-removed={hasRemoved && !hasAdded} class:cal-day-has-changes={hasAdded && hasRemoved}>
              <span class="cal-day-num" class:cal-day-num-other={!cell.isCurrentMonth}>{cell.day}</span>
            </div>
            {#if provinceActive}
              <span class="cal-province-dot" aria-hidden="true"></span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .cal-nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: var(--radius);
    border: none;
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: color 0.15s, background 0.15s;
  }
  .cal-nav-btn:active:not(:disabled) {
    background: hsl(var(--background));
    color: hsl(var(--foreground));
  }
  @media (any-hover: hover) {
    .cal-nav-btn:hover:not(:disabled) {
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
  }
  .cal-nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cal-month-label {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    min-width: 100px;
    text-align: center;
  }

  .cal-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border-bottom: 1px solid hsl(var(--border) / 0.8);
    padding: 0 0.5rem 1rem 0.5rem;
    margin-bottom: 0.25rem;
  }
  :global(.dark) .cal-weekdays { border-color: hsl(var(--muted) / 0.5); }

  .cal-weekday {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0 0.5rem;
    min-height: 210px;
    align-content: start;
  }

  .cal-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0;
    position: relative;
    cursor: default;
    border-radius: var(--radius);
    transition: background 0.15s;
  }
  .cal-cell:active { background: hsl(var(--accent)); }
  @media (any-hover: hover) {
    .cal-cell:hover { background: hsl(var(--accent)); }
  }

  .cal-day {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    position: relative;
  }

  .cal-day-today {
    background: hsl(var(--accent));
  }

  .cal-day-added {
    box-shadow: inset 0 0 0 2px hsl(var(--success));
  }
  .cal-day-removed {
    box-shadow: inset 0 0 0 2px hsl(var(--danger));
  }
  .cal-day-has-changes {
    box-shadow: inset 0 0 0 2px #eab308;
  }

  .cal-day-num {
    font-size: 0.875rem;
    position: relative;
    z-index: 10;
    color: hsl(var(--foreground));
  }

  .cal-cell[title] {
    cursor: default;
  }

  .cal-day-num-other {
    color: hsl(var(--muted-foreground) / 0.3);
  }

  .cal-cell-clickable {
    cursor: pointer;
  }

  /* 省份高亮：日期下方小圆点 */
  .cal-cell-province-active {
    position: relative;
  }
  .cal-province-dot {
    position: absolute;
    bottom: 2px;
    left: 50%;
    translate: -50% 0;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: hsl(var(--primary));
  }
  :global(.dark) .cal-province-dot {
    background: hsl(220 70% 70%);
  }

  @media (max-width: 480px) {
    .cal-month-label { min-width: 80px; }
  }
</style>
