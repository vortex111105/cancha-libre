import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { mapField } from '@/lib/mappers';
import { Colors } from '@/constants/Colors';
import type { Field } from '@/constants/MockData';

export default function CanchaDashboard() {
  const [field, setField] = useState<Field | null>(null);
  const [slotsCount, setSlotsCount] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [fieldRes, slotsRes, challengesRes] = await Promise.all([
      supabase.from('cl_fields').select('*').eq('owner_id', user.id).single(),
      supabase.from('cl_field_slots').select('id', { count: 'exact' })
        .eq('field_id', (await supabase.from('cl_fields').select('id').eq('owner_id', user.id).single()).data?.id ?? '')
        .eq('is_booked', false),
      supabase.from('cl_challenges').select('id', { count: 'exact' })
        .eq('status', 'accepted'),
    ]);

    if (fieldRes.data) setField(mapField(fieldRes.data));
    setSlotsCount(slotsRes.count ?? 0);
    setBookingsCount(challengesRes.count ?? 0);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!field) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🏟️</Text>
          <Text style={styles.emptyTitle}>Aún no tenés una cancha</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace('/(cancha-onboarding)/setup-field')}
          >
            <Text style={styles.primaryBtnText}>Crear mi cancha</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const winRate = field.rating > 0 ? Math.round(field.rating * 20) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🏟️</Text>
          <Text style={styles.heroName}>{field.name}</Text>
          <Text style={styles.heroAddress}>{field.address}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              {field.available ? '🟢 Disponible' : '🔴 No disponible'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{slotsCount}</Text>
            <Text style={styles.statLabel}>Slots libres</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bookingsCount}</Text>
            <Text style={styles.statLabel}>Reservas totales</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{field.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Calificación</Text>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Precio base</Text>
          <Text style={styles.priceText}>
            ${field.price.toLocaleString('es-AR')} <Text style={styles.priceUnit}>/ hora</Text>
          </Text>
        </View>

        {/* Deportes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏅 Deportes habilitados</Text>
          <View style={styles.chipRow}>
            {field.sports.map(s => (
              <View key={s} style={styles.chip}>
                <Text style={styles.chipText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Descripción */}
        {!!field.description && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Descripción</Text>
            <Text style={styles.descText}>{field.description}</Text>
          </View>
        )}

        {/* Accesos rápidos */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(cancha-portal)/availability')}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Gestionar horarios</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/(cancha-portal)/edit-field')}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionLabel}>Editar cancha</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, padding: 24 },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  hero: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  heroIcon: { fontSize: 56 },
  heroName: { fontSize: 26, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  heroAddress: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  heroBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  heroBadgeText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: '500', marginTop: 2, textAlign: 'center' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  priceText: { fontSize: 28, fontWeight: '800', color: Colors.text },
  priceUnit: { fontSize: 16, fontWeight: '400', color: Colors.textMuted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  descText: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  emptyIcon: { fontSize: 56 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
});
