import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Team } from '@/constants/MockData';
import { LevelBadge, SportBadge, DistanceBadge } from './Badge';

interface Props {
  team: Team;
  onPress?: () => void;
  onChallenge?: () => void;
  compact?: boolean;
}

export function TeamCard({ team, onPress, onChallenge, compact = false }: Props) {
  const winRate = team.wins + team.losses + team.draws > 0
    ? Math.round((team.wins / (team.wins + team.losses + team.draws)) * 100)
    : 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.topRow}>
        <View style={[styles.avatarContainer, { borderColor: team.color }]}>
          <Text style={styles.avatar}>{team.avatar}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{team.name}</Text>
          <Text style={styles.location}>📍 {team.neighborhood}, {team.city}</Text>
          <View style={styles.badges}>
            <LevelBadge level={team.level} />
            <SportBadge sport={team.sport} />
            {team.distance > 0 && <DistanceBadge distance={team.distance} />}
          </View>
        </View>
      </View>

      {!compact && (
        <View style={styles.statsRow}>
          <StatItem label="PG" value={team.wins} color={Colors.primary} />
          <Divider />
          <StatItem label="PP" value={team.losses} color={Colors.danger} />
          <Divider />
          <StatItem label="PE" value={team.draws} color={Colors.accent} />
          <Divider />
          <StatItem label="Win%" value={`${winRate}%`} color={Colors.text} />
          <Divider />
          <StatItem label="⭐" value={team.rating.toFixed(1)} color={Colors.accent} />
        </View>
      )}

      <View style={styles.bottomRow}>
        <Text style={styles.days}>
          🗓️ {team.availableDays.join(' · ')}
        </Text>
        {onChallenge && (
          <TouchableOpacity style={styles.challengeBtn} onPress={onChallenge}>
            <Text style={styles.challengeText}>⚡ Desafiar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function StatItem({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatar: {
    fontSize: 26,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  location: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textDim,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  days: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  challengeBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  challengeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
