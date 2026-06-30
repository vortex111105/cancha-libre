import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { mapField } from '@/lib/mappers';
import { Colors } from '@/constants/Colors';
import type { Field } from '@/constants/MockData';

const SPORTS = [
  'Fútbol 5vs5', 'Fútbol 7vs7', 'Fútbol 8vs8', 'Fútbol 11vs11',
  'Básquet 3x3', 'Básquet 5x5', 'Pádel Single (1vs1)', 'Pádel Parejas',
];

export default function EditFieldScreen() {
  const [field, setField] = useState<Field | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('cl_fields').select('*').eq('owner_id', user.id).single();
      if (data) {
        const f = mapField(data);
        setField(f);
        setName(f.name);
        setAddress(f.address);
        setDescription(f.description ?? '');
        setPrice(f.price ? String(f.price) : '');
        setSelectedSports(f.sports as string[]);
        setAvailable(f.available);
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleSport = (sport: string) => {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  async function handleSave() {
    if (!field) return;
    if (!name.trim()) return Alert.alert('Error', 'El nombre es obligatorio');
    if (!address.trim()) return Alert.alert('Error', 'La dirección es obligatoria');
    if (selectedSports.length === 0) return Alert.alert('Error', 'Seleccioná al menos un deporte');

    setSaving(true);
    const { error } = await supabase
      .from('cl_fields')
      .update({
        name: name.trim(),
        address: address.trim(),
        description: description.trim() || null,
        price: price ? parseFloat(price) : null,
        sports: selectedSports,
        available,
      })
      .eq('id', field.id);

    setSaving(false);
    if (error) {
      Alert.alert('Error al guardar', error.message);
    } else {
      Alert.alert('✅ Guardado', 'Los cambios se aplicaron correctamente');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <View style={styles.availableRow}>
            <View style={styles.availableInfo}>
              <Text style={styles.sectionTitle}>Estado de la cancha</Text>
              <Text style={styles.availableDesc}>
                {available ? 'Visible y disponible para reservas' : 'Oculta para los equipos'}
              </Text>
            </View>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
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
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Vestuarios, estacionamiento, servicios..."
              placeholderTextColor={Colors.textDim}
              multiline
              numberOfLines={4}
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

        <TouchableOpacity
          style={[styles.primaryBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.primaryBtnText}>Guardar cambios</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  availableRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availableInfo: { flex: 1, gap: 2 },
  availableDesc: { fontSize: 13, color: Colors.textMuted },
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
  textArea: { height: 100, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
