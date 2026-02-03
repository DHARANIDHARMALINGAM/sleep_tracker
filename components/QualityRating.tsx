/**
 * Quality Rating Component
 * 
 * 5-star rating selector with emoji feedback for sleep quality.
 * Supports both interactive (selection) and readonly (display) modes.
 */

import { BorderRadius, FontSizes, Spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QualityRatingProps {
    /** Current rating value (1-5) */
    value?: number;
    /** Callback when rating changes */
    onChange?: (value: number) => void;
    /** If true, rating is display-only */
    readonly?: boolean;
    /** Size variant */
    size?: 'small' | 'medium' | 'large';
}

/**
 * Get emoji and label for a rating value
 */
const getQualityInfo = (rating: number): { emoji: string; label: string; color: string } => {
    switch (rating) {
        case 1:
            return { emoji: '😴', label: 'Poor', color: '#FF5252' };
        case 2:
            return { emoji: '😕', label: 'Fair', color: '#FF9800' };
        case 3:
            return { emoji: '😐', label: 'Okay', color: '#FFC107' };
        case 4:
            return { emoji: '🙂', label: 'Good', color: '#8BC34A' };
        case 5:
            return { emoji: '😊', label: 'Excellent', color: '#4CAF50' };
        default:
            return { emoji: '😐', label: 'Not rated', color: '#9E9E9E' };
    }
};

export function QualityRating({
    value,
    onChange,
    readonly = false,
    size = 'medium',
}: QualityRatingProps) {
    const { colors } = useTheme();
    const qualityInfo = value ? getQualityInfo(value) : null;

    const starSize = size === 'small' ? 16 : size === 'large' ? 28 : 22;
    const fontSize = size === 'small' ? FontSizes.xs : size === 'large' ? FontSizes.md : FontSizes.sm;

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const isFilled = value && i <= value;
            stars.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => !readonly && onChange?.(i)}
                    disabled={readonly}
                    activeOpacity={readonly ? 1 : 0.7}
                    style={styles.starButton}
                >
                    <Ionicons
                        name={isFilled ? 'star' : 'star-outline'}
                        size={starSize}
                        color={isFilled ? '#FFD700' : colors.textMuted}
                    />
                </TouchableOpacity>
            );
        }
        return stars;
    };

    return (
        <View style={styles.container}>
            <View style={styles.starsRow}>
                {renderStars()}
            </View>
            {qualityInfo && (
                <View style={styles.labelRow}>
                    <Text style={styles.emoji}>{qualityInfo.emoji}</Text>
                    <Text style={[styles.label, { color: qualityInfo.color, fontSize }]}>
                        {qualityInfo.label}
                    </Text>
                </View>
            )}
            {!value && !readonly && (
                <Text style={[styles.hint, { color: colors.textMuted, fontSize }]}>
                    Tap to rate
                </Text>
            )}
        </View>
    );
}

/**
 * Compact quality badge for cards
 */
export function QualityBadge({ quality }: { quality: number }) {
    const info = getQualityInfo(quality);

    return (
        <View style={[styles.badge, { backgroundColor: info.color + '20' }]}>
            <Text style={styles.badgeEmoji}>{info.emoji}</Text>
            <View style={styles.badgeStars}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons
                        key={i}
                        name={i <= quality ? 'star' : 'star-outline'}
                        size={10}
                        color={i <= quality ? '#FFD700' : '#9E9E9E'}
                    />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    starButton: {
        padding: Spacing.xs,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        gap: Spacing.xs,
    },
    emoji: {
        fontSize: 20,
    },
    label: {
        fontWeight: '600',
    },
    hint: {
        marginTop: Spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
    },
    badgeEmoji: {
        fontSize: 12,
    },
    badgeStars: {
        flexDirection: 'row',
        gap: 1,
    },
});
