<script lang="ts">
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
      {#if province !== '全国'}
      <div class="overview-item">
        <div class="overview-value">{provinceCount}</div>
        <div class="overview-label">{province}机台</div>
      </div>
      {/if}
      <div class="overview-item">
        <div class="overview-value">{province === '全国' ? provinceCount : totalCount}</div>
        <div class="overview-label">全国机台</div>
      </div>
      <div class="overview-item">
        <div class="overview-value" class:overview-value-highlight={added > 0}>
          +{added}
        </div>
        <div class="overview-label">今日新增</div>
      </div>
    </div>
  </div>
</div>
