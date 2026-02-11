<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MonitorCard from '../components/MonitorCard.vue';
import Drawer from '../components/Drawer.vue';
import AgentView from '../components/AgentView.vue';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';
import type { Monitor } from '../services/mockData';

const { t } = useI18n();
const { getInfrastructure, getBusiness, startSimulation, stopSimulation } = useMockService();
const { activeProjectId } = useProject();

const infrastructureMonitors = ref<Monitor[]>([]);
const businessMonitors = ref<Monitor[]>([]);
const isSimulating = ref(false);
const isLoading = ref(true);

const selectedMonitor = ref<Monitor | null>(null);

const toggleSimulation = () => {
  if (isSimulating.value) {
    stopSimulation();
    isSimulating.value = false;
  } else {
    startSimulation();
    isSimulating.value = true;
  }
};

const fetchData = async () => {
    isLoading.value = true;
    infrastructureMonitors.value = [];
    businessMonitors.value = [];
    
    const infra = await getInfrastructure(activeProjectId.value);
    const bus = await getBusiness(activeProjectId.value);
    
    infrastructureMonitors.value = infra.value;
    businessMonitors.value = bus.value;
    isLoading.value = false;
};

const handleSelectMonitor = (monitor: Monitor) => {
    selectedMonitor.value = monitor;
};

watch(activeProjectId, () => {
    fetchData();
});

onMounted(async () => {
  await fetchData();
});

onUnmounted(() => {
    stopSimulation();
});
</script>

<template>
  <div class="monitor-group">
    <div class="group-header">
      <div class="group-title">
        <span>{{ t('section.infrastructure') }}</span>
        <span class="group-count">({{ isLoading ? '...' : infrastructureMonitors.length }})</span>
      </div>
      <div class="group-filter">
          <button @click="toggleSimulation" style="cursor: pointer; padding: 4px 12px; border-radius: 4px; border: 1px solid #d9d9d9; background: white;">
              {{ isSimulating ? 'Stop Simulation' : 'Start Simulation' }}
          </button>
      </div>
    </div>
    
    <div class="monitor-grid">
      <!-- Skeleton Loading -->
      <template v-if="isLoading">
        <div v-for="i in 3" :key="'skel-infra-'+i" class="skeleton-card">
           <div class="skeleton-header">
               <div class="skeleton-icon"></div>
               <div class="skeleton-title"></div>
               <div class="skeleton-status"></div>
           </div>
           <div class="skeleton-body">
               <div class="skeleton-line"></div>
               <div class="skeleton-line short"></div>
           </div>
        </div>
      </template>

      <MonitorCard
        v-if="!isLoading"
        v-for="m in infrastructureMonitors"
        :key="m.id"
        :monitor="m as any"
        @select="handleSelectMonitor"
      />
    </div>
  </div>

  <div class="monitor-group">
     <div class="group-header">
      <div class="group-title">
        <span>{{ t('section.businessFlow') }}</span>
        <span class="group-count">({{ isLoading ? '...' : businessMonitors.length }})</span>
      </div>
    </div>
    <div class="monitor-grid">
       <!-- Skeleton Loading -->
      <template v-if="isLoading">
        <div v-for="i in 2" :key="'skel-bus-'+i" class="skeleton-card">
           <div class="skeleton-header">
               <div class="skeleton-icon"></div>
               <div class="skeleton-title"></div>
               <div class="skeleton-status"></div>
           </div>
           <div class="skeleton-body">
               <div class="skeleton-line"></div>
               <div class="skeleton-line short"></div>
           </div>
        </div>
      </template>

      <MonitorCard
        v-if="!isLoading"
        v-for="m in businessMonitors"
        :key="m.id"
        :monitor="m as any"
        @select="handleSelectMonitor"
      />
    </div>
  </div>

  <!-- Monitor Detail Drawer -->
  <Drawer
    :visible="!!selectedMonitor"
    :title="selectedMonitor ? ((selectedMonitor as any).name || t(selectedMonitor.nameKey)) : 'Monitor Details'"
    @close="selectedMonitor = null"
    @confirm="selectedMonitor = null"
  >
    <div v-if="selectedMonitor" class="monitor-details">
        <div class="detail-header">
             <div class="detail-desc">{{ selectedMonitor.desc }}</div>
             <div class="detail-status" :class="selectedMonitor.status">{{ t(`status.${selectedMonitor.status}`) }}</div>
        </div>

        <div class="details-section">
            <div class="section-title">{{ t('tab.events') }}</div>
            <div class="event-list">
            <div v-for="(event, idx) in selectedMonitor.events" :key="idx" class="event-item">
                <div class="event-time">{{ event.time }}</div>
                <div class="event-msg">{{ event.msg }}</div>
            </div>
            <div v-if="!selectedMonitor.events || selectedMonitor.events.length === 0" class="no-data">No recent events</div>
            </div>
        </div>

        <div class="details-section" v-if="selectedMonitor.agent">
            <div class="section-title">{{ t('tab.agent') }}</div>
            <AgentView 
            :steps="selectedMonitor.agent.steps"
            :rootCause="selectedMonitor.agent.rootCause"
            />
        </div>
    </div>
  </Drawer>
</template>

<style scoped>
.monitor-group {
  margin-bottom: 32px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.group-count {
  color: var(--color-text-secondary);
  font-weight: normal;
  margin-left: 8px;
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 16px;
}

/* Skeleton Styles */
.skeleton-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #f0f0f0;
    height: 180px;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.skeleton-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.skeleton-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f0f0f0;
    animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.skeleton-title {
    flex: 1;
    height: 16px;
    background: #f0f0f0;
    border-radius: 4px;
    animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.skeleton-status {
    width: 40px;
    height: 20px;
    background: #f0f0f0;
    border-radius: 4px;
    animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.skeleton-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
}

.skeleton-line {
    height: 12px;
    background: #f0f0f0;
    border-radius: 4px;
    width: 100%;
    animation: skeleton-pulse 1.5s infinite ease-in-out;
}

.skeleton-line.short {
    width: 60%;
}

@keyframes skeleton-pulse {
    0% { opacity: 0.6; }
    50% { opacity: 0.3; }
    100% { opacity: 0.6; }
}

/* Detail Styles */
.detail-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.detail-desc {
    color: #666;
    margin-bottom: 8px;
}

.detail-status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 500;
}
.detail-status.ok { color: var(--color-success); background: rgba(82, 196, 26, 0.1); }
.detail-status.error { color: var(--color-error); background: rgba(255, 77, 79, 0.1); }
.detail-status.slow { color: var(--color-warning); background: rgba(250, 173, 20, 0.1); }

.details-section {
    margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #333;
  padding: 8px;
  background: #f9f9f9;
  border-radius: 4px;
}

.event-time {
  color: #999;
  font-size: 12px;
  min-width: 80px;
}

.no-data {
  font-size: 13px;
  color: #ccc;
  font-style: italic;
  text-align: center;
  padding: 10px;
}
</style>
