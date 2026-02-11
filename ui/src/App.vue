<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
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
  </div>
</template>

<style scoped>
.main {
  margin-left: var(--sidebar-width);
  padding: 0;
  min-height: 100vh;
}

.content {
  padding: 20px 24px;
}
</style>
