<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAgentContext } from '../composables/useAgentContext';
import { useMockService } from '../services/mockService';
import { useProject } from '../composables/useProject';

const { t } = useI18n();
const { context, messages, sendMessage } = useAgentContext();
const { getInfrastructure, getBusiness } = useMockService();
const { activeProjectId } = useProject();

const inputMessage = ref('');
const isContextShared = ref(false);
const showSuggestions = ref(false);
const suggestionType = ref<'monitor' | 'tool'>('monitor');
const suggestionQuery = ref('');
const activeSuggestionIndex = ref(0);
const inputRef = ref<HTMLTextAreaElement | null>(null);

const monitors = ref<{ id: string; name: string; type: string }[]>([]);

const tools = [
  { id: 'fix', name: 'Fix', desc: 'Attempt to fix the issue' },
  { id: 'analyze', name: 'Analyze', desc: 'Analyze logs and metrics' },
  { id: 'explain', name: 'Explain', desc: 'Explain the current state' },
  { id: 'report', name: 'Report', desc: 'Generate a status report' },
];

const updateMonitors = async () => {
  const infra = await getInfrastructure(activeProjectId.value);
  const bus = await getBusiness(activeProjectId.value);
  monitors.value = [
    ...infra.value.map(m => ({ id: m.id, name: (m as any).name || t(m.nameKey), type: 'infra' })),
    ...bus.value.map(m => ({ id: m.id, name: (m as any).name || t(m.nameKey), type: 'business' }))
  ];
};

onMounted(() => {
  updateMonitors();
});

watch(activeProjectId, () => {
  updateMonitors();
});

const filteredSuggestions = computed(() => {
  const query = suggestionQuery.value.toLowerCase();
  if (suggestionType.value === 'monitor') {
    return monitors.value.filter(m => m.name.toLowerCase().includes(query)).slice(0, 5);
  } else {
    return tools.filter(t => t.name.toLowerCase().includes(query));
  }
});

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  const val = target.value;
  const cursor = target.selectionStart;
  
  // Simple detection: check word before cursor
  const textBeforeCursor = val.slice(0, cursor);
  const match = textBeforeCursor.match(/([@/])(\w*)$/);
  
  if (match) {
    showSuggestions.value = true;
    suggestionType.value = match[1] === '@' ? 'monitor' : 'tool';
    suggestionQuery.value = match[2];
    activeSuggestionIndex.value = 0;
  } else {
    showSuggestions.value = false;
  }
};

const selectSuggestion = (item: any) => {
  if (!inputRef.value) return;
  
  const val = inputMessage.value;
  const cursor = inputRef.value.selectionStart;
  const textBeforeCursor = val.slice(0, cursor);
  const match = textBeforeCursor.match(/([@/])(\w*)$/);
  
  if (match) {
    const prefix = match[1]; // @ or /
    const query = match[2]; // typed text
    const replaceText = prefix + item.name + ' ';
    
    const beforeMatch = textBeforeCursor.slice(0, match.index);
    const afterCursor = val.slice(cursor);
    
    inputMessage.value = beforeMatch + replaceText + afterCursor;
    showSuggestions.value = false;
    
    // Reset cursor position (approximate)
    setTimeout(() => {
        if(inputRef.value) {
            inputRef.value.focus();
            const newCursor = beforeMatch.length + replaceText.length;
            inputRef.value.setSelectionRange(newCursor, newCursor);
        }
    }, 0);
  }
};

const handleSend = () => {
  if (!inputMessage.value.trim()) return;
  const content = inputMessage.value;
  if (isContextShared.value) {
    // Append context info strictly for logic, or just send message
    // For now, let's keep it simple
  }
  sendMessage(content);
  inputMessage.value = '';
  isContextShared.value = false;
  showSuggestions.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (showSuggestions.value) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % filteredSuggestions.value.length;
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + filteredSuggestions.value.length) % filteredSuggestions.value.length;
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (filteredSuggestions.value.length > 0) {
        selectSuggestion(filteredSuggestions.value[activeSuggestionIndex.value]);
      }
      return;
    }
    if (e.key === 'Escape') {
      showSuggestions.value = false;
      return;
    }
  }

  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handleShareTab = () => {
  isContextShared.value = true;
};

const handleRemoveContext = () => {
  isContextShared.value = false;
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
           <div v-if="isContextShared" class="context-chip">
             <span class="chip-icon">S</span>
             <span>Current tab</span>
             <button class="chip-close" @click="handleRemoveContext">×</button>
           </div>
           
           <button v-else class="context-btn" @click="handleShareTab">
             <span class="icon">📑</span>
             Share current tab
           </button>
           
           <button class="context-btn icon-only" title="Add Attachment">
             +
           </button>
        </div>

        <div class="input-wrapper">
          <!-- Suggestions Popup -->
          <div v-if="showSuggestions && filteredSuggestions.length > 0" class="suggestions-popup">
            <div 
              v-for="(item, idx) in filteredSuggestions" 
              :key="item.id" 
              class="suggestion-item"
              :class="{ active: idx === activeSuggestionIndex }"
              @click="selectSuggestion(item)"
            >
              <div class="suggestion-icon">{{ suggestionType === 'monitor' ? '🔍' : '🛠️' }}</div>
              <div class="suggestion-info">
                <div class="suggestion-name">{{ item.name }}</div>
                <div v-if="(item as any).desc" class="suggestion-desc">{{ (item as any).desc }}</div>
              </div>
            </div>
          </div>

          <textarea 
            ref="inputRef"
            v-model="inputMessage"
            class="chat-input"
            :placeholder="t('agent.placeholder', 'Ask anything...')"
            @keydown="handleKeydown"
            @input="handleInput"
          ></textarea>
        </div>

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
/* ... existing styles ... */
.chat-input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid #f0f0f0;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.suggestions-popup {
  position: absolute;
  bottom: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-bottom: 8px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
}

.suggestion-item:last-child { border-bottom: none; }

.suggestion-item:hover, .suggestion-item.active {
  background: #f0f7ff;
}

.suggestion-icon {
  font-size: 16px;
}

.suggestion-info {
  display: flex;
  flex-direction: column;
}

.suggestion-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.suggestion-desc {
  font-size: 11px;
  color: #999;
}

/* ... existing styles ... */
.context-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1e3a8a; /* Dark blue */
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  animation: fadeIn 0.2s;
}

.chip-icon {
  background: #f97316; /* Orange */
  color: white;
  width: 18px;
  height: 18px;
  border-radius: 4px; /* Just a guess on shape, maybe generic icon */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.chip-close {
  background: none;
  border: none;
  color: rgba(255,255,255,0.7);
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  padding: 0 4px;
}

.chip-close:hover {
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* ... existing */
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

.input-context-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.context-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: 1px solid #d9d9d9;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.context-btn:hover {
  border-color: var(--color-primary, #1890ff);
  color: var(--color-primary, #1890ff);
  background: #f0f7ff;
}

.context-btn.icon-only {
  padding: 4px 8px;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  justify-content: center;
}
</style>
