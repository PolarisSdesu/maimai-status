<script lang="ts">
  interface Props {
    lastUpdated: string;
    formattedTime: string;
    relativeTimeStr: string;
  }

  let {
    lastUpdated: _lastUpdated,
    formattedTime,
    relativeTimeStr,
  }: Props = $props();
</script>

<div class="footer">
  <span>上次同步：{formattedTime}（{relativeTimeStr}）</span>
  <span class="footer-sep">&middot;</span>
  <span>每小时自动更新</span>
  <div class="powered">Data by SEGA 官方机台注册 API</div>
  <a
    class="x-link"
    href="https://x.com/iamgbxin"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="X (Twitter) - iamgbxin"
    title="X (Twitter) - iamgbxin"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  </a>
</div>

<style>
  .footer {
    text-align: center;
    margin-top: 32px;
    padding: 16px 0;
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }
  .footer-sep {
    opacity: 0.5;
    margin: 0 2px;
  }
  .footer .powered {
    margin-top: 8px;
    font-size: 11px;
    opacity: 0.6;
  }
  .x-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    color: hsl(var(--muted-foreground));
    text-decoration: none;
    font-size: 12px;
    transition: color 0.15s;
  }
  .x-link:hover {
    color: hsl(var(--foreground));
  }
</style>
