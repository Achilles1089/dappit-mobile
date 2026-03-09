/**
 * DappitIcon — Brand icon component replacing all emojis
 * 
 * Uses the official Dappit robot mascot SVG, the hexagonal "b" logo,
 * and MaterialCommunityIcons for contextual icons.
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { DappitColors } from '../theme/colors';

type IconName =
    | 'logo'           // Dappit robot mascot face
    | 'hex-logo'       // Hexagonal "b" logo
    | 'bolt'           // ⚡ App Builder
    | 'rocket'         // 🚀 Launch / Token Launcher
    | 'globe'          // 🌐 Landing Page preset
    | 'chart'          // 📊 Dashboard preset
    | 'coin'           // 🪙 Solana dApp preset  
    | 'store'          // 🛒 Store preset
    | 'file-doc'       // 📝 Portfolio preset
    | 'folder'         // 📂 My Apps
    | 'hammer'         // 🏗️ Building / Empty state
    | 'sparkle'        // ✨ Generating
    | 'check'          // ✅ Success
    | 'alert'          // ⚠️ Warning
    | 'robot'          // 🤖 AI Chat
    | 'wave'           // 👋 Greeting
    | 'link'           // 🔗 Connect
    | 'sign'           // ✍️ Signing
    | 'website'        // 3D website icon
    | 'dapp'           // 3D dApp icon
    | 'portfolio'      // Portfolio icon
    | 'token-dash'     // Token dashboard icon
    | 'mobile';        // 3D mobile icon

interface DappitIconProps {
    name: IconName;
    size?: number;
    color?: string;
}

// Map icon names to MaterialCommunityIcons names
const ICON_MAP: Record<string, string> = {
    bolt: 'lightning-bolt',
    rocket: 'rocket-launch',
    globe: 'web',
    chart: 'chart-bar',
    coin: 'bitcoin',
    store: 'storefront-outline',
    'file-doc': 'file-document-edit-outline',
    folder: 'folder-open',
    hammer: 'hammer-wrench',
    sparkle: 'creation',
    check: 'check-circle',
    alert: 'alert-circle-outline',
    robot: 'robot',
    wave: 'hand-wave',
    link: 'link-variant',
    sign: 'draw-pen',
};

// Map icon names to 3D PNG assets
const IMAGE_MAP: Record<string, any> = {
    website: require('../../assets/icon-website-3d.png'),
    dapp: require('../../assets/icon-dapp-3d.png'),
    portfolio: require('../../assets/icon-portfolio.png'),
    'token-dash': require('../../assets/icon-token-dash.png'),
    mobile: require('../../assets/icon-mobile-3d.png'),
};

export function DappitIcon({ name, size = 24, color }: DappitIconProps) {
    const iconColor = color || DappitColors.accent;

    // Brand SVGs
    if (name === 'logo') {
        return <DappitMascotIcon size={size} />;
    }
    if (name === 'hex-logo') {
        return <DappitHexIcon size={size} />;
    }

    // 3D image assets
    if (IMAGE_MAP[name]) {
        return (
            <Image
                source={IMAGE_MAP[name]}
                style={{ width: size, height: size }}
                resizeMode="contain"
            />
        );
    }

    // MaterialCommunityIcons fallback
    const iconName = ICON_MAP[name];
    if (iconName) {
        return <MaterialCommunityIcons name={iconName as any} size={size} color={iconColor} />;
    }

    return null;
}

/** 
 * Dappit Robot Mascot — rounded square with cyan glow border + white eye bars
 * Derived from favicon.svg
 */
function DappitMascotIcon({ size }: { size: number }) {
    const scale = size / 48;
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="mascotBorder" x1="3" y1="4" x2="40" y2="49" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#A2FBFF" />
                    <Stop offset="1" stopColor="#00ADB5" />
                </LinearGradient>
            </Defs>
            <Path
                d="M2 16.5C0.8 8.2 7.1 1 15.5 1H32.5C40.9 1 47.2 8.2 46 16.5L44.2 32.5C43.4 39.5 37.6 44.8 30.6 44.8H17.4C10.4 44.8 4.6 39.5 3.8 32.5L2 16.5Z"
                fill="#1D1D28"
                stroke="url(#mascotBorder)"
                strokeWidth="2"
            />
            <Rect x="12" y="15" width="5" height="14" rx="2.5" fill="white" />
            <Rect x="31" y="15" width="5" height="14" rx="2.5" fill="white" />
        </Svg>
    );
}

/**
 * Dappit Hex "b" Logo — hexagonal shape with purple gradient
 * Derived from logo1.svg
 */
function DappitHexIcon({ size }: { size: number }) {
    const scale = size / 48;
    return (
        <Svg width={size} height={size} viewBox="0 0 48 42" fill="none">
            <Defs>
                <LinearGradient id="hexGrad" x1="24" y1="0" x2="24" y2="42" gradientUnits="userSpaceOnUse">
                    <Stop stopColor="#B69EFF" />
                    <Stop offset="0.5" stopColor="#8A5FFF" />
                    <Stop offset="1" stopColor="#2D1959" />
                </LinearGradient>
            </Defs>
            <Path
                d="M33.7 0H14.3a4 4 0 00-3.5 2L1.1 18.9a4 4 0 000 4l9.7 16.9a4 4 0 003.5 2h19.4a4 4 0 003.5-2l9.7-16.9a4 4 0 000-4L37.2 2a4 4 0 00-3.5-2Z"
                fill="url(#hexGrad)"
            />
            <Path
                d="M25.6 30.2c-1.8 0-3.5-.6-4.5-2l-.3 1.6-6.4 3.4.7-3.4 4.7-21.3h5.7l-1.7 7.5c1.3-1.5 2.6-2 4.2-2 3.4 0 5.7 2.3 5.7 6.4 0 4.3-2.6 9.8-8.1 9.8Zm2.2-8.6c0 2-1.4 3.5-3.2 3.5-1 0-1.9-.4-2.5-1l.9-3.9c.7-.7 1.4-1.1 2.3-1.1 1.4 0 2.5 1 2.5 2.5Z"
                fill="white"
            />
        </Svg>
    );
}

export default DappitIcon;
