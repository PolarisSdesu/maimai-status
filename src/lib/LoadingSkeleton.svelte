<script lang="ts">
</script>

<!-- StatusCard 骨架 -->
<div
  class="status-card status-card-loading"
  style="height:82px;display:flex;align-items:center"
>
  <div class="status-card-body">
    <div class="status-heading">
      <div
        class="skel"
        style="width:16px;height:16px;border-radius:50%;flex-shrink:0"
      ></div>
      <div class="skel skel-line" style="width:120px;margin-bottom:0"></div>
    </div>
    <div class="status-subtitle">
      <span class="skel skel-line" style="width:180px;display:inline-block"
      ></span>
    </div>
  </div>
</div>

<!-- StatsGrid 骨架 -->
<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">机台概况</div>
  </div>
  <div class="cal-body cal-body-overview" style="height:91.5px;display:flex;flex-direction:column;justify-content:center">
    <div class="overview-grid overview-grid-2col">
      {#each [1, 2] as _}
        <div class="overview-item">
          <div
            class="skel skel-line"
            style="width:48px;height:24px;margin:0 auto 6px"
          ></div>
          <div
            class="skel skel-line"
            style="width:56px;height:14px;margin:0 auto"
          ></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- HistoryCalendar 骨架 -->
<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">历史事件</div>
    <div class="cal-nav">
      <div class="skel" style="width:24px;height:24px;border-radius:6px"></div>
      <div class="skel" style="width:100px;height:18px;border-radius:4px"></div>
      <div class="skel" style="width:24px;height:24px;border-radius:6px"></div>
    </div>
  </div>
  <div class="cal-body">
    <div class="cal-weekdays">
      {#each ["一", "二", "三", "四", "五", "六", "日"] as w}
        <div class="cal-weekday">{w}</div>
      {/each}
    </div>
    <div class="cal-grid">
      {#each Array(30) as _}
        <div class="cal-cell">
          <div
            class="skel"
            style="width:30px;height:30px;border-radius:50%"
          ></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- MachineList 骨架 -->
<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">全国舞萌机台</div>
    <div class="skel" style="width:48px;height:20px;border-radius:100px"></div>
  </div>
  <div class="cal-body cal-body-list">
    {#each Array(8) as _}
      <div class="component-item">
        <div
          class="skel"
          style="width:10px;height:10px;border-radius:50%;flex-shrink:0"
        ></div>
        <div class="component-info">
          <div class="skel skel-line" style="width:45%"></div>
          <div class="skel skel-line" style="width:70%"></div>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- TodayChanges 骨架 -->
<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">今日变更</div>
  </div>
  <div class="cal-body cal-body-list">
    {#each [1, 2] as _}
      <div class="component-item">
        <div
          class="skel"
          style="width:10px;height:10px;border-radius:50%;flex-shrink:0"
        ></div>
        <div class="component-info">
          <div class="skel skel-line" style="width:50%"></div>
          <div class="skel skel-line" style="width:65%"></div>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Footer 骨架 -->
<div class="footer-skel">
  <div class="skel skel-line" style="width:160px;margin:0 auto"></div>
  <div class="skel skel-line" style="width:240px;margin:8px auto 0"></div>
</div>

<style>
  /* StatusCard skeleton (与真实 StatusCard 结构一致) */
  .status-card {
    border: 1px solid transparent;
    border-radius: 0.75rem;
    padding: 0.25rem;
    overflow: hidden;
    margin-bottom: 24px;
  }
  .status-card-loading {
    background: hsl(var(--muted));
  }
  .status-card-body {
    padding: 0.75rem 1rem 1rem;
  }
  .status-card-body .status-heading {
    font-weight: 500;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: hsl(var(--card-foreground));
  }
  .status-card-body .status-subtitle {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
    margin-top: 0.25rem;
    margin-left: 1.5rem;
  }

  .footer-skel {
    text-align: center;
    margin-top: 32px;
    padding: 16px 0;
  }

  /* 日历骨架布局（不依赖外部 CSS 串联） */
  .cal-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    padding: 0 0.5rem 1rem 0.5rem;
    margin-bottom: 0.25rem;
    border-bottom: 1px solid hsl(var(--border) / 0.8);
  }
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
  }
  .cal-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem 0;
  }
</style>
