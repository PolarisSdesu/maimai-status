<script lang="ts">
  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    children: import('svelte').Snippet;
  }

  let { open, title, onclose, children }: Props = $props();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  $effect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    };
  });

  function onBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="modal-overlay" onclick={onBackdropClick} role="dialog" aria-modal="true" aria-label={title} tabindex="-1">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">{title}</h2>
        <button class="modal-close" onclick={onclose} aria-label="关闭">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        {@render children()}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 70;
    background: hsl(var(--foreground) / 0.3);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    animation: modal-fade-in 0.15s ease-out;
  }

  .modal-content {
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: var(--radius);
    box-shadow: 0 8px 32px hsl(var(--foreground) / 0.12);
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    animation: modal-scale-in 0.15s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid hsl(var(--border));
  }

  .modal-title {
    font-size: 16px;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  .modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius);
    border: none;
    background: transparent;
    color: hsl(var(--muted-foreground));
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .modal-close:hover {
    background: hsl(var(--accent));
    color: hsl(var(--foreground));
  }

  .modal-body {
    padding: 16px 20px;
  }

  @keyframes modal-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modal-scale-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  /* Snippet-rendered content (global — rendered by App.svelte) */
  :global {
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
      align-items: flex-start;
      padding: 5px 0;
    }
    .detail-label {
      font-size: 12px;
      color: hsl(var(--muted-foreground));
      flex-shrink: 0;
    }
    .detail-value {
      font-size: 12px;
      color: hsl(var(--foreground));
      font-weight: 500;
      flex: 1;
      font-feature-settings: "tnum" 1;
    }
    .detail-value-addr {
      font-weight: 400;
      color: hsl(var(--muted-foreground));
      word-break: break-word;
    }
    .detail-status-active {
      color: hsl(142 71% 40%);
      font-weight: 500;
    }
    .detail-status-offline {
      color: hsl(var(--muted-foreground));
      font-weight: 400;
    }
    .dark .detail-status-active {
      color: hsl(142 71% 60%);
    }
    .detail-section-title {
      font-size: 13px;
      font-weight: 600;
      color: hsl(var(--muted-foreground));
      margin-bottom: 8px;
      padding: 0 0 4px;
      border-bottom: 1px solid hsl(var(--border));
    }
    .detail-section-title + .detail-section-title {
      margin-top: 16px;
    }
  }

  .modal-body :global(.component-item) {
    padding: 10px 0;
    border-bottom: 1px solid hsl(var(--border) / 0.5);
    cursor: pointer;
  }
  .modal-body :global(.component-item):hover {
    background: hsl(var(--accent));
    margin: 0 -20px;
    padding: 10px 20px;
  }
</style>
