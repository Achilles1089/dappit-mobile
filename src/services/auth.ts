import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
}

export interface LoginResponse {
    token: string;
    user: AuthUser;
}

export const AuthService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        const { data } = await api.post('/api/auth/login', { email, password });
        if (data.token) {
            await AsyncStorage.setItem('supabase-token', data.token);
        }
        return data;
    },

    async signup(email: string, password: string, name: string): Promise<LoginResponse> {
        const { data } = await api.post('/api/auth/signup', { email, password, name });
        if (data.token) {
            await AsyncStorage.setItem('supabase-token', data.token);
        }
        return data;
    },

    async getMe(): Promise<AuthUser | null> {
        try {
            const token = await AsyncStorage.getItem('supabase-token');
            if (!token) return null;
            const { data } = await api.get('/api/auth/me');
            return data.user || data;
        } catch {
            return null;
        }
    },

    async logout(): Promise<void> {
        try {
            await api.post('/api/auth/logout');
        } catch {
            // Ignore logout errors
        } finally {
            await AsyncStorage.removeItem('supabase-token');
        }
    },

    async isLoggedIn(): Promise<boolean> {
        const token = await AsyncStorage.getItem('supabase-token');
        return !!token;
    },
};
