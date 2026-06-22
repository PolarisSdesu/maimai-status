<script lang="ts">
  import type { StatusData } from './types';

  interface Props {
    status: 'loading' | 'loaded' | 'error';
    data: StatusData | null;
    errorMsg: string;
    onRetry: () => void;
  }

  let { status, data, errorMsg, onRetry }: Props = $props();
</script>

{#if status === 'loading'}
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

{:else if status === 'error'}
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
    <button class="btn-retry" onclick={onRetry}>重新连接</button>
  </div>

{:else}
  {@const d = data!}
  {#if d.ok}
    <div class="status-card status-card-operational">
      <div class="status-card-body">
        <h2>
          <div class="status-icon status-icon-success" aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          API 数据正常
        </h2>
        <p>{d.province === '全国' ? `全国共 ${d.totalCount} 台舞萌机台` : `${d.province}省共 ${d.provinceCount} 台舞萌机台`}</p>
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
        <p>{d.province === '全国' ? '全国暂无舞萌机台注册信息' : `${d.province}省暂无舞萌机台注册信息`}</p>
      </div>
    </div>
  {/if}
{/if}

<style>
  .status-card {
    border: 1px solid transparent; border-radius: 0.75rem; padding: 0.25rem;
    overflow: hidden; margin-bottom: 24px;
  }
  .status-card-body         { padding: 0.75rem 1rem 1rem; }
  .status-card-body h2      { font-weight: 500; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; color: hsl(var(--card-foreground)); }
  .status-card-body p       { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.25rem; margin-left: 1.5rem; }

  .status-card-operational  { background: #d1fae5; }
  .status-card-warning      { background: #fef3c7; }
  .status-card-error        { background: #fee2e2; }
  .status-card-loading      { background: hsl(var(--muted)); }

  :global(.dark) .status-card-operational { background: rgba(16, 185, 129, 0.2); }
  :global(.dark) .status-card-warning     { background: rgba(245, 158, 11, 0.2); }
  :global(.dark) .status-card-error       { background: rgba(239, 68, 68, 0.2); }

  .status-icon {
    width: 1rem; height: 1rem; border-radius: 9999px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .status-icon-success { background: #22c55e; }
  .status-icon-warning { background: #f59e0b; }
  .status-icon-danger  { background: #ef4444; }
  .status-icon-muted   { background: #9ca3af; }

  .loading-dot {
    width: 6px; height: 6px; border-radius: 50%; background: white;
    animation: pulse 2s ease-in-out infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

  .error-actions { text-align: center; margin-top: 16px; }
  .btn-retry {
    display: inline-flex; align-items: center; justify-content: center;
    height: 36px; padding: 0 20px; border-radius: var(--radius);
    border: 1px solid hsl(var(--border)); background: hsl(var(--card));
    cursor: pointer; color: hsl(var(--foreground)); font-size: 14px;
    font-weight: 500; font-family: inherit; transition: background 0.15s, border-color 0.15s;
  }
  .btn-retry:active { background: hsl(var(--accent)); }
  @media (any-hover: hover) {
    .btn-retry:hover { background: hsl(var(--accent)); }
  }
</style>
