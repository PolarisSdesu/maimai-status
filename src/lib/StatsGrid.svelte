<script lang="ts">
  import FlowFromZero from './FlowFromZero.svelte';

  interface Props {
    provinceCount: number;
    totalCount: number;
    added: number;
    province: string;
  }

  let { provinceCount, totalCount, added, province }: Props = $props();
</script>

<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">机台概况</div>
  </div>
  <div class="cal-body cal-body-overview">
    <div class="overview-grid" class:overview-grid-2col={province === '全国'}>
      <!-- 省份列：切换省份时 {#key} 强制重挂，从 0 flow -->
      {#if province !== '全国'}
        <div class="overview-item">
          <div class="overview-value">
            {#key province}
              <FlowFromZero value={provinceCount} />
            {/key}
          </div>
          <div class="overview-label">{province}机台</div>
        </div>
      {/if}
      <!-- 全国列：仅在网页首次加载时从 0 flow -->
      <div class="overview-item">
        <div class="overview-value">
          <FlowFromZero value={province === '全国' ? provinceCount : totalCount} />
        </div>
        <div class="overview-label">全国机台</div>
      </div>
      <!-- 今日新增：首次加载从 0 flow，后续 value 变化自然过渡 -->
      <div class="overview-item">
        <div class="overview-value" class:overview-value-highlight={added > 0}>
          <FlowFromZero value={added} prefix="+" />
        </div>
        <div class="overview-label">今日新增</div>
      </div>
    </div>
  </div>
</div>
