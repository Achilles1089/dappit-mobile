import api from './api';

export const TokenService = {
    async getBalance(): Promise<{ credits: number; plan: string }> {
        try {
            const { data } = await api.get('/api/tokens');
            return data;
        } catch {
            return { credits: 0, plan: 'free' };
        }
    },

    async getPoints(): Promise<{ points: number }> {
        try {
            const { data } = await api.get('/api/points');
            return data;
        } catch {
            return { points: 0 };
        }
    },

    async getHackathonStatus(): Promise<{ entry: any | null }> {
        try {
            const { data } = await api.get('/api/hackathon/status');
            return data;
        } catch {
            return { entry: null };
        }
    },

    async joinHackathon(name: string, email: string): Promise<{ success: boolean; message: string }> {
        const { data } = await api.post('/api/hackathon/join', {
            name,
            email,
            agreedToTerms: true,
        });
        return data;
    },

    async uploadToIPFS(imageUri: string, symbol: string, name: string, description: string): Promise<string> {
        const formData = new FormData();

        // Convert URI to blob for upload
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('file', blob, `${symbol.toLowerCase()}-image.png`);
        formData.append('symbol', symbol);
        formData.append('name', name);
        formData.append('description', description);

        const { data } = await api.post('/api/pinata-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.metadataUri;
    },
};
