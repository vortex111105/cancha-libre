import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { TEAMS } from '@/constants/MockData';
import { LevelBadge, SportBadge } from '@/components/Badge';

export default function TeamProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = TEAMS.find(t => t.id === id) ?? TEAMS[0];

  const winRate = Math.round((team.wins / (team.wins + team.losses + team.draws)) * 100);
  const totalGames = team.wins + team.losses + team.draws;

  const handleChallenge = () => {
    router.push(`/challenge/new?teamId=${team.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={[styles.avatarLarge, { borderColor: team.color }]}>
            <Text style={styles.avatarEmoji}>{team.avatar}</Text>
          </View>
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.location}>📍 {team.neighborhood}, {team.city}</Text>
          <View style={styles.badgeRow}>
            <LevelBadge level={team.level} />
            <SportBadge sport={team.sport} />
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {team.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({totalGames} partidos)</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatBox label="Ganados" value={team.wins} color={Colors.primary} icon="🏆" />
          <StatBox label="Perdidos" value={team.losses} color={Colors.danger} icon="❌" />
          <StatBox label="Empates" value={team.draws} color={Colors.accent} icon="🤝" />
          <StatBox label="Win Rate" value={`${winRate}%`} color={Colors.blue} icon="📊" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre el equipo</Text>
          <Text style={styles.description}>{team.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disponibilidad</Text>
          <View style={styles.daysRow}>
            {team.availableDays.map(day => (
              <View key={day} style={styles.dayChip}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Integrantes</Text>
          <View style={styles.membersRow}>
            {Array.from({ length: team.members }).map((_, i) => (
              <View key={i} style={styles.memberDot}>
                <Text style={styles.memberEmoji}>
                  {['👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤', '👤'][i]}
                </Text>
              </View>
            ))}
            <View style={styles.memberCount}>
              <Text style={styles.memberCountText}>{team.members}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial reciente</Text>
          {[
            { rival: 'Los Compadres', result: 'V', score: '4-2', date: 'Hace 1 sem' },
            { rival: 'Barrio Norte United', result: 'V', score: '3-1', date: 'Hace 2 sem' },
            { rival: 'Tigres del Sur', result: 'D', score: '2-4', date: 'Hace 3 sem' },
          ].map((match, i) => (
            <View key={i} style={styles.matchRow}>
              <View style={[styles.resultBadge, {
                backgroundColor: match.result === 'V' ? Colors.primaryMuted : Colors.dangerMuted,
              }]}>
                <Text style={[styles.resultText, {
                  color: match.result === 'V' ? Colors.primary : Colors.danger,
                }]}>{match.result}</Text>
              </View>
              <Text style={styles.matchRival}>vs {match.rival}</Text>
              <Text style={styles.matchScore}>{match.score}</Text>
              <Text style={styles.matchDate}>{match.date}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push(`/chat/${team.id}` as any)}
          >
            <Text style={styles.chatBtnText}>💬 Enviar mensaje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.challengeBtn} onPress={handleChallenge}>
            <Text style={styles.challengeBtnText}>⚡ Desafiar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: string }) {
  return (
    <View style={[styles.statBox, { borderColor: color + '44' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 4,
  },
  avatarEmoji: { fontSize: 48 },
  name: { fontSize: 26, fontWeight: '800', color: Colors.text },
  location: { fontSize: 13, color: Colors.textMuted },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  ratingText: { fontSize: 15, fontWeight: '700', color: Colors.accent },
  ratingCount: { fontSize: 12, color: Colors.textDim },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textDim, textAlign: 'center' },
  section: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  description: { fontSize: 14, color: Colors.textMuted, lineHeight: 21 },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  memberDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberEmoji: { fontSize: 18 },
  memberCount: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  memberCountText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: { fontSize: 13, fontWeight: '800' },
  matchRival: { flex: 1, fontSize: 14, color: Colors.text },
  matchScore: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  matchDate: { fontSize: 12, color: Colors.textDim },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 32,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chatBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  challengeBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  challengeBtnText: { fontSize: 15, fontWeight: '800', color: '#000' },
});
