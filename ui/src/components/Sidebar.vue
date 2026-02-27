<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';
import type { Project } from '../services/mockData';
import Modal from './Modal.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { getProjects, addProject } = useMockService();
const { activeProjectCode } = useProject();

const isSettingsActive = computed(() => route.name === 'settings');

const projects = ref<Project[]>([]);
const showAddModal = ref(false);
const newProjectName = ref('');
const newProjectDesc = ref('');

const loadProjects = async () => {
  projects.value = (await getProjects()).value;
};

onMounted(() => {
  loadProjects();
});

const handleAddProject = async () => {
    if (!newProjectName.value.trim()) return;
    const code = await addProject(newProjectName.value, newProjectDesc.value);
    showAddModal.value = false;
    newProjectName.value = '';
    newProjectDesc.value = '';
    router.push({ name: 'dashboard', params: { projectCode: code } });
};

const selectProject = (code: string) => {
    if (route.name === 'alerts') {
        router.push({ name: 'alerts', params: { projectCode: code } });
    } else {
        router.push({ name: 'dashboard', params: { projectCode: code } });
    }
};

const getInitials = (p: Project) => {
    const name = p.rawName || (p.nameKey ? t(p.nameKey) : '');
    return name.slice(0, 1).toUpperCase() || '?';
};
</script>

<template>
  <div class="sidebar">
    <div class="logo">
      <div class="logo-icon">M</div>
      <span class="logo-text">{{ t('app.name') }}</span>
    </div>

    <!-- Projects Section -->
    <div class="section-label">{{ t('sidebar.projects') }}</div>
    <div class="projects-list">
        <div
        v-for="p in projects"
        :key="p.id"
        class="project-item"
        :class="{ active: activeProjectCode === p.code }"
        @click="selectProject(p.code)"
        >
        <div class="project-icon" :class="p.status">{{ getInitials(p) }}</div>
        <div class="project-info">
            <div class="project-name">{{ p.rawName || (p.nameKey ? t(p.nameKey) : 'Project') }}</div>
            <div v-if="p.desc" class="project-desc">{{ p.desc }}</div>
        </div>
        </div>

        <div class="add-btn-inline" @click="showAddModal = true">
          <span class="plus-icon">+</span> {{ t('action.newProject') }}
        </div>
    </div>

    <!-- Settings (bottom) -->
    <div class="settings-item" :class="{ active: isSettingsActive }" @click="router.push({ name: 'settings' })">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>
      <span>{{ t('nav.settings') }}</span>
    </div>

    <Modal
      :visible="showAddModal"
      :title="t('action.newProject')"
      @close="showAddModal = false"
      @confirm="handleAddProject"
    >
      <div class="form-item">
        <label>{{ t('form.projectName') }}</label>
        <input v-model="newProjectName" type="text" :placeholder="t('form.projectNamePlaceholder')" class="input" />
      </div>
       <div class="form-item">
        <label>{{ t('form.description') }}</label>
        <input v-model="newProjectDesc" type="text" :placeholder="t('form.descPlaceholder')" class="input" />
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: #1f1f1f;
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.2);
  z-index: 200;
}

.logo {
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #141414;
}

.logo-icon {
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
}

.section-label {
  padding: 12px 16px 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.projects-list {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 8px;
}

.project-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
}

.project-item:hover {
  background: #2a2a2a;
}

.project-item.active {
  background: rgba(24, 144, 255, 0.1);
}

.project-icon {
    width: 32px;
    height: 32px;
    background: #333;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #ccc;
    position: relative;
}

.project-icon.error { border: 1px solid var(--color-error); color: var(--color-error); }
.project-icon.warning { border: 1px solid var(--color-warning); color: var(--color-warning); }
.project-icon.ok { border: 1px solid var(--color-success); color: var(--color-success); }


.project-info {
    flex: 1;
    overflow: hidden;
}

.project-name {
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #eee;
}

.project-desc {
    font-size: 11px;
    color: #888;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.add-btn-inline {
  padding: 8px 16px;
  color: #666;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.add-btn-inline:hover {
  color: var(--color-primary);
  background: #2a2a2a;
}

.plus-icon {
    font-size: 16px;
    font-weight: bold;
}

.settings-item {
  border-top: 1px solid #333;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #aaa;
  transition: all 0.2s;
}

.settings-item:hover {
  background: #2a2a2a;
  color: #eee;
}

.settings-item.active {
  background: #2a2a2a;
  color: #fff;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-item label {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
}

.input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
  color: #333;
}

.input:hover {
  border-color: #40a9ff;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.input::placeholder {
    color: #bfbfbf;
}
</style>
