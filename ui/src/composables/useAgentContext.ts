import { ref, readonly } from 'vue';

interface AgentContext {
    type: 'project' | 'monitor';
    id: string;
    name: string;
}

interface Message {
    role: 'user' | 'agent';
    content: string;
    timestamp: number;
}

// Global state
// Global state
const context = ref<AgentContext | null>(null);
const messages = ref<Message[]>([]);

export function useAgentContext() {
    const setContext = (newContext: AgentContext | null) => {
        context.value = newContext;
        // Optionally clear messages or add a system message when context changes
    };

    const sendMessage = (content: string) => {
        messages.value.push({
            role: 'user',
            content,
            timestamp: Date.now(),
        });

        // Mock Agent response
        setTimeout(() => {
            messages.value.push({
                role: 'agent',
                content: `I received your message about ${context.value ? context.value.name : 'this project'}: "${content}". How would you like me to proceed?`,
                timestamp: Date.now(),
            });
        }, 1000);
    };

    return {
        context: readonly(context),
        messages: readonly(messages),
        setContext,
        sendMessage,
    };
}
