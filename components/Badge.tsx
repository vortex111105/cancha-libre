import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Level } from '@/constants/MockData';

const levelColors: Record<Level, { bg: string; text: string }> = {
  Principiante: { bg: Colors.blueMuted, text: Colors.blue },
  Intermedio: { bg: Colors.accentMuted, text: Colors.accent },
  Avanzado: { bg: Colors.primaryMuted, text: Colors.primary },
};

export function LevelBadge({ level }: { level: Level }) {
  const colors = levelColors[level];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{level}</Text>
    </View>
  );
}

export function SportBadge({ sport }: { sport: string }) {
  const getIcon = (s: string) => {
    if (s.includes('Básquet')) return '🏀';
    if (s.includes('Pádel')) return '🎾';
    return '⚽';
  };

  return (
    <View style={styles.sportBadge}>
      <Text style={styles.sportText}>{getIcon(sport)} {sport}</Text>
    </View>
  );
}

export function DistanceBadge({ distance }: { distance: number }) {
  return (
    <View style={styles.distanceBadge}>
      <Text style={styles.distanceText}>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance}km`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sportBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sportText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  distanceBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
