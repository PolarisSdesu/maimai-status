<script lang="ts">
  import { browser } from '$app/environment';
  import NumberFlow from '@number-flow/svelte';

  /**
   * 包装 NumberFlow，首次挂载时从 0 流动到目标值。
   * 后续 value 变化时自然过渡（不从 0 重新开始）。
   */
  interface Props {
    value: number;
    prefix?: string;
  }

  let { value, prefix = '' }: Props = $props();

  let display = $state(0);
  let ready = $state(false);

  $effect(() => {
    if (!browser) {
      // SSR: 直接渲染目标值（无动画）
      display = value;
      return;
    }

    if (!ready) {
      // 首次挂载：下一帧切到目标值，触发 0→value 动画
      const id = requestAnimationFrame(() => {
        display = value;
        ready = true;
      });
      return () => cancelAnimationFrame(id);
    } else {
      // 后续 value 变化：直接更新，NumberFlow 自己处理过渡动画
      display = value;
    }
  });
</script>

<NumberFlow value={display} {prefix} respectMotionPreference={false} />
