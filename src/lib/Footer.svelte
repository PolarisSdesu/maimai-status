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
  <div>全国舞萌机台数据库</div>
  <span>上次同步：{formattedTime} ({relativeTimeStr})</span><span
    class="footer-sep">・</span
  ><span>每小时自动更新</span>
  <div class="powered">Data by SEGA 官方机台注册 API</div>
  <div class="social-links">
    <a href="https://x.com/iamgbxin" target="_blank" rel="noopener noreferrer"
      >X (旧 Twitter)</a
    >
    <span class="social-sep">|</span>
    <a
      href="https://space.bilibili.com/294080110/lists"
      target="_blank"
      rel="noopener noreferrer">bilibili</a
    >
    <span class="social-sep">|</span>
    <a
      href="https://github.com/PolarisSdesu/maimai-status"
      target="_blank"
      rel="noopener noreferrer">GitHub</a
    >
  </div>
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
  .social-links {
    margin-top: 8px;
    font-size: 12px;
  }
  .social-links a {
    color: hsl(var(--muted-foreground));
    text-decoration: none;
    transition: color 0.15s;
  }
  .social-links a:hover {
    color: hsl(var(--foreground));
  }
  .social-sep {
    opacity: 0.4;
    margin: 0 4px;
  }
</style>
