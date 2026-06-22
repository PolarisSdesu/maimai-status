<svelte:head>
  <title>全国舞萌机台数据库</title>
</svelte:head>

<script lang="ts">
  import { browser } from '$app/environment';
  import type { StatusData, ProvinceInfo, CalendarDay, Machine, ChangesByDateResponse } from '$lib/types';
  import { formatTime, relativeTime } from '$lib/utils';
  import Header from '$lib/Header.svelte';
  import StatusCard from '$lib/StatusCard.svelte';
  import StatsGrid from '$lib/StatsGrid.svelte';
  import HistoryCalendar from '$lib/HistoryCalendar.svelte';
  import MachineList from '$lib/MachineList.svelte';
  import TodayChanges from '$lib/TodayChanges.svelte';
  import Footer from '$lib/Footer.svelte';
  import LoadingSkeleton from '$lib/LoadingSkeleton.svelte';
  import Modal from '$lib/Modal.svelte';
  import SearchOverlay from '$lib/SearchOverlay.svelte';
  import MachineDetail from '$lib/MachineDetail.svelte';
  import DateChangesList from '$lib/DateChangesList.svelte';

  let { data } = $props();

  const init = (() => $state.snapshot(data))();

  // ── 核心数据：全量机台 + 客户端过滤 ──
  let allMachines = $state<Machine[]>(init.allMachines);
  let selectedProvince = $state(init.province);
  let provinces = $state<ProvinceInfo[]>(init.provinces);

  let displayMachines = $derived(
    selectedProvince === '全国'
      ? allMachines
      : allMachines.filter((m) => m.province === selectedProvince),
  );
  let provinceCount = $derived(displayMachines.length);

  // 今日变更
  let todayChanges = $state<{ added: number; removed: number }>(init.todayChanges);
  let recentChanges = $state<StatusData['recentChanges']>(init.recentChanges);

  // ── UI 状态 ──
  let status = $state<'loaded' | 'error'>('loaded');
  let errorMsg = $state('');
  let darkMode = $state(false);
  let themeMounted = $state(false);

  // 日历：始终显示全国数据
  let calYear = $state(init.calYear);
  let calMonth = $state(init.calMonth);
  let calDays = $state<CalendarDay[]>(init.calDays);
  let calLoading = $state(false);
  // 省份高亮：Set<dateStr> 表示该日期选中省份有变更
  let provinceHighlightDates = $state<Set<string>>(buildHighlightSet(init.provinceHighlightDates));

  function buildHighlightSet(days: CalendarDay[]): Set<string> {
    return new Set(days.filter((d) => d.added > 0 || d.removed > 0).map((d) => d.date));
  }

  // Search overlay
  let searchOpen = $state(false);

  // Modal（支持骨架屏加载）
  let modalOpen = $state(false);
  let modalLoading = $state(false);
  let modalTitle = $state('');
  let selectedMachine = $state<Machine | null>(null);
  let selectedDateChanges = $state<ChangesByDateResponse | null>(null);

  $effect(() => {
    if (!browser) return;
    const saved = localStorage.getItem('theme');
    if (
      saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      darkMode = true;
    }
    applyTheme(darkMode);
    themeMounted = true;
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

  // ── 客户端计算今日变更 ──
  function computeTodayChanges(machines: Machine[]): { added: number; removed: number } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const provMachines = selectedProvince === '全国'
      ? machines
      : machines.filter((m) => m.province === selectedProvince);

    const added = provMachines.filter(
      (m) => m.is_active === 1 && m.first_seen_at >= todayISO,
    ).length;
    const removed = provMachines.filter(
      (m) => m.is_active === 0 && m.last_seen_at >= todayISO,
    ).length;
    return { added, removed };
  }

  // ── 省份切换：机台即时更新，仅后台刷新聚合数据 ──
  async function refreshAggregates() {
    try {
      const resp = await fetch(
        `/api/status?province=${encodeURIComponent(selectedProvince)}`,
      );
      if (resp.ok) {
        const d = await resp.json();
        todayChanges = d.todayChanges;
        recentChanges = d.recentChanges;
      }
    } catch (err) {
      console.warn('[refreshAggregates] 刷新聚合数据失败:', err);
    }
  }

  /** 仅获取省份日历高亮数据，日历主体不变 */
  async function fetchProvinceHighlights() {
    if (selectedProvince === '全国') {
      provinceHighlightDates = new Set();
      return;
    }
    try {
      const resp = await fetch(
        `/api/history-calendar?year=${calYear}&month=${calMonth}&province=${encodeURIComponent(selectedProvince)}`,
      );
      if (resp.ok) {
        const days: CalendarDay[] = await resp.json();
        provinceHighlightDates = buildHighlightSet(days);
      }
    } catch (err) {
      console.warn('[fetchProvinceHighlights] 获取省份日历高亮失败:', err);
    }
  }

  /** 日历导航：刷新全国数据 + 省份高亮 */
  async function fetchCalendar() {
    calLoading = true;
    try {
      const [natResp] = await Promise.all([
        fetch(
          `/api/history-calendar?year=${calYear}&month=${calMonth}&province=${encodeURIComponent('全国')}`,
        ),
        fetchProvinceHighlights(),
      ]);
      if (natResp.ok) calDays = (await natResp.json()) as CalendarDay[];
    } catch (err) {
      console.warn('[fetchCalendar] 获取日历失败:', err);
    }
    calLoading = false;
  }

  function onProvinceChange(e: Event) {
    const sel = e.target as HTMLSelectElement;
    selectedProvince = sel.value;
    sel.blur();
    // 即时: 今日变更近似值 + 省份高亮
    todayChanges = computeTodayChanges(allMachines);
    fetchProvinceHighlights();
    // 后台: 精确聚合数据
    refreshAggregates();
  }

  // ── 日历导航 ──
  function prevMonth() {
    if (calMonth === 1) { calMonth = 12; calYear--; }
    else { calMonth--; }
    fetchCalendar();
  }

  function nextMonth() {
    const now = new Date();
    if (calYear === now.getFullYear() && calMonth >= now.getMonth() + 1) return;
    if (calMonth === 12) { calMonth = 1; calYear++; }
    else { calMonth++; }
    fetchCalendar();
  }

  function canGoNext(): boolean {
    const now = new Date();
    return !(calYear === now.getFullYear() && calMonth >= now.getMonth() + 1);
  }

  function openMachineDetail(machine: Machine) {
    selectedMachine = machine;
    selectedDateChanges = null;
    modalTitle = machine.arcade_name;
    modalLoading = false;
    modalOpen = true;
  }

  /** 点击日期 / 今日变更 → 先弹窗 + 骨架屏，再加载数据 */
  async function openDateChanges(dateStr: string) {
    // 立即弹窗 + 骨架屏
    modalTitle = `${dateStr} 变更`;
    selectedMachine = null;
    selectedDateChanges = null;
    modalLoading = true;
    modalOpen = true;

    try {
      const resp = await fetch(
        `/api/changes-by-date?date=${dateStr}&province=${encodeURIComponent(selectedProvince)}`,
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      selectedDateChanges = (await resp.json()) as ChangesByDateResponse;
      modalLoading = false;
    } catch (err) {
      console.warn('[openDateChanges] 获取日期变更失败:', err);
      modalLoading = false;
    }
  }

  function closeModal() {
    modalOpen = false;
    selectedMachine = null;
    selectedDateChanges = null;
    modalLoading = false;
  }
</script>

<Header
  {selectedProvince}
  {provinces}
  totalCount={allMachines.length}
  {darkMode}
  {onProvinceChange}
  onToggleTheme={toggleTheme}
  onSearchClick={() => { searchOpen = true; }}
/>

<div class="page-body" class:mounted={themeMounted}>
  <div class="skeleton-layer">
    <LoadingSkeleton />
  </div>
  <div class="content-layer">
    {#if status === 'error'}
      <StatusCard status="error" data={null} {errorMsg} onRetry={() => {}} />
    {:else}
      {@const statusInfo = { ok: displayMachines.length > 0, province: selectedProvince, totalCount: allMachines.length, provinceCount }}
      <StatusCard status="loaded" data={statusInfo as StatusData} {errorMsg} onRetry={() => {}} />

      <StatsGrid
        {provinceCount}
        totalCount={allMachines.length}
        added={todayChanges.added}
        province={selectedProvince}
      />

      <HistoryCalendar
        {calYear}
        {calMonth}
        {calDays}
        {calLoading}
        canGoNext={canGoNext()}
        highlightDates={selectedProvince !== '全国' ? provinceHighlightDates : undefined}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onDateClick={openDateChanges}
      />

      <MachineList
        machines={displayMachines}
        province={selectedProvince}
        showProvince={selectedProvince === '全国'}
        onMachineClick={openMachineDetail}
      />

      <TodayChanges
        {todayChanges}
        {recentChanges}
        onClick={() => {
          const today = new Date();
          const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          openDateChanges(dateStr);
        }}
      />

      <Footer
        lastUpdated={init.lastUpdated}
        formattedTime={formatTime(init.lastUpdated)}
        relativeTimeStr={relativeTime(init.lastUpdated)}
      />
    {/if}
  </div>
</div>

<Modal open={modalOpen} title={modalTitle} onclose={closeModal}>
  {#if modalLoading}
    <div class="modal-skeleton">
      <div class="skel skel-line"></div>
      <div class="skel skel-line"></div>
      <div class="skel skel-line"></div>
    </div>
  {:else if selectedMachine}
    <MachineDetail machine={selectedMachine} />
  {:else if selectedDateChanges}
    <DateChangesList
      data={selectedDateChanges}
      province={selectedProvince}
      onMachineClick={openMachineDetail}
    />
  {/if}
</Modal>

<SearchOverlay
  open={searchOpen}
  onclose={() => { searchOpen = false; }}
  onMachineClick={openMachineDetail}
  {allMachines}
/>

<style>
  /* ── 骨架屏 → 内容交叉淡入淡出 ── */
  .page-body {
    display: grid;
    grid-template-areas: "main";
  }
  .page-body > * {
    grid-area: main;
    min-width: 0;
  }

  .skeleton-layer {
    z-index: 1;
    opacity: 1;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .content-layer {
    opacity: 0;
    transition: opacity 0.5s ease;
  }

  .page-body.mounted .skeleton-layer {
    opacity: 0;
  }

  .page-body.mounted .content-layer {
    opacity: 1;
  }

  .modal-skeleton {
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
