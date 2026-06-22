<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>全国舞萌机台数据库</title>
</svelte:head>

{@render children()}
