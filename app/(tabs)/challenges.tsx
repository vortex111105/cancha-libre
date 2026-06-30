import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import type { Challenge } from '@/constants/MockData';
import { ChallengeCard } from '@/components/ChallengeCard';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';
import { useMyTeam } from '@/hooks/useMyTeam';

type Tab = 'incoming' | 'outgoing';

export default function ChallengesScreen() {
  const { teamId, userId } = useMyTeam();
  const [activeTab, setActiveTab] = useState<Tab>('incoming');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    const { data } = await supabase
      .from('cl_challenges')
      .select('*, from_team:cl_teams!from_team(*), to_team:cl_teams!to_team(*)')
      .or(`from_team.eq.${teamId},to_team.eq.${teamId}`)
      .order('created_at', { ascending: false });

    const mapped: Challenge[] = (data ?? []).map((row: any) => {
      const isIncoming = row.to_team?.id === teamId;
      const otherTeamRaw = isIncoming ? row.from_team : row.to_team;
      return {
        id: row.id,
        team: mapTeam(otherTeamRaw),
        type: isIncoming ? 'incoming' : 'outgoing',
        status: row.status,
        proposedDate: row.proposed_date ?? '',
        proposedTime: row.proposed_time ?? '',
        message: row.message ?? '',
        isCompleted: row.is_completed ?? false,
        createdAt: row.created_at,
      };
    });
    setChallenges(mapped);
    setLoading(false);
  }, [teamId]);

  useEffect(() => { fetchChallenges(); }, [fetchChallenges]);

  const incoming = challenges.filter(c => c.type === 'incoming');
  const outgoing = challenges.filter(c => c.type === 'outgoing');
  const pendingCount = incoming.filter(c => c.status === 'pending').length;

  const handleAccept = async (id: string) => {
    await supabase.from('cl_challenges').update({ status: 'accepted' }).eq('id', id);
    setChallenges(prev => prev.map(c => c.id === id ? { ...c, status: 'accepted' as const } : c));
  };

  const handleDecline = (id: string) => {
    Alert.alert('Rechazar desafío', '¿Estás seguro que querés rechazar este desafío?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: async () => {
          await supabase.from('cl_challenges').update({ status: 'declined' }).eq('id', id);
          setChallenges(prev => prev.map(c => c.id === id ? { ...c, status: 'declined' as const } : c));
        },
      },
    ]);
  };

  const displayed = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Desafíos</Text>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{pendingCount} pendiente{pendingCount > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'incoming' && styles.tabActive]}
          onPress={() => setActiveTab('incoming')}
        >
          <Text style={[styles.tabText, activeTab === 'incoming' && styles.tabTextActive]}>
            📥 Recibidos
          </Text>
          {pendingCount > 0 && activeTab !== 'incoming' && (
            <View style={styles.tabDot} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'outgoing' && styles.tabActive]}
          onPress={() => setActiveTab('outgoing')}
        >
          <Text style={[styles.tabText, activeTab === 'outgoing' && styles.tabTextActive]}>
            📤 Enviados
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {displayed.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{activeTab === 'incoming' ? '📭' : '📬'}</Text>
              <Text style={styles.emptyTitle}>
                {activeTab === 'incoming' ? 'Sin desafíos recibidos' : 'No enviaste desafíos aún'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'incoming'
                  ? 'Cuando otros equipos te desafíen, aparecerán acá'
                  : 'Buscá equipos y mandá tu primer desafío'}
              </Text>
            </View>
          ) : (
            displayed.map(challenge => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                onAccept={() => handleAccept(challenge.id)}
                onDecline={() => handleDecline(challenge.id)}
                onRate={() => require('expo-router').router.push({ 
                  pathname: '/challenge/rate', 
                  params: { challengeId: challenge.id, teamId: challenge.team.id, isIncoming: String(challenge.type === 'incoming') } 
                })}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  pendingBadge: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  pendingBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.accent },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  tabActive: { backgroundColor: Colors.surface },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textDim },
  tabTextActive: { color: Colors.text },
  tabDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
