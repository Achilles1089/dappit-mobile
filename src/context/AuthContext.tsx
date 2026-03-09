import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthService, AuthUser } from '../services/auth';

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isLoggedIn: false,
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
    refresh: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const me = await AuthService.getMe();
            setUser(me);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = useCallback(async (email: string, password: string) => {
        const result = await AuthService.login(email, password);
        setUser(result.user);
    }, []);

    const signup = useCallback(async (email: string, password: string, name: string) => {
        const result = await AuthService.signup(email, password, name);
        setUser(result.user);
    }, []);

    const logout = useCallback(async () => {
        await AuthService.logout();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isLoggedIn: !!user,
                login,
                signup,
                logout,
                refresh,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
