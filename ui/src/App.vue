<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
import TopBar from './components/TopBar.vue';
import AgentPanel from './components/AgentPanel.vue';
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const { locale } = useI18n();
const route = useRoute();

const isFlowDetail = computed(() => route.name === 'detail');

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
    <div class="main" :class="{ 'full-width': isFlowDetail }">
      <TopBar />
      <div class="content">
        <router-view />
      </div>
    </div>
    <AgentPanel v-if="!isFlowDetail" />
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

.main.full-width {
  margin-right: 0;
}

.content {
  padding: 20px 24px;
}
</style>
