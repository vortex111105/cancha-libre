import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

const SPORTS = [
  'Fútbol 5vs5', 'Fútbol 7vs7', 'Fútbol 8vs8', 'Fútbol 11vs11',
  'Básquet 3x3', 'Básquet 5x5', 'Pádel Single (1vs1)', 'Pádel Parejas',
];

export default function SetupFieldScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSport = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  async function handleCreate() {
    if (!name.trim()) return Alert.alert('Error', 'El nombre de la cancha es obligatorio');
    if (!address.trim()) return Alert.alert('Error', 'La dirección es obligatoria');
    if (selectedSports.length === 0) return Alert.alert('Error', 'Seleccioná al menos un deporte');

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('No hay sesión activa');

      let lat = null;
      let lng = null;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({});
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        } catch {
          // geolocalización opcional
        }
      }

      const { error } = await supabase.from('cl_fields').insert({
        name: name.trim(),
        address: address.trim(),
        description: description.trim() || null,
        sports: selectedSports,
        price: price ? parseFloat(price) : null,
        lat,
        lng,
        available: true,
        owner_id: user.id,
      });
      if (error) throw error;

      router.replace('/(cancha-portal)/dashboard');
    } catch (err: any) {
      Alert.alert('Error al crear la cancha', err.message ?? 'Intentalo de nuevo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.step}>Paso 2 de 2</Text>
          <Text style={styles.title}>Datos de tu cancha</Text>
          <Text style={styles.subtitle}>Podés editar todo esto después desde el panel</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la cancha *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Complejo Deportivo Palermo"
              placeholderTextColor={Colors.textDim}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección *</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Ej: Av. del Libertador 4200, Palermo"
              placeholderTextColor={Colors.textDim}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Precio base por hora (ARS)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Ej: 3500"
              placeholderTextColor={Colors.textDim}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Contá algo de tu complejo, vestuarios, estacionamiento..."
              placeholderTextColor={Colors.textDim}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deportes disponibles *</Text>
          <View style={styles.chipRow}>
            {SPORTS.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, selectedSports.includes(s) && styles.chipSelected]}
                onPress={() => toggleSport(s)}
              >
                <Text style={[styles.chipText, selectedSports.includes(s) && styles.chipTextSelected]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.locationNote}>
          <Text style={styles.locationNoteText}>
            📍 Se detectará tu ubicación automáticamente para mostrar tu cancha en el mapa.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.primaryBtnText}>🏟️ ¡Crear mi cancha!</Text>
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
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  chipTextSelected: { color: Colors.primary },
  locationNote: {
    backgroundColor: Colors.blueMuted,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  locationNoteText: { fontSize: 13, color: Colors.blue, lineHeight: 18 },
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
