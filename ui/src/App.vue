<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
import AgentPanel from './components/AgentPanel.vue';
import Dashboard from './views/Dashboard.vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';

const { locale } = useI18n();

const toggleLanguage = () => {
  locale.value = locale.value === 'en' ? 'zh' : 'en';
  document.documentElement.lang = locale.value;
};

// Listen for 'L' key to switch language, matching original functionality
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'l' || e.key === 'L') {
      toggleLanguage();
    }
  });
});
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <div class="main">
      <TopBar />
      <div class="content">
        <Dashboard />
      </div>
    </div>
    <AgentPanel />
  </div>
</template>

<style scoped>
.main {
  margin-left: var(--sidebar-width);
  margin-right: 350px; /* Width of Agent Panel */
  padding: 0;
  min-height: 100vh;
  transition: margin-right 0.3s;
}

.content {
  padding: 20px 24px;
}
</style>
