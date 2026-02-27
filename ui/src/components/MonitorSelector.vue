<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface MonitorItem {
  id: string;
  name: string;
  type: string;
  status: string;
  metric: string;
  desc?: string;
}

const props = defineProps<{
  monitors: MonitorItem[];
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'select']);

const { t } = useI18n();
const searchQuery = ref('');
const filterStatus = ref<'all' | 'error' | 'slow' | 'ok'>('all');

const filteredMonitors = computed(() => {
  let list = props.monitors;
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(m => m.name.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q)));
  }
  
  if (filterStatus.value !== 'all') {
    list = list.filter(m => m.status === filterStatus.value);
  }
  
  return list;
});

const handleSelect = (monitor: MonitorItem) => {
  emit('select', monitor);
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="monitor-selector-overlay" @click.self="emit('close')">
    <div class="monitor-selector-modal">
      <div class="modal-header">
        <h3>{{ t('form.selectMonitor') }}</h3>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>
      
      <div class="modal-controls">
        <input 
          v-model="searchQuery" 
          class="search-input" 
          :placeholder="t('form.searchMonitors')"
          autofocus
        />
        
        <div class="filter-group">
            <button 
                v-for="status in ['all', 'error', 'slow', 'ok']" 
                :key="status"
                class="filter-btn"
                :class="{ active: filterStatus === status }"
                @click="filterStatus = status as any"
            >
                {{ status === 'all' ? t('flow.filterAll') : status === 'error' ? t('status.error') : status === 'slow' ? t('status.slow') : t('status.ok') }}
            </button>
        </div>
      </div>
      
      <div class="monitor-list">
        <div 
          v-for="monitor in filteredMonitors" 
          :key="monitor.id" 
          class="monitor-item"
          @click="handleSelect(monitor)"
        >
          <div class="monitor-icon">
            <span v-if="monitor.status === 'error'">🔴</span>
            <span v-else-if="monitor.status === 'slow'">🟠</span>
            <span v-else>🟢</span>
          </div>
          <div class="monitor-info">
            <div class="monitor-header">
                <span class="monitor-name">{{ monitor.name }}</span>
                <span v-if="monitor.metric" class="monitor-metric">{{ monitor.metric }}</span>
            </div>
            <div class="monitor-meta">
                <span class="monitor-type">{{ monitor.type }}</span>
                <span v-if="monitor.desc" class="monitor-desc"> - {{ monitor.desc }}</span>
            </div>
          </div>
          <div class="monitor-action">
            <button class="select-btn">{{ t('action.select') }}</button>
          </div>
        </div>
        
        <div v-if="filteredMonitors.length === 0" class="empty-list">
            {{ t('form.noMatches') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.monitor-selector-modal {
  background: white;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
}

.modal-controls {
    padding: 16px 24px;
    background: #f9f9f9;
    border-bottom: 1px solid #eee;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.search-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    outline: none;
}

.search-input:focus {
    border-color: #1890ff;
}

.filter-group {
    display: flex;
    gap: 8px;
}

.filter-btn {
    padding: 4px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 16px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    background: #f0f0f0;
}

.filter-btn.active {
    background: #e6f7ff;
    border-color: #1890ff;
    color: #1890ff;
}

.monitor-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.monitor-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.1s;
}

.monitor-item:hover {
  background: #f5fbff;
}

.monitor-icon {
  font-size: 20px;
  margin-right: 16px;
}

.monitor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.monitor-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.monitor-name {
    font-weight: 500;
    color: #333;
}

.monitor-metric {
    font-size: 12px;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    color: #666;
}

.monitor-meta {
    font-size: 12px;
    color: #999;
    display: flex;
    align-items: center;
}

.monitor-type {
    text-transform: uppercase;
    font-size: 10px;
    background: #f5f5f5;
    padding: 1px 4px;
    border-radius: 3px;
    margin-right: 6px;
    border: 1px solid #eee;
}

.monitor-action {
    opacity: 0;
    transition: opacity 0.2s;
}

.monitor-item:hover .monitor-action {
    opacity: 1;
}

.select-btn {
    padding: 4px 12px;
    background: #1890ff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
}

.empty-list {
    padding: 40px;
    text-align: center;
    color: #999;
}
</style>
