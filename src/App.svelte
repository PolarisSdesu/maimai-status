<script lang="ts">
  import { onMount } from 'svelte';

  type Machine = {
    id: string;
    province: string;
    arcade_name: string;
    address: string;
    place_id: string;
    first_seen_at: string;
    last_seen_at: string;
    is_active: number;
  };

  type StatusData = {
    ok: boolean;
    gansuCount: number;
    totalCount: number;
    machines: Machine[];
    lastUpdated: string;
    todayChanges: { added: number; removed: number };
  };

  type CalendarDay = {
    date: string;
    added: number;
    removed: number;
  };

  let status: 'loading' | 'loaded' | 'error' = $state('loading');
  let data: StatusData | null = $state(null);
  let errorMsg = $state('');
  let darkMode = $state(false);
  let themeMounted = $state(false);

  // Calendar state
  let calYear = $state(new Date().getFullYear());
  let calMonth = $state(new Date().getMonth() + 1); // 1-based
  let calDays: CalendarDay[] = $state([]);
  let calLoading = $state(false);

  onMount(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      darkMode = true;
    }
    applyTheme(darkMode);
    themeMounted = true;

    fetchStatus();
    fetchCalendar();
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const timer = setInterval(fetchStatus, TWELVE_HOURS);
    return () => clearInterval(timer);
  });

  function toggleTheme() {
    darkMode = !darkMode;
    applyTheme(darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }

  function applyTheme(dark: boolean) {
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }

  async function fetchStatus() {
    try {
      const resp = await fetch('/api/status');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data = await resp.json() as StatusData;
      status = 'loaded';
    } catch (err) {
      status = 'error';
      errorMsg = err instanceof Error ? err.message : '网络请求失败';
    }
  }

  async function fetchCalendar() {
    calLoading = true;
    try {
      const resp = await fetch(`/api/history-calendar?year=${calYear}&month=${calMonth}`);
      if (resp.ok) calDays = await resp.json() as CalendarDay[];
    } catch { /* ignore */ }
    calLoading = false;
  }

  function prevMonth() {
    if (calMonth === 1) { calMonth = 12; calYear--; }
    else calMonth--;
    fetchCalendar();
  }

  function nextMonth() {
    const now = new Date();
    // Don't go past current month
    if (calYear === now.getFullYear() && calMonth >= now.getMonth() + 1) return;
    if (calMonth === 12) { calMonth = 1; calYear++; }
    else calMonth++;
    fetchCalendar();
  }

  function canGoNext(): boolean {
    const now = new Date();
    return !(calYear === now.getFullYear() && calMonth >= now.getMonth() + 1);
  }

  function getChangeLevel(added: number, removed: number): 'none' | 'low' | 'high' {
    const total = added + removed;
    if (total === 0) return 'none';
    if (total <= 2) return 'low';
    return 'high';
  }

  function isToday(year: number, month: number, day: number): boolean {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() + 1 === month && t.getDate() === day;
  }

  function isTodayISO(iso: string): boolean {
    const d = new Date(iso);
    const t = new Date();
    return d.getFullYear() === t.getFullYear()
      && d.getMonth() === t.getMonth()
      && d.getDate() === t.getDate();
  }

  function formatTime(iso: string): string {
    return new Date(iso).toLocaleString('zh-CN', {
      month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function relativeTime(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return `${min} 分钟前`;
    const h = Math.floor(min / 60);
    return `${h} 小时前`;
  }

  // Calendar rendering
  const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

  function getCalendarGrid(): { day: number; dateStr: string; changeLevel: 'none' | 'low' | 'high'; isCurrentMonth: boolean; isToday: boolean }[] {
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Sun
    // Convert to Monday=0
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Days from previous month
    const prevMonth = calMonth === 1 ? 12 : calMonth - 1;
    const prevYear = calMonth === 1 ? calYear - 1 : calYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

    const grid: { day: number; dateStr: string; changeLevel: 'none' | 'low' | 'high'; isCurrentMonth: boolean; isToday: boolean }[] = [];

    // Previous month fillers
    for (let i = 0; i < startOffset; i++) {
      const day = daysInPrevMonth - startOffset + i + 1;
      grid.push({
        day,
        dateStr: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        changeLevel: 'none',
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month
    const changeMap = new Map<string, { added: number; removed: number }>();
    for (const d of calDays) changeMap.set(d.date, d);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const changes = changeMap.get(dateStr);
      grid.push({
        day: d,
        dateStr,
        changeLevel: changes ? getChangeLevel(changes.added, changes.removed) : 'none',
        isCurrentMonth: true,
        isToday: isToday(calYear, calMonth, d),
      });
    }

    return grid;
  }

  function monthLabel(): string {
    return `${calYear}年${calMonth}月`;
  }
</script>

<!-- Header -->
<header class="page-header">
  <a href="/" class="logo-link">
    <span class="logo-icon" aria-hidden="true">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2a14.5 14.5 0 0 1 0 20"/>
        <path d="M2 12h20"/>
      </svg>
    </span>
    <h1>甘肃舞萌机台状态</h1>
  </a>
  <div class="header-actions">
    <button class="theme-toggle" onclick={toggleTheme} aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}>
      <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/><path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
      <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
      </svg>
    </button>
  </div>
</header>

{#if !themeMounted}
  <div style="min-height:60vh"></div>

{:else if status === 'loading'}
  <!-- Loading -->
  <div class="status-card status-card-loading">
    <div class="status-card-body">
      <h2>
        <div class="status-icon status-icon-muted" aria-hidden="true">
          <div class="loading-dot"></div>
        </div>
        正在获取数据…
      </h2>
      <p>拉取最新机台信息</p>
    </div>
  </div>

  <div class="stats-grid">
    {#each [1,2,3] as _}
      <div class="stat-card">
        <div class="skel skel-line" style="width:40%;margin:0 auto 10px;height:28px"></div>
        <div class="skel skel-line" style="width:50%;margin:0 auto"></div>
      </div>
    {/each}
  </div>

  <div class="card">
    {#each [1,2,3] as _}
      <div class="component-item">
        <div class="skel" style="width:10px;height:10px;border-radius:50%"></div>
        <div class="component-info">
          <div class="skel skel-line" style="width:45%"></div>
          <div class="skel skel-line" style="width:70%"></div>
        </div>
      </div>
    {/each}
  </div>

{:else if status === 'error'}
  <!-- Error -->
  <div class="status-card status-card-error">
    <div class="status-card-body">
      <h2>
        <div class="status-icon status-icon-danger" aria-hidden="true">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </div>
        查询失败
      </h2>
      <p>{errorMsg}</p>
    </div>
  </div>

  <div class="error-actions">
    <button class="btn-retry" onclick={fetchStatus}>重新连接</button>
  </div>

{:else}
  {@const d = data!}

  <!-- Overall Status -->
  {#if d.ok}
    <div class="status-card status-card-operational">
      <div class="status-card-body">
        <h2>
          <div class="status-icon status-icon-success" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          一切运行正常
        </h2>
        <p>甘肃省共 {d.gansuCount} 台舞萌机台</p>
      </div>
    </div>
  {:else}
    <div class="status-card status-card-warning">
      <div class="status-card-body">
        <h2>
          <div class="status-icon status-icon-warning" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
            </svg>
          </div>
          暂无机台
        </h2>
        <p>甘肃省暂无舞萌机台注册信息</p>
      </div>
    </div>
  {/if}

  <!-- Stats -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">{d.gansuCount}</div>
      <div class="stat-label">甘肃机台</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">{d.totalCount}</div>
      <div class="stat-label">全国机台</div>
    </div>
    <div class="stat-card">
      <div class="stat-value {d.todayChanges.added > 0 ? 'highlight' : ''}">
        +{d.todayChanges.added}
      </div>
      <div class="stat-label">今日新增</div>
    </div>
  </div>

  <!-- History Calendar (DeepSeek-style) -->
  <div class="cal-card">
    <div class="cal-header">
      <div class="cal-title">历史事件</div>
      <div class="cal-nav">
        <button class="cal-nav-btn" onclick={prevMonth} aria-label="上个月">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <span class="cal-month-label">{monthLabel()}</span>
        <button class="cal-nav-btn" onclick={nextMonth} disabled={!canGoNext()} aria-label="下个月">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>
    </div>
    <div class="cal-body">
      {#if calLoading}
        <div class="cal-loading">加载中…</div>
      {:else}
        <div class="cal-weekdays">
          {#each WEEKDAYS as w}
            <div class="cal-weekday">{w}</div>
          {/each}
        </div>
        <div class="cal-grid">
          {#each getCalendarGrid() as cell}
            <div class="cal-cell" class:cal-cell-other={!cell.isCurrentMonth}>
              <div
                class="cal-day"
                class:cal-day-today={cell.isToday}
                class:cal-day-has-changes={cell.changeLevel !== 'none' && cell.isCurrentMonth}
              >
                <span class="cal-day-num" class:cal-day-num-other={!cell.isCurrentMonth}>
                  {cell.day}
                </span>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Machine List -->
  <div class="cal-card">
    <div class="cal-header">
      <div class="cal-title">甘肃舞萌机台</div>
      {#if d.machines.length > 0}
        <div class="cal-nav">
          <span class="badge badge-success">{d.machines.length} 台</span>
        </div>
      {/if}
    </div>
    <div class="cal-body cal-body-list">
      {#if d.machines.length > 0}
        {#each d.machines as m, i}
          <div class="component-item">
            <div class="dot {isTodayISO(m.first_seen_at) ? 'new' : 'online'}"></div>
            <div class="component-info">
              <div class="component-name">{m.arcade_name}</div>
              <div class="component-meta">{m.address}</div>
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

  <!-- Today Changes -->
  {#if d.todayChanges.added > 0 || d.todayChanges.removed > 0}
    <div class="cal-card">
      <div class="cal-header">
        <div class="cal-title">今日变更</div>
        <div class="cal-nav">
          {#if d.todayChanges.added > 0}
            <span class="badge badge-success">+{d.todayChanges.added}</span>
          {/if}
          {#if d.todayChanges.removed > 0}
            <span class="badge badge-danger">-{d.todayChanges.removed}</span>
          {/if}
        </div>
      </div>
      <div class="cal-body cal-body-list">
        {#if d.todayChanges.added > 0}
          <div class="component-item">
            <div class="dot new"></div>
            <div class="component-info">
              <div class="component-name">新增 {d.todayChanges.added} 台机台</div>
              <div class="component-meta">今天有新的舞萌机台上线</div>
            </div>
          </div>
        {/if}
        {#if d.todayChanges.removed > 0}
          <div class="component-item">
            <div class="dot offline"></div>
            <div class="component-info">
              <div class="component-name">移除 {d.todayChanges.removed} 台机台</div>
              <div class="component-meta">有机台从注册列表中消失</div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <div class="footer">
    <span>上次同步：{formatTime(d.lastUpdated)}（{relativeTime(d.lastUpdated)}）</span>
    <span class="footer-sep">&middot;</span>
    <span>每 12 小时自动更新</span>
    <div class="powered">Powered by SEGA 官方机台注册 API</div>
  </div>
{/if}
