import api from './api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const AIService = {
    async chat(
        message: string,
        system: string = 'You are Dappit AI, a helpful Web3 development assistant. You help users build Solana dApps, create tokens, and understand blockchain concepts. Be concise and practical.',
        model: string = 'claude-sonnet-4-20250514',
        provider: string = 'Anthropic'
    ): Promise<string> {
        const { data } = await api.post('/api/llmcall', {
            system,
            message,
            model,
            provider: { name: provider },
            streamOutput: false,
        });

        // Extract text from the AI SDK response format
        if (data.text) return data.text;
        if (data.response?.messages?.[0]?.content) {
            const content = data.response.messages[0].content;
            if (Array.isArray(content)) {
                return content.map((c: any) => c.text || '').join('');
            }
            return content;
        }
        return JSON.stringify(data);
    },

    async auditCode(code: string): Promise<string> {
        const { data } = await api.post('/api/audit-code', { code });
        return data.result || data.audit || JSON.stringify(data);
    },
};
