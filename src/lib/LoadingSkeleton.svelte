<script lang="ts">
</script>

<div class="cal-card">
  <div class="cal-header">
    <div class="cal-title">机台概况</div>
  </div>
  <div class="cal-body cal-body-overview">
    <div class="overview-grid">
      {#each [1, 2, 3] as _}
        <div class="overview-item">
          <div class="skel skel-line" style="width:48px;height:32px;margin:0 auto 6px"></div>
          <div class="skel skel-line" style="width:56px;height:14px;margin:0 auto"></div>
        </div>
      {/each}
    </div>
  </div>
</div>

<div class="card">
  {#each [1, 2, 3] as _}
    <div class="component-item">
      <div class="skel" style="width:10px;height:10px;border-radius:50%"></div>
      <div class="component-info">
        <div class="skel skel-line" style="width:45%"></div>
        <div class="skel skel-line" style="width:70%"></div>
      </div>
    </div>
  {/each}
</div>
