<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import AgentView from './AgentView.vue';
import { useProject } from '../composables/useProject';

const router = useRouter();
const { activeProjectCode } = useProject();

const props = defineProps<{
  monitor: {
    id: string;
    nameKey: string;
    name?: string;
    desc: string;
    status: 'ok' | 'error' | 'slow';
    type: 'api' | 'mq' | 'search' | 'order' | 'db' | 'cache';
    metrics: { labelKey: string; value: string; status?: 'good' | 'bad' }[];
    history: ('ok' | 'error' | 'slow')[];
    events?: { time: string; msg: string; id?: string; flow?: { name: string; status: 'ok' | 'error' }[] }[];
    agent?: {
      steps?: { title: string; desc: string }[];
      rootCause?: { title: string; desc: string; confidence?: string };
    };
    flowSteps?: { name: string; status: 'ok' | 'error' | 'pending'; duration?: string }[];
  };
  isExpanded?: boolean;
}>();

const emit = defineEmits(['toggle']);

const { t } = useI18n();
const activeTab = ref('events');

const statusText = computed(() => {
  switch (props.monitor.status) {
    case 'ok': return 'status.normal';
    case 'error': return 'status.error';
    case 'slow': return 'status.slow';
    default: return 'status.normal';
  }
});

const toggleDetail = () => {
  emit('toggle');
};

const switchTab = (tab: string, event: Event) => {
  event.stopPropagation();
  activeTab.value = tab;
};

</script>

<template>
  <div class="monitor-card" :class="props.monitor.status" @click="toggleDetail">
    <div class="card-header">
      <div class="status-icon">
         <svg v-if="monitor.status === 'ok'" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
         <svg v-else-if="monitor.status === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
         <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
      </div>
      <div class="card-info">
        <div class="card-name">{{ monitor.name || t(monitor.nameKey) }}</div>
        <div class="card-desc">{{ monitor.desc }}</div>
      </div>
      <div class="card-status" :class="monitor.status">{{ t(statusText) }}</div>
    </div>

    <!-- Metrics -->
    <div class="metrics">
      <div v-for="(metric, idx) in monitor.metrics" :key="idx" class="metric-item">
        <span class="metric-label">{{ t(metric.labelKey) }}</span>
        <span class="metric-value" :class="metric.status">{{ metric.value }}</span>
      </div>
    </div>
    
    <!-- Mini History Chart -->
    <div class="history-sparkline">
        <div v-for="(h, i) in monitor.history" :key="i" class="spark-bar" :class="h"></div>
    </div>

    <!-- Expanded Details -->
    <div v-if="props.isExpanded" class="card-detail" @click.stop>
      <div class="detail-tabs">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'events' }"
          @click="activeTab = 'events'"
        >
          {{ t('tab.events') }}
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'agent' }"
          @click="activeTab = 'agent'"
        >
          {{ t('tab.agent') }}
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'config' }"
          @click="activeTab = 'config'"
        >
          {{ t('tab.config') }}
        </div>
        <div
          class="tab-item tab-detail"
          @click="router.push({ name: 'detail', params: { projectCode: activeProjectCode, monitorId: monitor.id } })"
        >
          {{ t('flow.viewDetail') }} →
        </div>
      </div>

      <div class="tab-content">
        <!-- Agent Tab -->
        <AgentView 
          v-if="activeTab === 'agent' && monitor.agent"
          :steps="monitor.agent.steps"
          :root-cause="monitor.agent.rootCause"
        >
          <template #actions>
            <div class="action-btns">
              <button class="btn btn-primary">Restart Service</button>
              <button class="btn btn-outline">View Dump</button>
            </div>
          </template>
        </AgentView>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="events-list">
           <div v-for="(ev, idx) in monitor.events" :key="idx" class="event-item">
             <span class="event-time">{{ ev.time }}</span>
             <span class="event-msg">{{ ev.msg }}</span>
           </div>
           <div v-if="!monitor.events?.length" class="empty-state">{{ t('flow.noEvents') }}</div>
        </div>

        <!-- Config Tab -->
        <div v-if="activeTab === 'config'" class="config-pane">
          <div class="config-row">
            <span class="label">{{ t('flow.endpoint') }}:</span>
            <span class="value">{{ monitor.desc }}</span>
          </div>
          <div class="config-row">
            <span class="label">{{ t('form.type') }}:</span>
            <span class="value">{{ monitor.type.toUpperCase() }}</span>
          </div>
          <div v-for="(metric, idx) in monitor.metrics" :key="idx" class="config-row">
            <span class="label">{{ t(metric.labelKey) }}:</span>
            <span class="value">{{ metric.value }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  /* overflow: hidden; Removed for floating detail */
}

.monitor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: #e0e0e0;
}

.monitor-card.error {
  border-left: 4px solid var(--color-error);
}

.monitor-card.slow {
  border-left: 4px solid var(--color-warning);
}

.monitor-card.ok {
  border-left: 4px solid var(--color-success);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.monitor-card.ok .status-icon { background: var(--color-success); }
.monitor-card.error .status-icon { background: var(--color-error); }
.monitor-card.slow .status-icon { background: var(--color-warning); }

.card-info {
  flex: 1;
  overflow: hidden;
}

.card-name {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 12px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f5f5f5;
  color: #666;
}

.card-status.ok { color: var(--color-success); background: rgba(82, 196, 26, 0.1); }
.card-status.error { color: var(--color-error); background: rgba(255, 77, 79, 0.1); }
.card-status.slow { color: var(--color-warning); background: rgba(250, 173, 20, 0.1); }

.metrics {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding-top: 12px;
  border-top: 1px solid #f9f9f9;
}

.metric-item {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 11px;
  color: #999;
  margin-bottom: 2px;
}

.metric-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.metric-value.bad { color: var(--color-error); }

.action-btns { display: flex; gap: 8px; margin-top: 16px; }

.history-sparkline {
  display: flex;
  gap: 2px;
  height: 8px;
  margin-top: 12px;
  width: 100%;
}

.spark-bar {
  flex: 1;
  background: #eee;
  border-radius: 2px;
  height: 100%;
}

.spark-bar.ok { background: var(--color-success); }
.spark-bar.error { background: var(--color-error); }
.spark-bar.slow { background: var(--color-warning); }

.card-detail {
  position: absolute;
  top: 100%; /* Position right below the card */
  left: 0;
  width: 100%;
  background: white;
  z-index: 10;
  box-shadow: 0 8px 16px rgba(0,0,0,0.12);
  border-radius: 0 0 8px 8px;
  border: 1px solid #f0f0f0;
  border-top: none;
  padding: 16px;
  margin-top: -2px; /* Slight overlap to merge borders */
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detail-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  border-bottom: 2px solid transparent;
}

.tab-item {
  font-size: 13px;
  color: #999;
  cursor: pointer;
  padding-bottom: 6px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover { color: #666; }

.tab-item.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: 500;
}

.btn {
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover { background: #1890ff; }

.btn-outline {
  background: white;
  border: 1px solid #d9d9d9;
  color: #666;
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.event-time { color: #999; }

.config-pane {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}

.config-row {
  display: flex;
  justify-content: space-between;
}

.tab-detail {
  margin-left: auto;
  color: var(--color-primary) !important;
  font-weight: 500;
  border-bottom: none !important;
}

.tab-detail:hover {
  opacity: 0.8;
}

</style>
