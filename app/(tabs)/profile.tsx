import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { MY_TEAM } from '@/constants/MockData';
import { LevelBadge, SportBadge } from '@/components/Badge';

export default function ProfileScreen() {
  const team = MY_TEAM;
  const total = team.wins + team.losses + team.draws;
  const winRate = Math.round((team.wins / total) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Equipo</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => Alert.alert('Editar perfil', 'Próximamente')}>
            <Text style={styles.editBtnText}>✏ Editar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <View style={[styles.avatarWrapper, { borderColor: team.color }]}>
            <Text style={styles.avatar}>{team.avatar}</Text>
          </View>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamLocation}>📍 {team.neighborhood}, {team.city}</Text>
          <View style={styles.badgesRow}>
            <LevelBadge level={team.level} />
            <SportBadge sport={team.sport} />
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStars}>{'⭐'.repeat(Math.round(team.rating))}</Text>
            <Text style={styles.ratingValue}>{team.rating.toFixed(1)} / 5.0</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={team.wins} label="Ganados" color={Colors.primary} icon="🏆" />
          <StatCard value={team.losses} label="Perdidos" color={Colors.danger} icon="💔" />
          <StatCard value={team.draws} label="Empates" color={Colors.accent} icon="🤝" />
        </View>

        <View style={styles.card}>
          <View style={styles.progressHeader}>
            <Text style={styles.cardTitle}>Win Rate</Text>
            <Text style={[styles.progressValue, { color: Colors.primary }]}>{winRate}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${winRate}%` }]} />
          </View>
          <Text style={styles.progressSub}>{total} partidos jugados</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Descripción</Text>
          <Text style={styles.description}>{team.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Disponibilidad</Text>
          <View style={styles.daysGrid}>
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => {
              const fullDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
              const active = team.availableDays.includes(fullDays[i]);
              return (
                <View key={day} style={[styles.dayCell, active && styles.dayCellActive]}>
                  <Text style={[styles.dayCellText, active && styles.dayCellTextActive]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Integrantes ({team.members})</Text>
          <View style={styles.membersRow}>
            {Array.from({ length: team.members }).map((_, i) => (
              <View key={i} style={styles.memberAvatar}>
                <Text style={styles.memberEmoji}>👤</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addMember}>
              <Text style={styles.addMemberText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial reciente</Text>
          {[
            { rival: 'Los Cebollitas', result: 'V', score: '5-1', date: 'Hace 3 días' },
            { rival: 'El Nido SC', result: 'E', score: '2-2', date: 'Hace 1 sem' },
            { rival: 'Villa Crespo FC', result: 'V', score: '3-2', date: 'Hace 2 sem' },
            { rival: 'Tigres del Sur', result: 'D', score: '1-3', date: 'Hace 3 sem' },
          ].map((match, i) => (
            <View key={i} style={styles.matchRow}>
              <View style={[styles.resultBadge, {
                backgroundColor:
                  match.result === 'V' ? Colors.primaryMuted :
                  match.result === 'E' ? Colors.accentMuted : Colors.dangerMuted,
              }]}>
                <Text style={[styles.resultText, {
                  color:
                    match.result === 'V' ? Colors.primary :
                    match.result === 'E' ? Colors.accent : Colors.danger,
                }]}>{match.result}</Text>
              </View>
              <Text style={styles.matchRival} numberOfLines={1}>vs {match.rival}</Text>
              <Text style={styles.matchScore}>{match.score}</Text>
              <Text style={styles.matchDate}>{match.date}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => Alert.alert('Compartir', 'Próximamente')}
          >
            <Text style={styles.shareBtnText}>📤 Compartir perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, color, icon }: { value: number; label: string; color: string; icon: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  editBtn: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: Colors.text },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 8,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 4,
  },
  avatar: { fontSize: 44 },
  teamName: { fontSize: 24, fontWeight: '800', color: Colors.text },
  teamLocation: { fontSize: 13, color: Colors.textMuted },
  badgesRow: { flexDirection: 'row', gap: 8 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  ratingStars: { fontSize: 14 },
  ratingValue: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: Colors.textDim },
  card: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressValue: { fontSize: 15, fontWeight: '800' },
  progressBar: {
    height: 8,
    backgroundColor: Colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressSub: { fontSize: 12, color: Colors.textDim },
  description: { fontSize: 14, color: Colors.textMuted, lineHeight: 21 },
  daysGrid: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayCell: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCellActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  dayCellText: { fontSize: 11, fontWeight: '600', color: Colors.textDim },
  dayCellTextActive: { color: Colors.primary },
  membersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memberEmoji: { fontSize: 18 },
  addMember: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  addMemberText: { fontSize: 20, color: Colors.primary, lineHeight: 22 },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  resultBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultText: { fontSize: 12, fontWeight: '800' },
  matchRival: { flex: 1, fontSize: 14, color: Colors.text },
  matchScore: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  matchDate: { fontSize: 12, color: Colors.textDim },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    gap: 10,
    marginTop: 4,
  },
  shareBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: Colors.text },
  logoutBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutBtnText: { fontSize: 14, color: Colors.danger, fontWeight: '600' },
});
