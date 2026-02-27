<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import MonitorCard from '../components/MonitorCard.vue';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';
import { useSearch } from '../composables/useSearch';
import type { Monitor } from '../services/mockData';

const { t } = useI18n();
const { getInfrastructure, getBusiness, getProjects, startSimulation, stopSimulation } = useMockService();
const { activeProjectId, activeProjectCode: projectCode } = useProject();
const { searchQuery } = useSearch();

const infrastructureMonitors = ref<Monitor[]>([]);
const businessMonitors = ref<Monitor[]>([]);
const isLoading = ref(true);

const expandedMonitorId = ref<string | null>(null);

const filterMonitors = (monitors: Monitor[]) => {
  if (!searchQuery.value) return monitors;
  const q = searchQuery.value.toLowerCase();
  return monitors.filter(m =>
    (m.name || '').toLowerCase().includes(q) ||
    t(m.nameKey).toLowerCase().includes(q) ||
    m.desc.toLowerCase().includes(q)
  );
};

const filteredInfra = computed(() => filterMonitors(infrastructureMonitors.value));
const filteredBusiness = computed(() => filterMonitors(businessMonitors.value));

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

const handleToggleMonitor = (id: string) => {
  expandedMonitorId.value = expandedMonitorId.value === id ? null : id;
};

watch(activeProjectId, () => {
    fetchData();
});

onMounted(async () => {
  await fetchData();
  startSimulation();
});

onUnmounted(() => {
  stopSimulation();
});

// Agent Integration
import { useAgentContext } from '../composables/useAgentContext';
const { setContext } = useAgentContext();

// Set project context for agent panel
watch(activeProjectId, async (newId) => {
  const projects = (await getProjects()).value;
  const project = projects.find(p => p.id === newId);
  const name = project?.rawName || (project?.nameKey ? t(project.nameKey) : projectCode.value);
  setContext({ type: 'project', id: newId, name });
}, { immediate: true });
</script>

<template>
  <div class="monitor-group">
    <div class="group-header">
      <div class="group-title">
        <span>{{ t('section.infrastructure') }}</span>
        <span class="group-count">({{ isLoading ? '...' : filteredInfra.length }})</span>
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
        v-for="m in filteredInfra"
        :key="m.id"
        class="monitor-item"
        :class="{ 'expanded': expandedMonitorId === m.id }"
        :monitor="m as any"
        :is-expanded="expandedMonitorId === m.id"
        @toggle="handleToggleMonitor(m.id)"
      />
    </div>
  </div>

  <div class="monitor-group">
     <div class="group-header">
      <div class="group-title">
        <span>{{ t('section.businessFlow') }}</span>
        <span class="group-count">({{ isLoading ? '...' : filteredBusiness.length }})</span>
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
        v-for="m in filteredBusiness"
        :key="m.id"
        class="monitor-item"
        :class="{ 'expanded': expandedMonitorId === m.id }"
        :monitor="m as any"
        :is-expanded="expandedMonitorId === m.id"
        @toggle="handleToggleMonitor(m.id)"
      />
    </div>
  </div>

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
  align-items: start; /* Prevent stretching */
}

.monitor-item {
  height: max-content; /* Ensure height adjusts to content */
}

.monitor-item.expanded {
  z-index: 100;
  position: relative;
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

</style>
