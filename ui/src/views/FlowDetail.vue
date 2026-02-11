<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useMockService } from '../services/mockService';
import FlowVisualization from '../components/FlowVisualization.vue';
import StepDetailPanel from '../components/StepDetailPanel.vue';
import type { FlowStepDetail, HistorySnapshot } from '../services/mockData';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { getMonitorById } = useMockService();

const monitorId = route.params.monitorId as string;
const monitor = computed(() => getMonitorById(monitorId));

const selectedStepIndex = ref<number | null>(null);
const selectedHistoryIndex = ref<number | null>(null);
const eventFilter = ref<'all' | 'errors'>('all');

// Time labels for each history block (3-min intervals ending at 14:25)
const historyTimeLabels = [
  '13:55', '13:58', '14:01', '14:04', '14:07',
  '14:10', '14:13', '14:16', '14:19', '14:22'
];

const getTimeRange = (index: number) => {
  const start = historyTimeLabels[index] ?? '';
  const end = historyTimeLabels[index + 1] ?? '14:25';
  return `${start}–${end}`;
};

const activeSnapshot = computed<HistorySnapshot | null>(() => {
  if (selectedHistoryIndex.value === null || !monitor.value?.historySnapshots) return null;
  return monitor.value.historySnapshots[selectedHistoryIndex.value] ?? null;
});

const activeFlowSteps = computed(() => {
  if (activeSnapshot.value?.flowSteps) return activeSnapshot.value.flowSteps;
  return monitor.value?.flowSteps ?? [];
});

const activeEvents = computed(() => {
  if (activeSnapshot.value?.events) return activeSnapshot.value.events;
  return monitor.value?.events ?? [];
});

const activeAgent = computed(() => {
  if (activeSnapshot.value) return activeSnapshot.value.agent ?? null;
  return monitor.value?.agent ?? null;
});

const selectedStep = computed<FlowStepDetail | null>(() => {
  if (selectedStepIndex.value === null) return null;
  return activeFlowSteps.value[selectedStepIndex.value] ?? null;
});

const handleSelectHistory = (index: number) => {
  selectedStepIndex.value = null;
  selectedHistoryIndex.value = selectedHistoryIndex.value === index ? null : index;
};

const filteredEvents = computed(() => {
  const events = activeEvents.value;
  if (!events.length) return [];
  if (eventFilter.value === 'errors') {
    return events.filter(ev =>
      ev.flow?.some(f => f.status === 'error') ||
      ev.msg.toLowerCase().includes('timeout') ||
      ev.msg.toLowerCase().includes('error') ||
      ev.msg.toLowerCase().includes('refused')
    );
  }
  return events;
});

const handleSelectStep = (index: number) => {
  selectedStepIndex.value = selectedStepIndex.value === index ? null : index;
};

const goBack = () => {
  router.push({ name: 'dashboard' });
};

const getEventStatusClass = (event: { flow?: { name: string; status: 'ok' | 'error' }[] }) => {
  if (event.flow?.some(f => f.status === 'error')) return 'event-error';
  return 'event-ok';
};
</script>

<template>
  <div v-if="monitor" class="flow-detail">
    <!-- Header -->
    <div class="page-header">
      <button class="back-btn" @click="goBack">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        {{ t('flow.backToDashboard') }}
      </button>
      <h1 class="page-title">{{ t(monitor.nameKey) }}</h1>
      <span v-if="monitor.status === 'error'" class="error-badge">{{ t('status.error') }}</span>
    </div>

    <!-- Metrics Summary -->
    <div class="section metrics-summary">
      <div class="section-title">{{ t('flow.metricsTitle') }}</div>
      <div class="metrics-grid">
        <div v-for="(metric, idx) in monitor.metrics" :key="idx" class="metric-card">
          <span class="metric-label">{{ t(metric.labelKey) }}</span>
          <span class="metric-value" :class="metric.status">{{ metric.value }}</span>
        </div>
        <div v-if="monitor.flowSteps" class="metric-card">
          <span class="metric-label">{{ t('flow.steps') }}</span>
          <span class="metric-value">{{ monitor.flowSteps.length }}</span>
        </div>
      </div>
    </div>

    <!-- History Status Bar -->
    <div class="section" v-if="monitor.history">
      <div class="history-bar">
        <div
          v-for="(h, i) in monitor.history"
          :key="i"
          class="history-item"
          :class="{ selected: selectedHistoryIndex === i }"
          @click="handleSelectHistory(i)"
        >
          <div class="history-block" :class="h"></div>
          <span class="history-time">{{ getTimeRange(i) }}</span>
        </div>
      </div>
    </div>

    <!-- Flow Visualization -->
    <div class="section">
      <div class="section-title">{{ t('flow.flowTitle') }}</div>
      <FlowVisualization
        v-if="activeFlowSteps.length"
        :steps="activeFlowSteps"
        :selected-index="selectedStepIndex"
        @select="handleSelectStep"
      />
    </div>

    <!-- Step Detail -->
    <div class="section" v-if="selectedStep">
      <div class="section-title">{{ t('flow.stepDetail') }}</div>
      <StepDetailPanel :step="selectedStep" />
    </div>
    <div class="section hint" v-else>
      <div class="select-hint">{{ t('flow.selectStep') }}</div>
    </div>

    <!-- Events -->
    <div class="section">
      <div class="section-title">{{ t('flow.eventsTitle') }}</div>
      <div class="event-filters">
        <button
          class="filter-btn"
          :class="{ active: eventFilter === 'all' }"
          @click="eventFilter = 'all'"
        >{{ t('flow.filterAll') }}</button>
        <button
          class="filter-btn"
          :class="{ active: eventFilter === 'errors' }"
          @click="eventFilter = 'errors'"
        >{{ t('flow.filterErrors') }}</button>
      </div>
      <div class="events-list">
        <div
          v-for="(ev, idx) in filteredEvents"
          :key="idx"
          class="event-row"
          :class="getEventStatusClass(ev)"
        >
          <span class="event-time">{{ ev.time }}</span>
          <span class="event-id" v-if="ev.id">{{ ev.id }}</span>
          <span class="event-msg">{{ ev.msg }}</span>
          <span class="event-status-tag" v-if="ev.flow?.some(f => f.status === 'error')">ERROR</span>
          <span class="event-status-tag ok" v-else-if="ev.flow">OK</span>
        </div>
        <div v-if="filteredEvents.length === 0" class="empty-state">{{ t('flow.noEvents') }}</div>
      </div>
    </div>

    <!-- Agent Analysis -->
    <div class="section" v-if="activeAgent?.rootCause">
      <div class="section-title">{{ t('flow.agentTitle') }}</div>
      <div class="agent-card">
        <div class="agent-label">{{ activeAgent.rootCause.title }}</div>
        <div class="agent-desc">{{ activeAgent.rootCause.desc }}</div>
        <div v-if="activeAgent.rootCause.confidence" class="agent-confidence">{{ activeAgent.rootCause.confidence }}</div>
      </div>
    </div>
  </div>

  <div v-else class="not-found">
    <p>Monitor not found.</p>
    <button class="back-btn" @click="goBack">{{ t('flow.backToDashboard') }}</button>
  </div>
</template>

<style scoped>
.flow-detail {
  max-width: 1200px;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.error-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.1);
  padding: 3px 10px;
  border-radius: 10px;
}

/* Sections */
.section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
}

/* Metrics */
.metrics-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.metric-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 140px;
}

.metric-label {
  font-size: 12px;
  color: #999;
}

.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.metric-value.bad {
  color: var(--color-error);
}

.metric-value.good {
  color: var(--color-success);
}

/* History Bar */
.history-bar {
  display: flex;
  gap: 4px;
}

.history-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.history-block {
  width: 100%;
  height: 24px;
  border-radius: 4px;
  transition: all 0.15s;
  opacity: 0.85;
}

.history-item:hover .history-block {
  opacity: 1;
  transform: scaleY(1.15);
}

.history-item.selected .history-block {
  opacity: 1;
  transform: scaleY(1.2);
  box-shadow: 0 0 0 2px #333;
}

.history-time {
  font-size: 10px;
  color: #bbb;
  margin-top: 6px;
  white-space: nowrap;
  transition: color 0.15s;
}

.history-item:hover .history-time {
  color: #666;
}

.history-item.selected .history-time {
  color: #333;
  font-weight: 600;
}

.history-block.ok { background: var(--color-success); }
.history-block.error { background: var(--color-error); }
.history-block.slow { background: var(--color-warning); }

/* Hint */
.hint {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.select-hint {
  text-align: center;
  font-size: 13px;
  color: #bbb;
}

/* Events */
.event-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-btn {
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(24, 144, 255, 0.05);
}

.events-list {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.event-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  font-size: 13px;
  border-bottom: 1px solid #f9f9f9;
  transition: background 0.15s;
}

.event-row:last-child {
  border-bottom: none;
}

.event-row:hover {
  background: #fafafa;
}

.event-time {
  color: #999;
  min-width: 50px;
  font-size: 12px;
}

.event-id {
  color: #555;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  min-width: 70px;
}

.event-msg {
  flex: 1;
  color: #333;
}

.event-status-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  color: var(--color-error);
  background: rgba(255, 77, 79, 0.1);
}

.event-status-tag.ok {
  color: var(--color-success);
  background: rgba(82, 196, 26, 0.1);
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #ccc;
  font-size: 13px;
}

/* Agent */
.agent-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px 20px;
}

.agent-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
}

.agent-desc {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
}

.agent-confidence {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* Not found */
.not-found {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.not-found p {
  margin-bottom: 16px;
  font-size: 15px;
}
</style>
