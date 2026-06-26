import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import type { Sport, Team } from '@/constants/MockData';
import { TeamCard } from '@/components/TeamCard';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';
import { useMyTeam } from '@/hooks/useMyTeam';

const SPORT_FILTERS: (Sport | 'Todos')[] = ['Todos', 'Fútbol 5vs5', 'Fútbol 7vs7', 'Fútbol 8vs8', 'Fútbol 11vs11', 'Básquet 3x3', 'Básquet 5x5', 'Pádel Single (1vs1)', 'Pádel Parejas'];

export default function HomeScreen() {
  const { team: myTeam, userId } = useMyTeam();
  const [sportFilter, setSportFilter] = useState<Sport | 'Todos'>('Todos');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const fetchTeams = useCallback(async () => {
    setLoadingTeams(true);
    let query = supabase.from('cl_teams').select('*').order('created_at', { ascending: false });
    if (userId) query = query.neq('user_id', userId);
    const { data } = await query;
    setTeams((data ?? []).map(mapTeam));
    setLoadingTeams(false);
  }, [userId]);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const filtered = teams.filter(t => sportFilter === 'Todos' || t.sport === sportFilter);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>
              Hola, {myTeam?.name ?? 'Jugador'} 👋
            </Text>
            <Text style={styles.location}>
              📍 {myTeam ? `${myTeam.neighborhood}, ${myTeam.city}` : 'Buenos Aires'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {!myTeam ? (
          <View style={styles.noTeamCard}>
            <Text style={styles.noTeamEmoji}>🏃</Text>
            <Text style={styles.noTeamTitle}>¡Aún no tenés equipo!</Text>
            <Text style={styles.noTeamSub}>Para jugar y desafiar rivales, unite a uno o creá el tuyo.</Text>
            <View style={styles.noTeamBtns}>
              <TouchableOpacity style={styles.noTeamBtnPrimary} onPress={() => router.push('/(auth)/create-team')}>
                <Text style={styles.noTeamBtnPrimaryText}>Crear equipo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noTeamBtnSecondary} onPress={() => router.push('/team/join' as any)}>
                <Text style={styles.noTeamBtnSecondaryText}>Tengo un código</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Encontrá{'\n'}tu próximo rival</Text>
                <Text style={styles.heroSub}>{teams.length} equipos cerca de vos</Text>
                <TouchableOpacity
                  style={styles.heroBtn}
                  onPress={() => router.push('/(tabs)/search')}
                >
                  <Text style={styles.heroBtnText}>🔍 Buscar rivales</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.heroEmoji}>⚽</Text>
            </View>

            <View style={styles.quickStats}>
              <QuickStat label="Equipos\ncerca" value={teams.length.toString()} color={Colors.primary} />
              <QuickStat label="Deporte\nfavorito" value={myTeam?.sport?.split(' ')[0] ?? '—'} color={Colors.blue} />
              <QuickStat label="Nivel\nactual" value={myTeam?.level?.slice(0, 3) ?? '—'} color={Colors.accent} />
            </View>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Equipos cerca de vos</Text>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={styles.toggleText}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleActive]}
              onPress={() => setViewMode('map')}
            >
              <Text style={styles.toggleText}>🗺</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {SPORT_FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, sportFilter === f && styles.filterChipActive]}
              onPress={() => setSportFilter(f)}
            >
              <Text style={[styles.filterChipText, sportFilter === f && styles.filterChipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {viewMode === 'map' ? (
          <MapPlaceholder count={filtered.length} />
        ) : loadingTeams ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Sin equipos por ahora</Text>
            <Text style={styles.emptyText}>Cuando otros equipos se registren, aparecerán acá</Text>
          </View>
        ) : (
          <View style={styles.teamList}>
            {filtered.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onPress={() => router.push(`/team/${team.id}` as any)}
                onChallenge={() => router.push(`/challenge/new?teamId=${team.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.quickStatCard, { borderColor: color + '33' }]}>
      <Text style={[styles.quickStatValue, { color }]}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  );
}

function MapPlaceholder({ count }: { count: number }) {
  return (
    <View style={styles.mapPlaceholder}>
      <Text style={styles.mapGrid}>
        {'  🏢  🏢  🏢  🏢\n'}
        {'  🏢     🦁  🏢\n'}
        {'  🏢  🐺  🏢  🏢\n'}
        {'  🏢  🏢  🦅  🏢\n'}
        {'  🏢  🏢  🏢  🏢'}
      </Text>
      <View style={styles.mapOverlay}>
        <Text style={styles.mapOverlayText}>🗺 Vista de mapa</Text>
        <Text style={styles.mapOverlaySub}>{count} equipos en tu zona</Text>
        <Text style={styles.mapOverlayNote}>
          (Requiere permisos de ubicación en el dispositivo)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: { fontSize: 18, fontWeight: '700', color: Colors.text },
  location: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  notifBtn: { position: 'relative', padding: 4 },
  notifIcon: { fontSize: 22 },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.bg,
  },
  heroCard: {
    margin: 20,
    marginTop: 12,
    backgroundColor: Colors.primaryDark,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroContent: { flex: 1 },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 30,
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  heroBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  heroBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primaryDark },
  heroEmoji: { fontSize: 72, opacity: 0.25 },
  noTeamCard: {
    margin: 20,
    marginTop: 12,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noTeamEmoji: { fontSize: 48, marginBottom: 12 },
  noTeamTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 6 },
  noTeamSub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  noTeamBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  noTeamBtnPrimary: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  noTeamBtnPrimaryText: { fontSize: 14, fontWeight: '700', color: '#000' },
  noTeamBtnSecondary: { flex: 1, backgroundColor: Colors.surface, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  noTeamBtnSecondaryText: { fontSize: 14, fontWeight: '700', color: Colors.text },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickStatValue: { fontSize: 22, fontWeight: '800' },
  quickStatLabel: {
    fontSize: 10,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  viewToggle: { flexDirection: 'row', gap: 4 },
  toggleBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  toggleText: { fontSize: 16 },
  filterScroll: { marginBottom: 16 },
  filterContent: { paddingHorizontal: 20, gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterChipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  filterChipTextActive: { color: Colors.primary },
  teamList: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  mapPlaceholder: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 300,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGrid: {
    fontSize: 24,
    lineHeight: 40,
    textAlign: 'center',
    opacity: 0.2,
    position: 'absolute',
  },
  mapOverlay: { alignItems: 'center', gap: 6 },
  mapOverlayText: { fontSize: 20, fontWeight: '700', color: Colors.text },
  mapOverlaySub: { fontSize: 14, color: Colors.primary },
  mapOverlayNote: { fontSize: 11, color: Colors.textDim, textAlign: 'center', marginTop: 4 },
});
