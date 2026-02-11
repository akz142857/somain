<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';
import type { Project } from '../services/mockData';
import Modal from './Modal.vue';

const { t } = useI18n();
const { getProjects, addProject } = useMockService();
const { activeProjectId } = useProject();

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
    await addProject(newProjectName.value, newProjectDesc.value);
    showAddModal.value = false;
    newProjectName.value = '';
    newProjectDesc.value = '';
};

const selectProject = (id: string) => {
    activeProjectId.value = id;
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

    <!-- Dynamic Projects -->
    <div class="projects-list">
        <div
        v-for="p in projects"
        :key="p.id"
        class="project-item"
        :class="{ active: activeProjectId === p.id }"
        @click="selectProject(p.id)"
        >
        <div class="project-icon" :class="p.status">{{ getInitials(p) }}</div>
        <div class="project-info">
            <div class="project-name">{{ p.rawName || (p.nameKey ? t(p.nameKey) : 'Project') }}</div>
            <div v-if="p.desc" class="project-desc">{{ p.desc }}</div>
        </div>
        </div>
    </div>

    <button class="add-btn" @click="showAddModal = true">
        <span class="plus-icon">+</span> {{ t('action.newProject') }}
    </button>

    <Modal
      :visible="showAddModal"
      :title="t('action.newProject')"
      @close="showAddModal = false"
      @confirm="handleAddProject"
    >
      <div class="form-item">
        <label>Project Name</label>
        <input v-model="newProjectName" type="text" placeholder="e.g. Finance System" class="input" />
      </div>
       <div class="form-item">
        <label>Description</label>
        <input v-model="newProjectDesc" type="text" placeholder="Short description" class="input" />
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

.projects-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
}

.project-item {
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.project-item:hover {
  background: #2a2a2a;
}

.project-item.active {
  background: #2a2a2a;
  border-left-color: var(--color-primary);
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

.add-btn {
  margin: 16px;
  padding: 12px;
  background: #2a2a2a;
  border: 1px dashed #444;
  color: #aaa;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: #333;
}

.plus-icon {
    font-size: 16px;
    font-weight: bold;
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
