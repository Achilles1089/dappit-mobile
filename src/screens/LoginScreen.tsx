import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Pressable,
} from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        try {
            setLoading(true);
            await login(email.trim(), password);
        } catch (err: any) {
            Alert.alert(
                'Login Failed',
                err.response?.data?.error || err.message || 'Invalid credentials'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.logo}>🚀</Text>
                    <Text style={styles.title}>Dappit</Text>
                    <Text style={styles.subtitle}>The First Web3 Vibe Coding Platform</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="you@example.com"
                        placeholderTextColor={DappitColors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                    />

                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="••••••••"
                        placeholderTextColor={DappitColors.textMuted}
                        secureTextEntry
                        editable={!loading}
                        onSubmitEditing={handleLogin}
                    />

                    <Button
                        mode="contained"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        style={styles.loginButton}
                        labelStyle={styles.loginButtonLabel}
                        buttonColor={DappitColors.primary}
                    >
                        Log In
                    </Button>

                    <Pressable onPress={() => navigation.navigate('Signup')} disabled={loading}>
                        <Text style={styles.switchText}>
                            Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
                        </Text>
                    </Pressable>

                    {/* Skip auth option */}
                    <Pressable onPress={() => navigation.navigate('HomeStack')} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip for now →</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DappitColors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: DappitSpacing.lg,
    },
    hero: {
        alignItems: 'center',
        marginBottom: DappitSpacing.xxl,
    },
    logo: {
        fontSize: 64,
        marginBottom: DappitSpacing.md,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        color: DappitColors.textPrimary,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: DappitFontSizes.body,
        color: DappitColors.textSecondary,
        marginTop: DappitSpacing.xs,
    },
    form: {
        width: '100%',
    },
    inputLabel: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: DappitSpacing.xs,
        marginTop: DappitSpacing.md,
    },
    input: {
        backgroundColor: DappitColors.surface,
        borderRadius: 12,
        padding: DappitSpacing.md,
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.body,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    loginButton: {
        borderRadius: 12,
        paddingVertical: DappitSpacing.xs,
        marginTop: DappitSpacing.lg,
    },
    loginButtonLabel: {
        fontSize: DappitFontSizes.subtitle,
        fontWeight: '700',
    },
    switchText: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.body,
        textAlign: 'center',
        marginTop: DappitSpacing.lg,
    },
    switchLink: {
        color: DappitColors.primary,
        fontWeight: '700',
    },
    skipButton: {
        marginTop: DappitSpacing.lg,
        alignItems: 'center',
    },
    skipText: {
        color: DappitColors.textMuted,
        fontSize: DappitFontSizes.body,
    },
});
