import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { TokenService } from '../services/token';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function ProfileScreen() {
    const { user, isLoggedIn, logout } = useAuth();
    const navigation = useNavigation();
    const [credits, setCredits] = useState(0);
    const [plan, setPlan] = useState('free');
    const [hackathon, setHackathon] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, [isLoggedIn]);

    const loadProfile = async () => {
        if (!isLoggedIn) {
            setLoading(false);
            return;
        }
        try {
            const tokens = await TokenService.getBalance();
            setCredits(tokens.credits);
            setPlan(tokens.plan);

            const h = await TokenService.getHackathonStatus();
            setHackathon(h.entry);
        } catch (err) {
            console.log('Profile load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinHackathon = async () => {
        if (!user) {
            Alert.alert('Login Required', 'Please log in first to join the hackathon.');
            return;
        }
        try {
            const result = await TokenService.joinHackathon(user.name, user.email);
            Alert.alert('🎉 Success', result.message);
            loadProfile();
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || err.message || 'Failed to join hackathon');
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        })
                    );
                },
            },
        ]);
    };

    const handleGoToLogin = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={DappitColors.primary} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>👤 Profile</Text>
                <Text style={styles.subtitle}>Your Dappit account</Text>
            </View>

            {isLoggedIn && user ? (
                <>
                    {/* User Info Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.avatarRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.userName}>{user.name || 'Dappit User'}</Text>
                                    <Text style={styles.userEmail}>{user.email}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Credits / Plan */}
                    <View style={styles.statsRow}>
                        <Card style={[styles.statCard, { flex: 1, marginRight: DappitSpacing.sm }]}>
                            <Card.Content>
                                <Text style={styles.statLabel}>Credits</Text>
                                <Text style={styles.statValue}>{credits.toLocaleString()}</Text>
                            </Card.Content>
                        </Card>
                        <Card style={[styles.statCard, { flex: 1, marginLeft: DappitSpacing.sm }]}>
                            <Card.Content>
                                <Text style={styles.statLabel}>Plan</Text>
                                <Chip
                                    style={{ backgroundColor: DappitColors.primary + '20', marginTop: DappitSpacing.xs }}
                                    textStyle={{ color: DappitColors.primaryLight, fontSize: 12 }}
                                >
                                    {plan.toUpperCase()}
                                </Chip>
                            </Card.Content>
                        </Card>
                    </View>

                    {/* Hackathon Card */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.sectionTitle}>🏆 Hackathon</Text>
                            {hackathon ? (
                                <View>
                                    <Chip
                                        style={{ backgroundColor: DappitColors.success + '20', alignSelf: 'flex-start' }}
                                        textStyle={{ color: DappitColors.success }}
                                        icon="check-circle"
                                    >
                                        Registered
                                    </Chip>
                                    <Text style={styles.hackathonDate}>
                                        Joined: {new Date(hackathon.joined_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            ) : (
                                <Button
                                    mode="contained"
                                    onPress={handleJoinHackathon}
                                    buttonColor={DappitColors.accent}
                                    style={{ borderRadius: 12, marginTop: DappitSpacing.sm }}
                                >
                                    Join Hackathon
                                </Button>
                            )}
                        </Card.Content>
                    </Card>

                    <Divider style={styles.divider} />

                    <Button
                        mode="outlined"
                        onPress={handleLogout}
                        textColor={DappitColors.error}
                        style={styles.logoutButton}
                        icon="logout"
                    >
                        Logout
                    </Button>
                </>
            ) : (
                /* Not Logged In */
                <Card style={styles.card}>
                    <Card.Content style={styles.loginContent}>
                        <Text style={styles.loginEmoji}>🔐</Text>
                        <Text style={styles.loginTitle}>Not Logged In</Text>
                        <Text style={styles.loginSubtitle}>
                            Log in to your Dappit account to access credits, hackathon status, and more.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={handleGoToLogin}
                            buttonColor={DappitColors.primary}
                            style={{ borderRadius: 12, marginTop: DappitSpacing.lg }}
                        >
                            Go to Login
                        </Button>
                    </Card.Content>
                </Card>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DappitColors.background,
        padding: DappitSpacing.md,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: DappitColors.background,
    },
    header: {
        marginBottom: DappitSpacing.lg,
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
    card: {
        backgroundColor: DappitColors.surface,
        borderRadius: 12,
        marginBottom: DappitSpacing.md,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: DappitColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: DappitSpacing.md,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    userName: {
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.subtitle,
        fontWeight: '700',
    },
    userEmail: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.body,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: DappitSpacing.md,
    },
    statCard: {
        backgroundColor: DappitColors.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    statLabel: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    statValue: {
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.title,
        fontWeight: '700',
        marginTop: DappitSpacing.xs,
    },
    sectionTitle: {
        color: DappitColors.textPrimary,
        fontSize: DappitFontSizes.subtitle,
        fontWeight: '700',
        marginBottom: DappitSpacing.sm,
    },
    hackathonDate: {
        color: DappitColors.textMuted,
        fontSize: DappitFontSizes.caption,
        marginTop: DappitSpacing.sm,
    },
    divider: {
        backgroundColor: DappitColors.border,
        marginVertical: DappitSpacing.md,
    },
    logoutButton: {
        borderRadius: 12,
        borderColor: DappitColors.error + '40',
        marginBottom: DappitSpacing.xxl,
    },
    loginContent: {
        alignItems: 'center',
        padding: DappitSpacing.lg,
    },
    loginEmoji: {
        fontSize: 48,
        marginBottom: DappitSpacing.md,
    },
    loginTitle: {
        fontSize: DappitFontSizes.title,
        fontWeight: '700',
        color: DappitColors.textPrimary,
        marginBottom: DappitSpacing.sm,
    },
    loginSubtitle: {
        fontSize: DappitFontSizes.body,
        color: DappitColors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
