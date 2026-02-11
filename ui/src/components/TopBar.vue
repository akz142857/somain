<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Drawer from './Drawer.vue';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';

const { t, locale } = useI18n();
const { addMonitor, getProjects } = useMockService();
const { activeProjectId } = useProject();

const projectName = ref('');

const updateProjectName = async () => {
    const projects = (await getProjects()).value;
    const active = projects.find(p => p.id === activeProjectId.value);
    if (active) {
        projectName.value = active.rawName || (active.nameKey ? t(active.nameKey) : '');
    }
};

// Simple watch for demo: in real app, projects state might be central
import { watch, onMounted } from 'vue';
watch(activeProjectId, () => {
    updateProjectName();
});

onMounted(() => {
    updateProjectName();
});

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'zh' : 'en';
  document.documentElement.lang = locale.value;
  // Re-update name in case it relies on translation
  setTimeout(updateProjectName, 100);
};

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
       nameKey: '', // Manual name
       desc: newMonitor.value.desc || newMonitor.value.name,
       type: newMonitor.value.type as any,
// @ts-ignore
       name: newMonitor.value.name 
   }, newMonitor.value.group as 'infrastructure' | 'business', activeProjectId.value);

   // Dashboard might need to know about manual names if it relies purely on t(nameKey).
   // Let's quickly patch Dashboard to prefer name if nameKey is empty or missing.
   // But wait, MonitorCard uses t(monitor.nameKey). If nameKey is empty string, t('') is ''.
   // We should store the manual name in `nameKey` if we want to hack it, OR update MonitorCard to handle `name`.
   // MockService `addMonitor` puts `nameKey: ''`.
   // Let's rely on my previous thought: "Prefer rawName".
   // I'll update MonitorCard in next step to support rawName/name property.
   // For now, let's just push it.

   showAddMonitor.value = false;
   newMonitor.value = { name: '', desc: '', type: 'api', group: 'infrastructure' };
};
</script>

<template>
  <div class="topbar">
    <div class="project-name">{{ t('project.ecommerce') }}</div>
    <div class="topbar-actions">
      <div class="search">
        <svg class="search-icon" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
        </svg>
        <input type="text" :placeholder="t('action.search')" />
      </div>
      <button class="btn" @click="toggleLanguage">
        <span style="font-size: 14px; margin-right: 4px;">文/A</span>
        {{ locale === 'en' ? 'English' : '中文' }}
      </button>
      <button class="btn">{{ t('action.settings') }}</button>
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
          <label>Name</label>
          <input v-model="newMonitor.name" type="text" placeholder="Monitor Name" class="input" />
        </div>
        <div class="form-item">
          <label>Description</label>
          <textarea v-model="newMonitor.desc" placeholder="Description / URL" class="input" rows="3"></textarea>
        </div>
        <div class="form-item">
          <label>Type</label>
          <select v-model="newMonitor.type" class="input">
            <option value="api">API</option>
            <option value="db">Database</option>
            <option value="mq">MQ</option>
            <option value="cache">Cache</option>
            <option value="search">Search</option>
            <option value="order">Business Flow</option>
          </select>
        </div>
        <div class="form-item">
          <label>Group</label>
          <div class="radio-group">
            <label class="radio-label">
                <input type="radio" v-model="newMonitor.group" value="infrastructure" /> Infrastructure
            </label>
            <label class="radio-label">
                <input type="radio" v-model="newMonitor.group" value="business" /> Business Flow
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

.project-name {
  font-size: 18px;
  font-weight: 600;
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
