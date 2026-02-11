<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAgentContext } from '../composables/useAgentContext';

const { t } = useI18n();
const { context, messages, sendMessage } = useAgentContext();
const inputMessage = ref('');

const handleSend = () => {
  if (!inputMessage.value.trim()) return;
  sendMessage(inputMessage.value);
  inputMessage.value = '';
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handleShareTab = () => {
  sendMessage(t('agent.shareContext', 'I am sharing the current project view with you.'));
};
</script>

<template>
  <div class="agent-panel">
    <div class="agent-header">
      <div class="header-title">
        <span class="icon">🤖</span>
        <span>Agent AI</span>
      </div>
      <div v-if="context" class="context-badge">
        {{ context.type === 'project' ? 'Project' : 'Monitor' }}: {{ context.name }}
      </div>
    </div>

    <div class="agent-content">
      <div class="chat-history">
        <div v-if="messages.length === 0" class="empty-state">
          <div class="empty-icon">👋</div>
          <div class="empty-text">How can I help you regarding {{ context ? context.name : 'this project' }}?</div>
        </div>
        
        <div 
          v-for="(msg, idx) in messages" 
          :key="idx" 
          class="chat-message"
          :class="msg.role"
        >
          <div class="message-content">{{ msg.content }}</div>
        </div>
      </div>

      <div class="chat-input-area">
        <div class="tools-row">
          <button class="tool-btn" title="Analyze Logs">📊</button>
          <button class="tool-btn" title="Check Health">🏥</button>
          <button class="tool-btn" title="Settings">⚙️</button>
        </div>
        
        <div class="input-context-actions">
           <button class="context-btn" @click="handleShareTab">
             <span class="icon">📑</span>
             Share current tab
           </button>
           <button class="context-btn icon-only" title="Add Attachment">
             +
           </button>
        </div>

        <textarea 
          v-model="inputMessage"
          class="chat-input"
          :placeholder="t('agent.placeholder', 'Ask anything...')"
          @keydown="handleKeydown"
        ></textarea>
        <div class="input-actions">
           <button class="send-btn" @click="handleSend" :disabled="!inputMessage.trim()">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agent-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 50;
  box-shadow: -2px 0 8px rgba(0,0,0,0.05);
}

.agent-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fcfcfc;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.context-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #e6f7ff;
  color: #1890ff;
  border-radius: 10px;
  align-self: flex-start;
  border: 1px solid #bae7ff;
}

.agent-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
  margin-top: 40%;
}

.empty-icon { font-size: 32px; margin-bottom: 8px; }
.empty-text { font-size: 13px; max-width: 200px; }

.chat-message {
  display: flex;
  max-width: 85%;
}

.chat-message.user {
  align-self: flex-end;
}

.chat-message.agent {
  align-self: flex-start;
}

.message-content {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.chat-message.user .message-content {
  background: var(--color-primary, #1890ff);
  color: white;
  border-bottom-right-radius: 2px;
}

.chat-message.agent .message-content {
  background: white;
  border: 1px solid #e0e0e0;
  color: #333;
  border-bottom-left-radius: 2px;
}

.chat-input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.tools-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tool-btn {
  background: #f5f5f5;
  border: none;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.tool-btn:hover { background: #e6f7ff; }

.chat-input {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  font-size: 13px;
  resize: none;
  height: 60px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: var(--color-primary, #1890ff);
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.send-btn {
  background: var(--color-primary, #1890ff);
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
