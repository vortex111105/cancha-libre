import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

const SPORTS = ['Fútbol 5vs5', 'Fútbol 7vs7', 'Fútbol 8vs8', 'Fútbol 11vs11', 'Básquet 3x3', 'Básquet 5x5', 'Pádel Single (1vs1)', 'Pádel Parejas'];
const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const AVATARS = ['🦁', '🐺', '🦅', '🐯', '🦊', '🐻', '🦜', '🐬', '🦈', '🦏', '🐲', '⚡'];

export default function CreateTeamScreen() {
  const [teamName, setTeamName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [sport, setSport] = useState('Fútbol 5vs5');
  const [level, setLevel] = useState('Intermedio');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [avatar, setAvatar] = useState('🦁');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  async function handleCreateTeam() {
    if (!teamName.trim()) return Alert.alert('Error', 'El nombre del equipo es obligatorio');
    if (!neighborhood.trim()) return Alert.alert('Error', 'El barrio es obligatorio');

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('No hay sesión activa');

      let lat = null;
      let lng = null;
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        } catch (e) {
          console.log('Error getting location:', e);
        }
      }

      const { data: team, error: teamError } = await supabase
        .from('cl_teams')
        .insert({
          user_id: user.id,
          name: teamName.trim(),
          avatar,
          sport,
          level,
          neighborhood: neighborhood.trim(),
          city: 'Buenos Aires',
          description: description.trim() || null,
          available_days: selectedDays,
          color: '#4ADE80',
          lat,
          lng,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      const { error: userRecordError } = await supabase
        .from('cl_users')
        .upsert({
          id: user.id,
          email: user.email ?? '',
          team_id: team.id,
        });

      if (userRecordError) throw userRecordError;

      router.replace('/(tabs)/home');
    } catch (err: any) {
      Alert.alert('Error al crear el equipo', err.message ?? 'Intentalo de nuevo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.step}>Paso 2 de 2</Text>
          <Text style={styles.title}>Creá tu equipo</Text>
          <Text style={styles.subtitle}>Completá el perfil para empezar a desafiar</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elegí un escudo</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map(av => (
              <TouchableOpacity
                key={av}
                style={[styles.avatarBtn, avatar === av && styles.avatarBtnSelected]}
                onPress={() => setAvatar(av)}
              >
                <Text style={styles.avatarBtnText}>{av}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del equipo *</Text>
            <TextInput
              style={styles.input}
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Ej: Los Pibes del Bajo"
              placeholderTextColor={Colors.textDim}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Barrio *</Text>
            <TextInput
              style={styles.input}
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Ej: San Telmo"
              placeholderTextColor={Colors.textDim}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Contá algo de tu equipo..."
              placeholderTextColor={Colors.textDim}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modalidad</Text>
          <View style={styles.chipRow}>
            {SPORTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, sport === s && styles.chipSelected]}
                onPress={() => setSport(s)}
              >
                <Text style={[styles.chipText, sport === s && styles.chipTextSelected]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel de juego</Text>
          <View style={styles.chipRow}>
            {LEVELS.map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.chip, level === l && styles.chipSelectedAccent]}
                onPress={() => setLevel(l)}
              >
                <Text style={[styles.chipText, level === l && styles.chipTextAccent]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cuándo pueden jugar?</Text>
          <View style={styles.daysGrid}>
            {DAYS.map(day => (
              <TouchableOpacity
                key={day}
                style={[styles.dayBtn, selectedDays.includes(day) && styles.dayBtnSelected]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[styles.dayText, selectedDays.includes(day) && styles.dayTextSelected]}>
                  {day.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreateTeam}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.primaryBtnText}>⚽ ¡Crear mi equipo!</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  header: { paddingTop: 24, paddingBottom: 28, gap: 4 },
  step: { fontSize: 12, fontWeight: '600', color: Colors.primary, letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatarBtnSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  avatarBtnText: { fontSize: 26 },
  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipSelectedAccent: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  chipText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
  chipTextSelected: { color: Colors.primary },
  chipTextAccent: { color: Colors.accent },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBtnSelected: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  dayText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  dayTextSelected: { color: Colors.primary },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
});
