<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import Drawer from './Drawer.vue';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';
import { useSearch } from '../composables/useSearch';
import type { Monitor } from '../services/mockData';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { addMonitor, getProjects } = useMockService();
const { activeProjectId, activeProjectCode } = useProject();
const { searchQuery } = useSearch();

const projectName = ref('');

const isSettingsPage = computed(() => route.name === 'settings');
const isDashboard = computed(() => route.name === 'dashboard' || route.name === 'detail');
const isAlerts = computed(() => route.name === 'alerts');

const updateProjectName = async () => {
    const projects = (await getProjects()).value;
    const active = projects.find(p => p.id === activeProjectId.value);
    if (active) {
        projectName.value = active.rawName || (active.nameKey ? t(active.nameKey) : '');
    }
};

watch(activeProjectCode, () => {
    updateProjectName();
});

onMounted(() => {
    updateProjectName();
});

const showAddMonitor = ref(false);
const newMonitor = ref({
  name: '',
  desc: '',
  type: 'api',
  group: 'infrastructure'
});

const handleAddMonitor = async () => {
   if (!newMonitor.value.name.trim()) return;

   await addMonitor({
       nameKey: '',
       name: newMonitor.value.name,
       desc: newMonitor.value.desc || newMonitor.value.name,
       type: newMonitor.value.type as Monitor['type'],
   }, newMonitor.value.group as 'infrastructure' | 'business', activeProjectId.value);

   showAddMonitor.value = false;
   newMonitor.value = { name: '', desc: '', type: 'api', group: 'infrastructure' };
};
</script>

<template>
  <div class="topbar">
    <div class="topbar-left">
      <div class="project-name">{{ isSettingsPage ? t('settings.pageTitle') : projectName }}</div>
      <div class="tab-nav" v-if="!isSettingsPage">
        <div class="tab" :class="{ active: isDashboard }" @click="router.push({ name: 'dashboard', params: { projectCode: activeProjectCode } })">{{ t('nav.dashboard') }}</div>
        <div class="tab" :class="{ active: isAlerts }" @click="router.push({ name: 'alerts', params: { projectCode: activeProjectCode } })">{{ t('nav.alerts') }}</div>
      </div>
    </div>
    <div class="topbar-actions" v-if="!isSettingsPage">
      <div class="search">
        <svg class="search-icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
        <input type="text" v-model="searchQuery" :placeholder="t('action.search')" />
      </div>
      <button class="btn btn-primary" @click="showAddMonitor = true">{{ t('action.newMonitor') }}</button>
    </div>

    <!-- Add Monitor Drawer -->
    <Drawer
      :visible="showAddMonitor"
      :title="t('action.newMonitor')"
      @close="showAddMonitor = false"
      @confirm="handleAddMonitor"
    >
      <div class="form-container">
        <div class="form-item">
          <label>{{ t('form.monitorName') }}</label>
          <input v-model="newMonitor.name" type="text" :placeholder="t('form.monitorNamePlaceholder')" class="input" />
        </div>
        <div class="form-item">
          <label>{{ t('form.description') }}</label>
          <textarea v-model="newMonitor.desc" :placeholder="t('form.monitorDescPlaceholder')" class="input" rows="3"></textarea>
        </div>
        <div class="form-item">
          <label>{{ t('form.type') }}</label>
          <select v-model="newMonitor.type" class="input">
            <option value="api">API</option>
            <option value="db">Database</option>
            <option value="mq">MQ</option>
            <option value="cache">Cache</option>
            <option value="search">Search</option>
            <option value="order">{{ t('section.businessFlow') }}</option>
          </select>
        </div>
        <div class="form-item">
          <label>{{ t('form.group') }}</label>
          <div class="radio-group">
            <label class="radio-label">
                <input type="radio" v-model="newMonitor.group" value="infrastructure" /> {{ t('section.infrastructure') }}
            </label>
            <label class="radio-label">
                <input type="radio" v-model="newMonitor.group" value="business" /> {{ t('section.businessFlow') }}
            </label>
          </div>
        </div>
      </div>
    </Drawer>
  </div>
</template>

<style scoped>
.topbar {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.project-name {
  font-size: 18px;
  font-weight: 600;
}

.tab-nav {
  display: flex;
  gap: 4px;
}

.tab {
  padding: 6px 14px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab:hover {
  color: #333;
  background: #f5f5f5;
}

.tab.active {
  color: var(--color-primary);
  background: #e6f7ff;
  font-weight: 500;
}

.topbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search {
  position: relative;
}

.search input {
  width: 280px;
  padding: 6px 12px 6px 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
}

.search input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  opacity: 0.5;
}

.btn {
  padding: 6px 16px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-active {
  background: #e6f7ff;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.btn-primary:hover {
  background: #40a9ff;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-item label {
  font-size: 13px;
  color: #666;
}
.input {
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  width: 100%;
}
.radio-group {
    display: flex;
    gap: 16px;
}
.radio-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    cursor: pointer;
    color: #333;
}
</style>
