<script setup lang="ts">
import { computed } from 'vue';
import { use } from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import type { MetricSeries } from '../services/mockData';

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent]);

const props = withDefaults(defineProps<{
  series: MetricSeries[];
  height?: string;
  mini?: boolean;
  showTimeRangeSelector?: boolean;
  selectedRange?: string;
}>(), {
  height: '300px',
  mini: false,
  showTimeRangeSelector: false,
  selectedRange: '1h'
});

const emit = defineEmits<{
  rangeChange: [range: string];
}>();

const { t } = useI18n();

const ranges = ['1h', '6h', '24h', '7d'];

const chartHeight = computed(() => props.mini ? '40px' : props.height);

const statusColors = ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2'];

const option = computed(() => {
  if (props.mini) {
    const s = props.series[0];
    if (!s) return {};
    return {
      grid: { top: 0, right: 0, bottom: 0, left: 0 },
      xAxis: { type: 'category', show: false, data: s.data.map(d => d.time) },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'line',
        data: s.data.map(d => d.value),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#1890ff' },
        areaStyle: { color: 'rgba(24, 144, 255, 0.1)' }
      }],
      tooltip: { show: false }
    };
  }

  return {
    grid: { top: 40, right: 20, bottom: 30, left: 50 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#f0f0f0',
      textStyle: { color: '#333', fontSize: 12 }
    },
    legend: {
      top: 4,
      textStyle: { color: '#666', fontSize: 12 },
      data: props.series.map(s => s.metricKey + (s.unit ? ` (${s.unit})` : ''))
    },
    xAxis: {
      type: 'category',
      data: props.series[0]?.data.map(d => {
        const date = new Date(d.time);
        return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
      }) ?? [],
      axisLabel: { color: '#999', fontSize: 11 },
      axisLine: { lineStyle: { color: '#f0f0f0' } },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#999', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f5f5f5' } }
    },
    series: props.series.map((s, i) => ({
      name: s.metricKey + (s.unit ? ` (${s.unit})` : ''),
      type: 'line',
      data: s.data.map(d => d.value),
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: statusColors[i % statusColors.length] },
      areaStyle: { color: `${statusColors[i % statusColors.length]}15` }
    }))
  };
});
</script>

<template>
  <div class="metrics-chart">
    <div v-if="showTimeRangeSelector" class="time-range-selector">
      <span class="range-label">{{ t('chart.timeRange') }}</span>
      <button
        v-for="r in ranges"
        :key="r"
        class="range-btn"
        :class="{ active: selectedRange === r }"
        @click="emit('rangeChange', r)"
      >{{ t(`chart.${r}`) }}</button>
    </div>
    <v-chart
      :option="option"
      :style="{ height: chartHeight, width: '100%' }"
      autoresize
    />
  </div>
</template>

<style scoped>
.metrics-chart {
  width: 100%;
}

.time-range-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.range-label {
  font-size: 12px;
  color: #999;
  margin-right: 4px;
}

.range-btn {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.range-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.05);
}

.range-btn:hover:not(.active) {
  border-color: #40a9ff;
  color: #40a9ff;
}
</style>
