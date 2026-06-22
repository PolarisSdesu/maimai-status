<script lang="ts">
  interface Props {
    lastUpdated: string;
    formattedTime: string;
    relativeTimeStr: string;
  }

  let { lastUpdated: _lastUpdated, formattedTime, relativeTimeStr }: Props = $props();
</script>

<div class="footer">
  <span>上次同步：{formattedTime}（{relativeTimeStr}）</span>
  <span class="footer-sep">&middot;</span>
  <span>每小时自动更新</span>
  <div class="powered">Powered by SEGA 官方机台注册 API</div>
</div>

<style>
  .footer { text-align: center; margin-top: 32px; padding: 16px 0; font-size: 12px; color: hsl(var(--muted-foreground)); }
  .footer-sep { opacity: 0.5; margin: 0 2px; }
  .footer .powered { margin-top: 8px; font-size: 11px; opacity: 0.6; }
</style>
