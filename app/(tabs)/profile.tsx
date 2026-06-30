import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch, Share
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { LevelBadge, SportBadge } from '@/components/Badge';
import { supabase } from '@/lib/supabase';
import { mapUser } from '@/lib/mappers';
import { useMyTeam } from '@/hooks/useMyTeam';
import type { User } from '@/constants/MockData';

export default function ProfileScreen() {
  const { team, loading } = useMyTeam();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!team) return;
    const fetchHistory = async () => {
      const { data } = await supabase
        .from('cl_challenges')
        .select('*, from_team:cl_teams!from_team(name), to_team:cl_teams!to_team(name)')
        .eq('is_completed', true)
        .or(`from_team.eq.${team.id},to_team.eq.${team.id}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        const history = data.map(match => {
          // Si fuimos nosotros los retados, el rival es from_team
          const isIncoming = match.to_team?.id === team.id || match.to_team === team.id;
          const rivalName = isIncoming ? match.from_team?.name : match.to_team?.name;
          const myScore = isIncoming ? match.score_to_team : match.score_from_team;
          const rivalScore = isIncoming ? match.score_from_team : match.score_to_team;
          
          let result = 'E';
          if (myScore > rivalScore) result = 'V';
          else if (myScore < rivalScore) result = 'D';

          return {
            id: match.id,
            rival: rivalName || 'Desconocido',
            result,
            score: myScore !== null && rivalScore !== null ? `${myScore}-${rivalScore}` : '?-?',
            date: new Date(match.created_at).toLocaleDateString(),
          };
        });
        setMatchHistory(history);
      }
    };
    fetchHistory();
  }, [team]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase.from('cl_users').select('*').eq('id', user.id).single();
      if (data) setUserProfile(mapUser(data));
    });
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  async function handleToggleLooking(value: boolean) {
    if (!userProfile) return;
    try {
      await supabase.from('cl_users').update({ looking_for_team: value }).eq('id', userProfile.id);
      setUserProfile(prev => prev ? { ...prev, lookingForTeam: value } : prev);
    } catch (e) {
      console.error(e);
    }
  }

  if (!team) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <View style={{alignItems: 'center', marginBottom: 32}}>
            <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.border, marginBottom: 12}}>
              <Text style={{fontSize: 40}}>{userProfile?.avatar || '🏃'}</Text>
            </View>
            <Text style={{fontSize: 22, fontWeight: '800', color: Colors.text}}>{userProfile?.name || 'Jugador'}</Text>
            {userProfile?.position ? (
              <Text style={{color: Colors.primary, fontWeight: '600', marginTop: 4}}>{userProfile.position} • {userProfile.sportPreference}</Text>
            ) : null}
          </View>

          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary, marginBottom: 16}}>
            <View style={{flex: 1, paddingRight: 16}}>
              <Text style={{color: Colors.text, fontSize: 16, fontWeight: '700', marginBottom: 4}}>Buscando equipo 🔥</Text>
              <Text style={{color: Colors.textMuted, fontSize: 13, lineHeight: 18}}>Aparecerás en el buscador de agentes libres para que los capitanes te contacten.</Text>
            </View>
            <Switch value={userProfile?.lookingForTeam || false} onValueChange={handleToggleLooking} trackColor={{true: Colors.primary}} />
          </View>

          <TouchableOpacity style={{backgroundColor: Colors.surface, padding: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border, marginBottom: 32}} onPress={() => require('expo-router').router.push('/profile/edit-player' as any)}>
            <Text style={{color: Colors.text, fontWeight: '600', fontSize: 15}}>✏️ Editar mi perfil de jugador</Text>
          </TouchableOpacity>

          <Text style={{color: Colors.textMuted, fontSize: 14, fontWeight: '600', marginBottom: 12, textAlign: 'center'}}>O si querés formar parte de un plantel:</Text>
          
          <View style={{flexDirection: 'row', gap: 12}}>
            <TouchableOpacity style={{flex: 1, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, alignItems: 'center'}} onPress={() => require('expo-router').router.push('/(auth)/create-team')}>
              <Text style={{fontSize: 15, fontWeight: '700', color: '#000'}}>Crear equipo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1, backgroundColor: Colors.surface, paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border}} onPress={() => require('expo-router').router.push('/team/join' as any)}>
              <Text style={{fontSize: 15, fontWeight: '700', color: Colors.text}}>Unirme con código</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={{marginTop: 40, alignItems: 'center', padding: 16}} onPress={() => supabase.auth.signOut()}>
            <Text style={{color: Colors.danger, fontWeight: '600'}}>Cerrar sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const total = team.wins + team.losses + team.draws;
  const winRate = total > 0 ? Math.round((team.wins / total) * 100) : 0;

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Mi Equipo</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => require('expo-router').router.push('/profile/edit-player' as any)}>
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
              const active = (team.availableDays ?? []).includes(fullDays[i]);
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
            <TouchableOpacity 
              style={styles.addMember}
              onPress={() => {
                if (team.inviteCode) {
                  Share.share({
                    message: `¡Únete a mi equipo en Cancha Libre!\nCódigo de invitación: ${team.inviteCode}\nO descargate la app.`,
                  });
                } else {
                  Alert.alert('No hay código', 'Tu equipo no tiene un código de invitación activo.');
                }
              }}
            >
              <Text style={styles.addMemberText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial reciente</Text>
          {matchHistory.length === 0 ? (
             <Text style={{color: Colors.textMuted, fontSize: 13}}>No hay partidos completados aún.</Text>
          ) : matchHistory.map((match, i) => (
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

        {team.inviteCode && (
          <View style={[styles.card, { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted }]}>
            <Text style={styles.cardTitle}>Código de invitación</Text>
            <Text style={{fontSize: 13, color: Colors.textMuted, marginBottom: 8}}>Compartí este código para que se unan a tu equipo:</Text>
            <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border}}>
              <Text style={{fontSize: 26, fontWeight: '800', letterSpacing: 6, color: Colors.primary}}>{team.inviteCode}</Text>
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.shareBtn}
            onPress={() => Share.share({ message: `¡Mirá mi equipo ${team.name} en Cancha Libre!\nNivel: ${team.level}\n\n¡Sumate o desafianos en la app!` })}
          >
            <Text style={styles.shareBtnText}>📤 Compartir perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
});
