import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import type { Team } from '@/constants/MockData';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';
import { useMyTeam } from '@/hooks/useMyTeam';

const TIME_SLOTS = ['18:00', '19:00', '20:00', '21:00', '22:00'];

function getNextDays(): string[] {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 6; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    if (i === 0) { days.push('Hoy'); continue; }
    if (i === 1) { days.push('Mañana'); continue; }
    days.push(d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }));
  }
  return days;
}

type Field = { id: string; name: string; address: string; sports: string[]; price: number; rating: number; available: boolean };

export default function NewChallengeScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { teamId: myTeamId } = useMyTeam();

  const [team, setTeam] = useState<Team | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [message, setMessage] = useState('');
  const [bookField, setBookField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const DAYS_AHEAD = getNextDays();
  const canSend = selectedDay && selectedTime && message.trim().length > 0;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from('cl_teams').select('*').eq('id', teamId).single(),
      supabase.from('cl_fields').select('*').eq('available', true),
    ]).then(([{ data: teamData }, { data: fieldsData }]) => {
      if (teamData) setTeam(mapTeam(teamData));
      setFields(fieldsData ?? []);
      setLoading(false);
    });
  }, [teamId]);

  const handleSend = async () => {
    if (!canSend || !myTeamId || !teamId) return;
    setSending(true);
    try {
      const smaller = myTeamId < teamId ? myTeamId : teamId;
      const larger  = myTeamId < teamId ? teamId : myTeamId;

      let convId: string | undefined;
      const { data: existing } = await supabase
        .from('cl_conversations')
        .select('id')
        .eq('team1_id', smaller)
        .eq('team2_id', larger)
        .maybeSingle();

      if (existing?.id) {
        convId = existing.id;
      } else {
        const { data: created } = await supabase
          .from('cl_conversations')
          .insert({ team1_id: smaller, team2_id: larger })
          .select('id')
          .single();
        convId = created?.id;
      }

      const { error } = await supabase.from('cl_challenges').insert({
        from_team: myTeamId,
        to_team: teamId,
        proposed_date: selectedDay,
        proposed_time: selectedTime,
        field_id: selectedField || null,
        message: message.trim(),
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        '¡Desafío enviado! ⚡',
        `${team?.name ?? 'El equipo'} recibirá tu propuesta y podrán coordinar por el chat.`,
        [{ text: 'Genial', onPress: () => router.dismissAll() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo enviar el desafío');
    } finally {
      setSending(false);
    }
  };

  if (loading || !team) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.teamPreview}>
          <View style={[styles.avatar, { borderColor: team.color }]}>
            <Text style={styles.avatarText}>{team.avatar}</Text>
          </View>
          <View>
            <Text style={styles.desafiandoLabel}>Desafiando a</Text>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamSub}>{team.neighborhood} · {team.sport} · {team.level}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cuándo juegan?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {DAYS_AHEAD.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.chip, selectedDay === day && styles.chipSelected]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.chipText, selectedDay === day && styles.chipTextSelected]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.timeGrid}>
            {TIME_SLOTS.map(time => (
              <TouchableOpacity
                key={time}
                style={[styles.timeBtn, selectedTime === time && styles.timeBtnSelected]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeBtnText, selectedTime === time && styles.timeBtnTextSelected]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {fields.length > 0 && (
          <View style={styles.section}>
            <View style={styles.fieldToggleRow}>
              <Text style={styles.sectionTitle}>Reservar cancha</Text>
              <TouchableOpacity
                style={[styles.toggle, bookField && styles.toggleOn]}
                onPress={() => setBookField(!bookField)}
              >
                <View style={[styles.toggleThumb, bookField && styles.toggleThumbOn]} />
              </TouchableOpacity>
            </View>
            {bookField ? (
              <View style={styles.fieldList}>
                {fields.map(field => (
                  <TouchableOpacity
                    key={field.id}
                    style={[
                      styles.fieldCard,
                      !field.available && styles.fieldCardDisabled,
                      selectedField === field.id && styles.fieldCardSelected,
                    ]}
                    onPress={() => field.available && setSelectedField(field.id)}
                    disabled={!field.available}
                  >
                    <View style={styles.fieldInfo}>
                      <Text style={styles.fieldName}>{field.name}</Text>
                      <Text style={styles.fieldAddress}>{field.address}</Text>
                      <Text style={styles.fieldSports}>{(field.sports ?? []).join(' · ')}</Text>
                      <TouchableOpacity
                        style={styles.consultBtn}
                        onPress={async () => {
                          if (!myTeamId) return;
                          const { data, error } = await supabase
                            .from('cl_cancha_conversations')
                            .upsert({ team_id: myTeamId, field_id: field.id }, { onConflict: 'team_id,field_id' })
                            .select('id')
                            .single();
                          if (!error && data) {
                            router.push(`/cancha-chat/${data.id}` as any);
                          }
                        }}
                      >
                        <Text style={styles.consultBtnText}>💬 Consultar</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.fieldRight}>
                      <Text style={styles.fieldPrice}>${(field.price ?? 0).toLocaleString()}/h</Text>
                      <Text style={styles.fieldRating}>⭐ {field.rating}</Text>
                      {!field.available && (
                        <View style={styles.occupiedBadge}>
                          <Text style={styles.occupiedText}>Ocupada</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.fieldNote}>
                Activá esta opción para reservar la cancha directamente desde la app. El costo se divide automáticamente entre ambos equipos.
              </Text>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mensaje al equipo</Text>
          <TextInput
            style={styles.messageInput}
            value={message}
            onChangeText={setMessage}
            placeholder="Ej: ¡Los desafiamos a un partido amistoso! Tenemos disponibilidad flexible."
            placeholderTextColor={Colors.textDim}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{message.length}/200</Text>
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, (!canSend || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!canSend || sending}
        >
          {sending
            ? <ActivityIndicator color="#000" />
            : <Text style={[styles.sendBtnText, !canSend && styles.sendBtnTextDisabled]}>⚡ Enviar desafío</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  teamPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: { fontSize: 28 },
  desafiandoLabel: { fontSize: 12, color: Colors.textDim, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  teamName: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 2 },
  teamSub: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  chipTextSelected: { color: Colors.primary },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeBtnSelected: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  timeBtnText: { fontSize: 15, color: Colors.textMuted, fontWeight: '600' },
  timeBtnTextSelected: { color: Colors.primary },
  fieldToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
  },
  toggleOn: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.textDim,
  },
  toggleThumbOn: {
    backgroundColor: Colors.primary,
    transform: [{ translateX: 20 }],
  },
  fieldNote: { fontSize: 13, color: Colors.textMuted, lineHeight: 19 },
  fieldList: { gap: 10 },
  fieldCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  fieldCardDisabled: { opacity: 0.5 },
  fieldCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  fieldInfo: { flex: 1, gap: 3 },
  fieldName: { fontSize: 14, fontWeight: '700', color: Colors.text },
  fieldAddress: { fontSize: 12, color: Colors.textMuted },
  fieldSports: { fontSize: 11, color: Colors.primary, fontWeight: '600' },
  consultBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.blueMuted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  consultBtnText: { fontSize: 12, color: Colors.blue, fontWeight: '600' },
  fieldRight: { alignItems: 'flex-end', gap: 4 },
  fieldPrice: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  fieldRating: { fontSize: 12, color: Colors.textMuted },
  occupiedBadge: {
    backgroundColor: Colors.dangerMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  occupiedText: { fontSize: 10, color: Colors.danger, fontWeight: '600' },
  messageInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: { fontSize: 11, color: Colors.textDim, alignSelf: 'flex-end' },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  sendBtnDisabled: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  sendBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
  sendBtnTextDisabled: { color: Colors.textDim },
});
