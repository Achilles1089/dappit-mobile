import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, Chip, Divider, ActivityIndicator } from 'react-native-paper';
import { DappitColors, DappitSpacing, DappitFontSizes } from '../theme/colors';
import { useAuthorization } from '../utils/useAuthorization';
import { useMobileWallet } from '../utils/useMobileWallet';
import { useConnection } from '../utils/ConnectionProvider';
import { LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import * as Clipboard from 'expo-clipboard';
import { DappitIcon } from '../components/DappitIcon';

export default function WalletScreen() {
    const { selectedAccount, accounts, authorizeSession, deauthorizeSession } = useAuthorization();
    const { signAndSendTransaction } = useMobileWallet();
    const { connection } = useConnection();
    const { connect, disconnect } = useMobileWallet();
    const [solBalance, setSolBalance] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchBalance = useCallback(async () => {
        if (!selectedAccount?.publicKey) {
            setSolBalance(null);
            return;
        }
        try {
            const balance = await connection.getBalance(selectedAccount.publicKey);
            setSolBalance(balance / LAMPORTS_PER_SOL);
        } catch (err) {
            console.log('Balance fetch error:', err);
        } finally {
            setRefreshing(false);
        }
    }, [connection, selectedAccount]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const handleConnect = async () => {
        try {
            setLoading(true);
            await connect();
        } catch (err: any) {
            Alert.alert('Connection Failed', err.message || 'Could not connect to wallet');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            setSolBalance(null);
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const handleAirdrop = async () => {
        if (!selectedAccount?.publicKey) return;
        try {
            setLoading(true);
            const signature = await connection.requestAirdrop(
                selectedAccount.publicKey,
                1 * LAMPORTS_PER_SOL
            );
            await connection.confirmTransaction(signature, 'confirmed');
            Alert.alert('Airdrop Success', '1 SOL has been airdropped to your wallet (devnet)');
            fetchBalance();
        } catch (err: any) {
            Alert.alert('Airdrop Failed', err.message || 'Airdrop failed — may only work on devnet');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAddress = async () => {
        if (!selectedAccount?.publicKey) return;
        await Clipboard.setStringAsync(selectedAccount.publicKey.toBase58());
        Alert.alert('Copied!', 'Wallet address copied to clipboard');
    };

    const handleSendSOL = async () => {
        if (!selectedAccount?.publicKey) return;

        try {
            setLoading(true);
            // Demo: self-transfer to show MWA signing works
            const { blockhash } = await connection.getLatestBlockhash('confirmed');
            const tx = new Transaction();
            tx.recentBlockhash = blockhash;
            tx.feePayer = selectedAccount.publicKey;
            tx.add(
                SystemProgram.transfer({
                    fromPubkey: selectedAccount.publicKey,
                    toPubkey: selectedAccount.publicKey,
                    lamports: 0,
                })
            );
            const { context: txContext } = await connection.getLatestBlockhashAndContext('confirmed');
            const sig = await signAndSendTransaction(tx, txContext.slot);
            Alert.alert('Transaction Sent', `Signature: ${sig.slice(0, 20)}...`);
            fetchBalance();
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchBalance(); }} tintColor={DappitColors.primary} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>💳 Wallet</Text>
                <Text style={styles.subtitle}>Manage your Solana wallet via MWA</Text>
            </View>

            {selectedAccount ? (
                <>
                    {/* Connected Card */}
                    <Card style={styles.walletCard}>
                        <Card.Content>
                            <View style={styles.connectedRow}>
                                <View style={styles.connectedDot} />
                                <Text style={styles.connectedText}>Connected</Text>
                            </View>

                            <Text style={styles.balanceLabel}>Balance</Text>
                            <Text style={styles.balanceValue}>◎ {solBalance?.toFixed(4) ?? '...'}</Text>

                            <Divider style={styles.divider} />

                            <Text style={styles.addressLabel}>Address</Text>
                            <Chip
                                onPress={handleCopyAddress}
                                style={styles.addressChip}
                                textStyle={styles.addressChipText}
                                icon="content-copy"
                            >
                                {selectedAccount.publicKey.toBase58().slice(0, 8)}...{selectedAccount.publicKey.toBase58().slice(-8)}
                            </Chip>
                        </Card.Content>
                    </Card>

                    {/* Actions */}
                    <View style={styles.actionsGrid}>
                        <Button
                            mode="contained"
                            onPress={handleAirdrop}
                            style={styles.actionButton}
                            buttonColor={DappitColors.accent}
                            icon="water"
                            loading={loading}
                        >
                            Airdrop 1 SOL
                        </Button>
                        <Button
                            mode="contained"
                            onPress={handleSendSOL}
                            style={styles.actionButton}
                            buttonColor={DappitColors.primary}
                            icon="send"
                            loading={loading}
                        >
                            Test Send
                        </Button>
                    </View>

                    <Button
                        mode="outlined"
                        onPress={handleDisconnect}
                        style={styles.disconnectButton}
                        textColor={DappitColors.error}
                        icon="wallet-outline"
                    >
                        Disconnect Wallet
                    </Button>
                </>
            ) : (
                /* Not Connected */
                <Card style={styles.connectCard}>
                    <Card.Content style={styles.connectContent}>
                        <DappitIcon name="link" size={48} color={DappitColors.accent} />
                        <Text style={styles.connectTitle}>Connect Your Wallet</Text>
                        <Text style={styles.connectSubtitle}>
                            Use Mobile Wallet Adapter to connect Phantom, Solflare, or any MWA-compatible wallet
                        </Text>
                        <Button
                            mode="contained"
                            onPress={handleConnect}
                            style={styles.connectButton}
                            buttonColor={DappitColors.primary}
                            icon="wallet"
                            loading={loading}
                        >
                            Connect Wallet
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
    walletCard: {
        backgroundColor: DappitColors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: DappitColors.accent + '40',
        marginBottom: DappitSpacing.lg,
    },
    connectedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: DappitSpacing.md,
    },
    connectedDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: DappitColors.success,
        marginRight: DappitSpacing.sm,
    },
    connectedText: {
        color: DappitColors.success,
        fontSize: DappitFontSizes.caption,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceLabel: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    balanceValue: {
        color: DappitColors.accent,
        fontSize: 36,
        fontWeight: '800',
        marginTop: DappitSpacing.xs,
    },
    divider: {
        backgroundColor: DappitColors.border,
        marginVertical: DappitSpacing.md,
    },
    addressLabel: {
        color: DappitColors.textSecondary,
        fontSize: DappitFontSizes.caption,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: DappitSpacing.xs,
    },
    addressChip: {
        backgroundColor: DappitColors.surfaceLight,
        alignSelf: 'flex-start',
    },
    addressChipText: {
        color: DappitColors.textPrimary,
        fontFamily: 'monospace',
        fontSize: DappitFontSizes.caption,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: DappitSpacing.sm,
        marginBottom: DappitSpacing.md,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
    },
    disconnectButton: {
        borderRadius: 12,
        borderColor: DappitColors.error + '40',
    },
    connectCard: {
        backgroundColor: DappitColors.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: DappitColors.border,
    },
    connectContent: {
        alignItems: 'center',
        padding: DappitSpacing.lg,
    },
    connectEmoji: {
        fontSize: 48,
        marginBottom: DappitSpacing.md,
    },
    connectTitle: {
        fontSize: DappitFontSizes.title,
        fontWeight: '700',
        color: DappitColors.textPrimary,
        marginBottom: DappitSpacing.sm,
    },
    connectSubtitle: {
        fontSize: DappitFontSizes.body,
        color: DappitColors.textSecondary,
        textAlign: 'center',
        marginBottom: DappitSpacing.lg,
        lineHeight: 20,
    },
    connectButton: {
        borderRadius: 12,
        paddingHorizontal: DappitSpacing.lg,
    },
});
