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

  let { data } = $props();

  // Snapshot initial prop values to avoid reactive capture of one-time SSR data
  const init = (() => $state.snapshot(data))();

  let status = $state<'loading' | 'loaded' | 'error'>('loaded');
  let statusData = $state<StatusData | null>(init);
  let errorMsg = $state('');
  let darkMode = $state(false);
  let themeMounted = $state(false);

  // Province
  let selectedProvince = $state(init.province);
  let provinces = $state<ProvinceInfo[]>(init.provinces);

  // Calendar
  let calYear = $state(init.calYear);
  let calMonth = $state(init.calMonth);
  let calDays = $state<CalendarDay[]>(init.calDays);
  let calLoading = $state(false);

  // Search overlay
  let searchOpen = $state(false);

  // Modal
  let modalOpen = $state(false);
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

  $effect(() => {
    if (themeMounted) {
      document.title = '全国舞萌机台数据库';
    }
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

  async function fetchProvinces() {
    try {
      const resp = await fetch('/api/provinces');
      if (resp.ok) provinces = (await resp.json()).provinces;
    } catch {
      /* ignore */
    }
  }

  async function fetchStatus() {
    try {
      const resp = await fetch(
        `/api/status?province=${encodeURIComponent(selectedProvince)}`,
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      statusData = (await resp.json()) as StatusData;
      status = 'loaded';
    } catch (err) {
      status = 'error';
      errorMsg = err instanceof Error ? err.message : '网络请求失败';
    }
  }

  async function fetchCalendar() {
    calLoading = true;
    try {
      const resp = await fetch(
        `/api/history-calendar?year=${calYear}&month=${calMonth}&province=${encodeURIComponent(selectedProvince)}`,
      );
      if (resp.ok) calDays = (await resp.json()) as CalendarDay[];
    } catch {
      /* ignore */
    }
    calLoading = false;
  }

  function onProvinceChange(e: Event) {
    const sel = e.target as HTMLSelectElement;
    selectedProvince = sel.value;
    sel.blur();
    status = 'loading';
    fetchStatus();
    fetchCalendar();
  }

  function prevMonth() {
    if (calMonth === 1) {
      calMonth = 12;
      calYear--;
    } else {
      calMonth--;
    }
    fetchCalendar();
  }

  function nextMonth() {
    const now = new Date();
    if (calYear === now.getFullYear() && calMonth >= now.getMonth() + 1) return;
    if (calMonth === 12) {
      calMonth = 1;
      calYear++;
    } else {
      calMonth++;
    }
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
    modalOpen = true;
  }

  async function openDateChanges(dateStr: string) {
    try {
      const resp = await fetch(
        `/api/changes-by-date?date=${dateStr}&province=${encodeURIComponent(selectedProvince)}`,
      );
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      selectedDateChanges = (await resp.json()) as ChangesByDateResponse;
      selectedMachine = null;
      modalTitle = `${dateStr} 变更`;
      modalOpen = true;
    } catch {
      /* silently fail */
    }
  }

  function closeModal() {
    modalOpen = false;
    selectedMachine = null;
    selectedDateChanges = null;
  }
</script>

<Header
  {selectedProvince}
  {provinces}
  totalCount={statusData?.totalCount}
  {darkMode}
  {onProvinceChange}
  onToggleTheme={toggleTheme}
  onSearchClick={() => { searchOpen = true; }}
/>

{#if !themeMounted}
  <div style="min-height:60vh"></div>
{:else if status === 'loading'}
  <StatusCard status="loading" data={null} errorMsg="" onRetry={fetchStatus} />
  <LoadingSkeleton />
{:else if status === 'error'}
  <StatusCard {status} data={statusData} {errorMsg} onRetry={fetchStatus} />
{:else}
  {@const d = statusData!}

  <StatusCard {status} data={statusData} {errorMsg} onRetry={fetchStatus} />

  <StatsGrid
    provinceCount={d.provinceCount}
    totalCount={d.totalCount}
    added={d.todayChanges.added}
    province={d.province}
  />

  <HistoryCalendar
    {calYear}
    {calMonth}
    {calDays}
    {calLoading}
    canGoNext={canGoNext()}
    onPrevMonth={prevMonth}
    onNextMonth={nextMonth}
    onDateClick={openDateChanges}
  />

  <MachineList
    machines={d.machines}
    province={d.province}
    showProvince={d.province === '全国'}
    onMachineClick={openMachineDetail}
  />

  <TodayChanges
    todayChanges={d.todayChanges}
    recentChanges={d.recentChanges}
    onClick={() => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      openDateChanges(dateStr);
    }}
  />

  <Footer
    lastUpdated={d.lastUpdated}
    formattedTime={formatTime(d.lastUpdated)}
    relativeTimeStr={relativeTime(d.lastUpdated)}
  />
{/if}

<Modal open={modalOpen} title={modalTitle} onclose={closeModal}>
  {#if selectedMachine}
    <div class="machine-detail">
      <div class="detail-row">
        <span class="detail-label">省份：</span><span class="detail-value"
          >{selectedMachine.province}</span
        >
      </div>
      <div class="detail-row detail-row-top">
        <span class="detail-label">地址：</span><span
          class="detail-value detail-value-addr">{selectedMachine.address}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">状态：</span><span class="detail-value"
          >{#if selectedMachine.is_active === 1}<span
              class="detail-status-active">在线</span
            >{:else}<span class="detail-status-offline">离线</span>{/if}</span
        >
      </div>
      <div class="detail-divider"></div>
      <div class="detail-row">
        <span class="detail-label">首次发现：</span><span class="detail-value"
          >{new Date(selectedMachine.first_seen_at).toLocaleString(
            'zh-CN',
          )}</span
        >
      </div>
      <div class="detail-row">
        <span class="detail-label">最后更新：</span><span class="detail-value"
          >{new Date(selectedMachine.last_seen_at).toLocaleString(
            'zh-CN',
          )}</span
        >
      </div>
    </div>
  {:else if selectedDateChanges}
    {#if selectedDateChanges.isInit}
      <p class="empty-state">初始化 · 首次数据采集</p>
    {:else}
      {#if selectedDateChanges.added.length > 0}
        <h3 class="detail-section-title">
          新增 (+{selectedDateChanges.added.length})
        </h3>
        {#each selectedDateChanges.added as m (m.id)}
          <div
            class="component-item"
            onclick={() => openMachineDetail(m)}
            role="button"
            tabindex="0"
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') openMachineDetail(m);
            }}
          >
            <div class="dot new"></div>
            <div class="component-info">
              <div class="component-name">{m.arcade_name}</div>
              <div class="component-meta">
                {selectedProvince === '全国'
                  ? `${m.province} · ${m.address}`
                  : m.address}
              </div>
            </div>
          </div>
        {/each}
      {/if}
      {#if selectedDateChanges.removed.length > 0}
        <h3 class="detail-section-title">
          移除 (-{selectedDateChanges.removed.length})
        </h3>
        {#each selectedDateChanges.removed as m (m.id)}
          <div
            class="component-item"
            onclick={() => openMachineDetail(m)}
            role="button"
            tabindex="0"
            onkeydown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') openMachineDetail(m);
            }}
          >
            <div class="dot offline"></div>
            <div class="component-info">
              <div class="component-name">{m.arcade_name}</div>
              <div class="component-meta">
                {selectedProvince === '全国'
                  ? `${m.province} · ${m.address}`
                  : m.address}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    {/if}
  {/if}
</Modal>

<SearchOverlay
  open={searchOpen}
  onclose={() => { searchOpen = false; }}
  onMachineClick={openMachineDetail}
/>
