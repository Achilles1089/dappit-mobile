import { API_BASE_URL } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

/**
 * AIService — calls Dappit's /api/llmcall endpoint
 * 
 * Uses XMLHttpRequest instead of fetch because React Native Android's
 * fetch (OkHttp) fails with "Network request failed" against Cloudflare.
 * XHR has better compatibility on older Android devices.
 */
export const AIService = {
    async chat(
        message: string,
        system: string = 'You are Dappit AI, a helpful Web3 development assistant.',
        model: string = 'claude-haiku-4-5-20251001',
        provider: string = 'Anthropic'
    ): Promise<string> {
        const token = await AsyncStorage.getItem('supabase-token');
        const url = `${API_BASE_URL}/api/llmcall`;

        console.log('[AIService] XHR POST', url, '| model:', model);

        const body = JSON.stringify({
            system,
            message,
            model,
            provider: { name: provider },
            streamOutput: false,
        });

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.timeout = 55000;
            xhr.open('POST', url, true);

            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Accept', 'application/json');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.onload = () => {
                console.log('[AIService] XHR status:', xhr.status);
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (data.text) {
                            resolve(data.text);
                        } else if (data.response?.messages?.[0]?.content) {
                            const content = data.response.messages[0].content;
                            resolve(Array.isArray(content) ? content.map((c: any) => c.text || '').join('') : content);
                        } else {
                            resolve(xhr.responseText);
                        }
                    } catch {
                        resolve(xhr.responseText);
                    }
                } else {
                    console.error('[AIService] XHR error status:', xhr.status, xhr.responseText?.substring(0, 200));
                    reject(new Error(`API Error ${xhr.status}: ${xhr.responseText?.substring(0, 200)}`));
                }
            };

            xhr.onerror = (e) => {
                console.error('[AIService] XHR onerror:', JSON.stringify(e));
                console.error('[AIService] XHR readyState:', xhr.readyState, 'status:', xhr.status);

                // Try a simple GET to see if we can reach the server at all
                console.log('[AIService] Testing connectivity with GET...');
                const testXhr = new XMLHttpRequest();
                testXhr.open('GET', API_BASE_URL, true);
                testXhr.onload = () => console.log('[AIService] GET test status:', testXhr.status);
                testXhr.onerror = () => console.error('[AIService] GET test also failed - server unreachable');
                testXhr.send();

                reject(new Error(`Network request failed (XHR onerror)`));
            };

            xhr.ontimeout = () => {
                console.error('[AIService] XHR timeout after 55s');
                reject(new Error('Request timed out (55s)'));
            };

            console.log('[AIService] Sending XHR, body size:', body.length);
            xhr.send(body);
        });
    },

    async auditCode(code: string): Promise<string> {
        const res = await fetch(`${API_BASE_URL}/api/audit-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        const data = await res.json();
        return data.result || data.audit || JSON.stringify(data);
    },
};
