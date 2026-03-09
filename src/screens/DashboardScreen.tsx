import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Surface, Chip, ActivityIndicator } from 'react-native-paper';
import { useConnection } from '../utils/ConnectionProvider';
import { useAuthorization, Account } from '../utils/useAuthorization';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { TokenService } from '../services/token';

export default function DashboardScreen() {
    const { connection } = useConnection();
    const { selectedAccount } = useAuthorization();
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [points, setPoints] = useState(0);
    const [hackathonStatus, setHackathonStatus] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            // Fetch SOL balance
            if (selectedAccount?.publicKey) {
                const balance = await connection.getBalance(selectedAccount.publicKey);
                setSolBalance(balance / LAMPORTS_PER_SOL);
            }

            // Fetch points
            const pointsData = await TokenService.getPoints();
            setPoints(pointsData.points);

            // Fetch hackathon status
            const hackathon = await TokenService.getHackathonStatus();
            setHackathonStatus(hackathon.entry ? 'Registered ✅' : 'Not Registered');
        } catch (err) {
            console.log('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [connection, selectedAccount]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={DappitColors.primary} />
                <Text style={styles.loadingText}>Loading Dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DappitColors.primary} />}
        >
            {/* Hero Card */}
            <Surface style={styles.heroCard}>
                <Text style={styles.heroTitle}>🚀 Dappit</Text>
                <Text style={styles.heroSubtitle}>The First Web3 Vibe Coding Platform</Text>
            </Surface>

            {/* Balance Card */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardLabel}>SOL Balance</Text>
                    <Text style={styles.balanceValue}>
                        {selectedAccount
                            ? `◎ ${solBalance?.toFixed(4) ?? '...'}`
                            : 'Connect Wallet'}
                    </Text>
                    {selectedAccount && (
                        <Text style={styles.walletAddress} numberOfLines={1}>
                            {selectedAccount.publicKey.toBase58()}
                        </Text>
                    )}
                </Card.Content>
            </Card>

            {/* Stats Row */}
            <View style={styles.statsRow}>
                <Card style={[styles.statCard, { flex: 1, marginRight: DappitSpacing.sm }]}>
                    <Card.Content>
                        <Text style={styles.statLabel}>Points</Text>
                        <Text style={styles.statValue}>{points.toLocaleString()}</Text>
                    </Card.Content>
                </Card>
                <Card style={[styles.statCard, { flex: 1, marginLeft: DappitSpacing.sm }]}>
                    <Card.Content>
                        <Text style={styles.statLabel}>Hackathon</Text>
                        <Chip
                            style={{
                                backgroundColor: hackathonStatus?.includes('✅')
                                    ? DappitColors.success + '20'
                                    : DappitColors.warning + '20',
                                marginTop: DappitSpacing.xs,
                            }}
                            textStyle={{ color: hackathonStatus?.includes('✅') ? DappitColors.success : DappitColors.warning, fontSize: 11 }}
                        >
                            {hackathonStatus ?? '...'}
                        </Chip>
                    </Card.Content>
                </Card>
            </View>

            {/* Quick Actions */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardLabel}>Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        <Chip style={styles.actionChip} textStyle={styles.actionChipText} icon="rocket-launch">Launch Token</Chip>
                        <Chip style={styles.actionChip} textStyle={styles.actionChipText} icon="robot">AI Chat</Chip>
                        <Chip style={styles.actionChip} textStyle={styles.actionChipText} icon="shield-check">Audit</Chip>
                    </View>
                </Card.Content>
            </Card>
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
    loadingText: {
        color: DappitColors.textSecondary,
        marginTop: DappitSpacing.md,
    },
    heroCard: {
        backgroundColor: DappitColors.primary,
        borderRadius: 16,
        padding: DappitSpacing.lg,
        marginBottom: DappitSpacing.md,
        alignItems: 'center',
        elevation: 4,
    },
    heroTitle: {
        fontSize: DappitFontSizes.hero,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    heroSubtitle: {
        fontSize: DappitFontSizes.body,
        color: '#FFFFFF',
        opacity: 0.85,
        marginTop: DappitSpacing.xs,
    },
    card: {
        backgroundColor: DappitColors.surface,
        borderRadius: 12,
        marginBottom: DappitSpacing.md,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    cardLabel: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: DappitSpacing.sm,
    },
    balanceValue: {
        color: DappitColors.accent,
        fontSize: DappitFontSizes.heading,
        fontWeight: '700',
    },
    walletAddress: {
        color: DappitColors.textMuted,
        fontSize: DappitFontSizes.caption,
        marginTop: DappitSpacing.xs,
        fontFamily: 'monospace',
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
    actionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: DappitSpacing.sm,
    },
    actionChip: {
        backgroundColor: DappitColors.primaryLight + '20',
    },
    actionChipText: {
        color: DappitColors.primaryLight,
        fontSize: DappitFontSizes.caption,
    },
});
