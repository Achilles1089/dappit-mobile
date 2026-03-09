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
import { Text, Button } from 'react-native-paper';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function SignupScreen({ navigation }: any) {
    const { signup } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!name.trim() || !email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        try {
            setLoading(true);
            await signup(email.trim(), password, name.trim());
            Alert.alert('🎉 Welcome!', 'Account created successfully');
        } catch (err: any) {
            Alert.alert(
                'Signup Failed',
                err.response?.data?.error || err.message || 'Could not create account'
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
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the Dappit ecosystem</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                        placeholderTextColor={DappitColors.textMuted}
                        autoCorrect={false}
                        editable={!loading}
                    />

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
                        placeholder="Min 6 characters"
                        placeholderTextColor={DappitColors.textMuted}
                        secureTextEntry
                        editable={!loading}
                    />

                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Repeat password"
                        placeholderTextColor={DappitColors.textMuted}
                        secureTextEntry
                        editable={!loading}
                        onSubmitEditing={handleSignup}
                    />

                    <Button
                        mode="contained"
                        onPress={handleSignup}
                        loading={loading}
                        disabled={loading}
                        style={styles.signupButton}
                        labelStyle={styles.signupButtonLabel}
                        buttonColor={DappitColors.accent}
                    >
                        Create Account
                    </Button>

                    <Pressable onPress={() => navigation.goBack()} disabled={loading}>
                        <Text style={styles.switchText}>
                            Already have an account? <Text style={styles.switchLink}>Log In</Text>
                        </Text>
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
    header: {
        marginBottom: DappitSpacing.xl,
    },
    title: {
        fontSize: DappitFontSizes.heading,
        fontWeight: '800',
        color: DappitColors.textPrimary,
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
    signupButton: {
        borderRadius: 12,
        paddingVertical: DappitSpacing.xs,
        marginTop: DappitSpacing.lg,
    },
    signupButtonLabel: {
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
});
