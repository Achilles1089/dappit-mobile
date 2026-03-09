import React, { useState, useRef } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Pressable,
    Dimensions,
} from 'react-native';
import { Text, Button, Chip, Card, ActivityIndicator, IconButton } from 'react-native-paper';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { AIService } from '../services/ai';

const SAVED_APPS_KEY = '@dappit_saved_apps';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type BuildStage = 'prompt' | 'generating' | 'preview' | 'error';

interface SavedApp {
    id: string;
    name: string;
    code: string;
    prompt: string;
    timestamp: number;
}

const TECH_PRESETS = [
    { label: '🌐 Landing Page', prompt: 'Create a modern landing page with' },
    { label: '📊 Dashboard', prompt: 'Build a data dashboard with' },
    { label: '🪙 Solana dApp', prompt: 'Build a Solana dApp that' },
    { label: '🛒 Store', prompt: 'Create an e-commerce storefront with' },
    { label: '📝 Portfolio', prompt: 'Design a developer portfolio site with' },
];

const VIBE_SYSTEM_PROMPT = `You are Dappit's Vibe Coder — an expert frontend developer. 
Generate a COMPLETE, STANDALONE HTML page with embedded CSS and JavaScript.
Requirements:
- Single HTML file with ALL code inline (no external dependencies except CDN links)
- Modern, beautiful dark theme UI with gradients and animations
- Mobile-responsive design
- Use professional typography (Google Fonts via CDN is OK)
- Include interactive elements where appropriate
- Use vibrant colors: cyan (#00D9C4), purple (#7c3aed), emerald (#10b981)
- Return ONLY the HTML code, no markdown fences, no explanation
- Start with <!DOCTYPE html> and end with </html>`;

export default function BuilderScreen() {
    const [prompt, setPrompt] = useState('');
    const [stage, setStage] = useState<BuildStage>('prompt');
    const [generatedCode, setGeneratedCode] = useState('');
    const [iteratePrompt, setIteratePrompt] = useState('');
    const [savedApps, setSavedApps] = useState<SavedApp[]>([]);
    const [showSaved, setShowSaved] = useState(false);
    const [appName, setAppName] = useState('');
    const webViewRef = useRef<WebView>(null);

    const handleBuild = async (userPrompt?: string) => {
        const finalPrompt = userPrompt || prompt;
        if (!finalPrompt.trim()) {
            Alert.alert('Error', 'Describe what you want to build!');
            return;
        }

        try {
            setStage('generating');
            let code = await AIService.chat(
                finalPrompt,
                VIBE_SYSTEM_PROMPT
            );

            // Clean up markdown fences if present
            code = code.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();

            if (!code.includes('<!DOCTYPE') && !code.includes('<html')) {
                code = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;background:#0a1628;color:#F1F5F9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}h1{color:#00D9C4}</style></head><body><h1>⚠️ Generation Error</h1><p>The AI didn't return valid HTML. Try again with a more specific prompt.</p></body></html>`;
            }

            setGeneratedCode(code);
            setStage('preview');
        } catch (err: any) {
            setStage('prompt');
            const status = err.response?.status;
            if (status === 401) {
                Alert.alert('Login Required', 'Please log in from the Profile tab to use the App Builder.');
            } else {
                Alert.alert('Build Failed', `Error ${status || ''}: ${err.response?.data?.error || err.message || 'AI generation failed'}`);
            }
        }
    };

    const handleIterate = async () => {
        if (!iteratePrompt.trim()) return;
        try {
            setStage('generating');
            let code = await AIService.chat(
                `Here is the current code:\n${generatedCode}\n\nUser wants to modify it: ${iteratePrompt}\n\nReturn the COMPLETE updated HTML file.`,
                VIBE_SYSTEM_PROMPT
            );
            code = code.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();
            setGeneratedCode(code);
            setIteratePrompt('');
            setStage('preview');
        } catch (err: any) {
            setStage('preview');
            Alert.alert('Error', err.response?.data?.error || err.message || 'Iteration failed');
        }
    };

    const handleSave = async () => {
        const name = appName.trim() || `App ${Date.now()}`;
        const app: SavedApp = {
            id: Date.now().toString(),
            name,
            code: generatedCode,
            prompt,
            timestamp: Date.now(),
        };
        try {
            const existing = await AsyncStorage.getItem(SAVED_APPS_KEY);
            const apps: SavedApp[] = existing ? JSON.parse(existing) : [];
            apps.unshift(app);
            await AsyncStorage.setItem(SAVED_APPS_KEY, JSON.stringify(apps));
            Alert.alert('✅ Saved!', `"${name}" saved to your projects`);
            setAppName('');
        } catch (err) {
            Alert.alert('Error', 'Could not save app');
        }
    };

    const loadSavedApps = async () => {
        const existing = await AsyncStorage.getItem(SAVED_APPS_KEY);
        setSavedApps(existing ? JSON.parse(existing) : []);
        setShowSaved(true);
    };

    const openSavedApp = (app: SavedApp) => {
        setPrompt(app.prompt);
        setGeneratedCode(app.code);
        setStage('preview');
        setShowSaved(false);
    };

    const deleteSavedApp = async (id: string) => {
        const existing = await AsyncStorage.getItem(SAVED_APPS_KEY);
        const apps: SavedApp[] = existing ? JSON.parse(existing) : [];
        const filtered = apps.filter((a) => a.id !== id);
        await AsyncStorage.setItem(SAVED_APPS_KEY, JSON.stringify(filtered));
        setSavedApps(filtered);
    };

    // ── SAVED APPS LIST ──
    if (showSaved) {
        return (
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>📂 My Apps</Text>
                        <IconButton
                            icon="close"
                            iconColor={DappitColors.textSecondary}
                            onPress={() => setShowSaved(false)}
                        />
                    </View>
                </View>

                {savedApps.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyContent}>
                            <Text style={styles.emptyEmoji}>🏗️</Text>
                            <Text style={styles.emptyTitle}>No saved apps yet</Text>
                            <Text style={styles.emptySubtitle}>Build your first app and save it here!</Text>
                        </Card.Content>
                    </Card>
                ) : (
                    savedApps.map((app) => (
                        <Card key={app.id} style={styles.savedCard}>
                            <Card.Content>
                                <View style={styles.savedCardRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.savedName}>{app.name}</Text>
                                        <Text style={styles.savedPrompt} numberOfLines={2}>
                                            {app.prompt}
                                        </Text>
                                        <Text style={styles.savedDate}>
                                            {new Date(app.timestamp).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.savedActions}>
                                        <IconButton
                                            icon="open-in-new"
                                            iconColor={DappitColors.accent}
                                            size={20}
                                            onPress={() => openSavedApp(app)}
                                        />
                                        <IconButton
                                            icon="delete-outline"
                                            iconColor={DappitColors.error}
                                            size={20}
                                            onPress={() => deleteSavedApp(app.id)}
                                        />
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    ))
                )}
            </ScrollView>
        );
    }

    // ── PREVIEW MODE ──
    if (stage === 'preview') {
        return (
            <View style={styles.previewContainer}>
                {/* Toolbar */}
                <View style={styles.toolbar}>
                    <IconButton
                        icon="arrow-left"
                        iconColor={DappitColors.textPrimary}
                        size={22}
                        onPress={() => setStage('prompt')}
                    />
                    <Text style={styles.toolbarTitle}>Live Preview</Text>
                    <View style={styles.toolbarActions}>
                        <IconButton
                            icon="refresh"
                            iconColor={DappitColors.accent}
                            size={20}
                            onPress={() => webViewRef.current?.reload()}
                        />
                        <IconButton
                            icon="content-save"
                            iconColor={DappitColors.emerald}
                            size={20}
                            onPress={() => {
                                Alert.prompt
                                    ? Alert.prompt('Save App', 'Give it a name:', (name) => {
                                        setAppName(name);
                                        handleSave();
                                    })
                                    : (() => {
                                        setAppName(`App ${new Date().toLocaleDateString()}`);
                                        handleSave();
                                    })();
                            }}
                        />
                    </View>
                </View>

                {/* WebView */}
                <WebView
                    ref={webViewRef}
                    source={{ html: generatedCode }}
                    style={styles.webview}
                    javaScriptEnabled
                    domStorageEnabled
                    originWhitelist={['*']}
                    scrollEnabled
                />

                {/* Iterate bar */}
                <View style={styles.iterateBar}>
                    <TextInput
                        style={styles.iterateInput}
                        value={iteratePrompt}
                        onChangeText={setIteratePrompt}
                        placeholder="Make it darker, add a header..."
                        placeholderTextColor={DappitColors.textMuted}
                        onSubmitEditing={handleIterate}
                    />
                    <Button
                        mode="contained"
                        onPress={handleIterate}
                        compact
                        buttonColor={DappitColors.accent}
                        labelStyle={{ color: DappitColors.background, fontSize: 12 }}
                        disabled={!iteratePrompt.trim()}
                    >
                        Iterate
                    </Button>
                </View>
            </View>
        );
    }

    // ── GENERATING ──
    if (stage === 'generating') {
        return (
            <View style={styles.generatingContainer}>
                <ActivityIndicator size="large" color={DappitColors.accent} />
                <Text style={styles.generatingText}>✨ Vibe coding your app...</Text>
                <Text style={styles.generatingSubtext}>AI is generating your code</Text>
            </View>
        );
    }

    // ── PROMPT MODE (default) ──
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.promptContent} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.title}>⚡ App Builder</Text>
                    <Text style={styles.subtitle}>Describe your app — AI builds it instantly</Text>
                </View>

                {/* Preset chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                    {TECH_PRESETS.map((preset) => (
                        <Chip
                            key={preset.label}
                            onPress={() => setPrompt(preset.prompt + ' ')}
                            style={styles.presetChip}
                            textStyle={styles.presetChipText}
                            mode="outlined"
                        >
                            {preset.label}
                        </Chip>
                    ))}
                </ScrollView>

                {/* Prompt input */}
                <Card style={styles.promptCard}>
                    <Card.Content>
                        <TextInput
                            style={styles.promptInput}
                            value={prompt}
                            onChangeText={setPrompt}
                            placeholder="Build a crypto portfolio tracker with live prices, dark theme, and animated charts..."
                            placeholderTextColor={DappitColors.textMuted}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />
                    </Card.Content>
                </Card>

                {/* Build button */}
                <Button
                    mode="contained"
                    onPress={() => handleBuild()}
                    style={styles.buildButton}
                    labelStyle={styles.buildButtonLabel}
                    buttonColor={DappitColors.accent}
                    disabled={!prompt.trim()}
                    icon="rocket-launch"
                >
                    Build It
                </Button>

                {/* My Apps */}
                <Pressable onPress={loadSavedApps} style={styles.myAppsButton}>
                    <Text style={styles.myAppsText}>📂 My Saved Apps</Text>
                </Pressable>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DappitColors.background,
    },
    promptContent: {
        padding: DappitSpacing.md,
        paddingBottom: DappitSpacing.xxl,
    },
    header: {
        marginBottom: DappitSpacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    chipsRow: {
        marginBottom: DappitSpacing.md,
    },
    presetChip: {
        marginRight: DappitSpacing.sm,
        backgroundColor: DappitColors.surface,
        borderColor: DappitColors.border,
    },
    presetChipText: {
        color: DappitColors.textPrimary,
        fontSize: 13,
    },
    promptCard: {
        backgroundColor: DappitColors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: DappitColors.border,
        marginBottom: DappitSpacing.lg,
    },
    promptInput: {
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.body,
        minHeight: 120,
        lineHeight: 22,
    },
    buildButton: {
        borderRadius: 14,
        paddingVertical: DappitSpacing.sm,
    },
    buildButtonLabel: {
        fontSize: DappitFontSizes.subtitle,
        fontWeight: '800',
        color: DappitColors.background,
    },
    myAppsButton: {
        alignItems: 'center',
        marginTop: DappitSpacing.lg,
    },
    myAppsText: {
        color: DappitColors.accent,
        fontSize: DappitFontSizes.body,
        fontWeight: '600',
    },
    // Generating
    generatingContainer: {
        flex: 1,
        backgroundColor: DappitColors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    generatingText: {
        color: DappitColors.accent,
        fontSize: DappitFontSizes.title,
        fontWeight: '700',
        marginTop: DappitSpacing.lg,
    },
    generatingSubtext: {
        color: DappitColors.textMuted,
        fontSize: DappitFontSizes.body,
        marginTop: DappitSpacing.sm,
    },
    // Preview
    previewContainer: {
        flex: 1,
        backgroundColor: DappitColors.background,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DappitColors.surface,
        borderBottomWidth: 1,
        borderBottomColor: DappitColors.border,
        paddingRight: DappitSpacing.sm,
    },
    toolbarTitle: {
        flex: 1,
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.subtitle,
        fontWeight: '600',
    },
    toolbarActions: {
        flexDirection: 'row',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
    },
    iterateBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DappitColors.surface,
        borderTopWidth: 1,
        borderTopColor: DappitColors.border,
        paddingHorizontal: DappitSpacing.sm,
        paddingVertical: DappitSpacing.xs,
    },
    iterateInput: {
        flex: 1,
        backgroundColor: DappitColors.surfaceLight,
        borderRadius: 10,
        padding: DappitSpacing.sm,
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.body,
        marginRight: DappitSpacing.sm,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    // Saved apps
    emptyCard: {
        backgroundColor: DappitColors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    emptyContent: {
        alignItems: 'center',
        padding: DappitSpacing.xl,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: DappitSpacing.md,
    },
    emptyTitle: {
        fontSize: DappitFontSizes.title,
        fontWeight: '700',
        color: DappitColors.textPrimary,
    },
    emptySubtitle: {
        fontSize: DappitFontSizes.body,
        color: DappitColors.textSecondary,
        marginTop: DappitSpacing.xs,
    },
    savedCard: {
        backgroundColor: DappitColors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: DappitColors.border,
        marginBottom: DappitSpacing.sm,
    },
    savedCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    savedName: {
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.subtitle,
        fontWeight: '700',
    },
    savedPrompt: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.caption,
        marginTop: 2,
    },
    savedDate: {
        color: DappitColors.textMuted,
        fontSize: 11,
        marginTop: 4,
    },
    savedActions: {
        flexDirection: 'row',
    },
});
