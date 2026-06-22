<script lang="ts">
  import type { ProvinceInfo } from "./types";
  import logo from "../assets/Logo_Maimai_DX_PRiSM_PLUS.webp";

  interface Props {
    selectedProvince: string;
    provinces: ProvinceInfo[];
    totalCount?: number;
    darkMode: boolean;
    onProvinceChange: (e: Event) => void;
    onToggleTheme: () => void;
    onSearchClick: () => void;
  }

  let {
    selectedProvince,
    provinces,
    totalCount,
    darkMode,
    onProvinceChange,
    onToggleTheme,
    onSearchClick,
  }: Props = $props();
</script>

<header class="page-header">
  <a href="/" class="logo-link">
    <img class="logo-icon" src={logo} alt="Maimai_DX_LOGO" />
  </a>
  <div class="header-actions">
    <button
      class="theme-toggle"
      onclick={onToggleTheme}
      aria-label={darkMode ? "切换到浅色模式" : "切换到深色模式"}
    >
      <svg
        class="icon-sun"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path
          d="M12 20v2"
        />
        <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" /><path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
      </svg>
      <svg
        class="icon-moon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path
          d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"
        />
      </svg>
    </button>
    <select
      class="province-select"
      value={selectedProvince}
      onchange={onProvinceChange}
      aria-label="选择省份"
    >
      <option value="全国">全国 ({totalCount ?? "..."})</option>
      {#each provinces as p}
        <option value={p.province}>{p.province} ({p.count})</option>
      {/each}
    </select>
    <button
      class="search-btn"
      onclick={onSearchClick}
      aria-label="搜索全国机台"
      title="搜索全国机台"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    </button>
  </div>
</header>

<style>
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
    transition: opacity 0.15s;
  }
  .logo-link:active {
    opacity: 0.8;
  }
  @media (any-hover: hover) {
    .logo-link:hover {
      opacity: 0.8;
    }
  }
  .logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .province-select {
    height: 36px;
    padding: 0 32px 0 12px;
    border: 1px solid hsl(var(--border));
    border-radius: 8px;
    background: transparent;
    color: hsl(var(--foreground));
    font-size: 14px;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    transition:
      background 0.15s,
      border-color 0.15s;
    outline: none;
    max-width: 160px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .province-select:active {
    background-color: hsl(var(--accent));
  }
  @media (any-hover: hover) {
    .province-select:hover {
      background-color: hsl(var(--accent));
    }
  }
  .province-select:focus {
    outline: none;
  }

  .search-btn {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid hsl(var(--border));
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.15s,
      color 0.15s,
      border-color 0.15s;
  }
  .search-btn:active {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  @media (any-hover: hover) {
    .search-btn:hover {
      background: hsl(var(--accent));
      color: hsl(var(--accent-foreground));
    }
  }

  .theme-toggle {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: 1px solid hsl(var(--border));
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background 0.15s,
      color 0.15s;
  }
  .theme-toggle:active {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
  }
  @media (any-hover: hover) {
    .theme-toggle:hover {
      background: hsl(var(--accent));
      color: hsl(var(--accent-foreground));
    }
  }

  .icon-sun {
    position: absolute;
    transform: rotate(0deg) scale(1);
    transition: transform 0.2s ease;
  }
  .icon-moon {
    position: absolute;
    transform: rotate(90deg) scale(0);
    transition: transform 0.2s ease;
  }

  :global(.dark) .icon-sun {
    transform: rotate(-90deg) scale(0);
  }
  :global(.dark) .icon-moon {
    transform: rotate(0deg) scale(1);
  }

  @media (max-width: 480px) {
    .page-header {
      flex-direction: column;
      gap: 12px;
      text-align: center;
    }
    .logo-link {
      justify-content: center;
    }
    .header-actions {
      flex-wrap: wrap;
      justify-content: center;
    }
    .province-select {
      max-width: 130px;
      font-size: 13px;
    }
  }
</style>
