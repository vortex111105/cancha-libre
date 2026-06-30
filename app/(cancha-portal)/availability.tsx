import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { mapFieldSlot } from '@/lib/mappers';
import { Colors } from '@/constants/Colors';
import AvailabilityGrid from '@/components/AvailabilityGrid';
import type { FieldSlot } from '@/constants/MockData';

export default function AvailabilityScreen() {
  const [fieldId, setFieldId] = useState<string | null>(null);
  const [slots, setSlots] = useState<FieldSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: fieldData } = await supabase
      .from('cl_fields')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!fieldData) { setLoading(false); setRefreshing(false); return; }

    setFieldId(fieldData.id);

    const { data: slotsData } = await supabase
      .from('cl_field_slots')
      .select('*')
      .eq('field_id', fieldData.id)
      .order('day_of_week')
      .order('start_time');

    setSlots((slotsData ?? []).map(mapFieldSlot));
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  async function handleToggle(dayOfWeek: number, hour: number) {
    if (!fieldId) return;

    const startTime = `${String(hour).padStart(2, '0')}:00:00`;
    const endTime = `${String(hour + 1).padStart(2, '0')}:00:00`;

    const existing = slots.find(
      s => s.dayOfWeek === dayOfWeek && s.startTime.startsWith(`${String(hour).padStart(2, '0')}:`)
    );

    if (existing) {
      const { error } = await supabase
        .from('cl_field_slots')
        .delete()
        .eq('id', existing.id);
      if (error) { Alert.alert('Error', error.message); return; }
      setSlots(prev => prev.filter(s => s.id !== existing.id));
    } else {
      const { data, error } = await supabase
        .from('cl_field_slots')
        .insert({ field_id: fieldId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime })
        .select()
        .single();
      if (error) { Alert.alert('Error', error.message); return; }
      setSlots(prev => [...prev, mapFieldSlot(data)]);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!fieldId) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Primero creá tu cancha desde el Dashboard.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Horarios disponibles</Text>
          <Text style={styles.subtitle}>
            Tocá cada celda para marcar qué días y horas está disponible tu cancha.
          </Text>
        </View>

        <View style={styles.card}>
          <AvailabilityGrid slots={slots} onToggle={handleToggle} />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {slots.length} {slots.length === 1 ? 'slot disponible' : 'slots disponibles'} esta semana
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { paddingVertical: 20, gap: 6 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summary: {
    marginTop: 16,
    alignItems: 'center',
  },
  summaryText: { fontSize: 13, color: Colors.textMuted },
  emptyText: { fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
});
