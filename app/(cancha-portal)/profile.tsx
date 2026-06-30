import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

interface OwnerProfile {
  email: string;
  name: string;
}

export default function CanchaProfileScreen() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setProfile({
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? 'Dueño',
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro que querés salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
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
      <ScrollView contentContainerStyle={styles.scroll}>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>🏟️</Text>
          </View>
          <Text style={styles.name}>{profile?.name}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Dueño de cancha</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💳 Pagos y comisiones</Text>
          <View style={styles.mpPlaceholder}>
            <Text style={styles.mpIcon}>🔗</Text>
            <Text style={styles.mpTitle}>Conectar Mercado Pago</Text>
            <Text style={styles.mpDesc}>
              Vinculá tu cuenta de MP para recibir el pago de las reservas automáticamente,
              descontando la comisión de Cancha Libre (3–5%).
            </Text>
            <View style={styles.mpBadge}>
              <Text style={styles.mpBadgeText}>Próximamente</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Cuenta</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>Dueño de cancha</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', paddingVertical: 32, gap: 6 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarIcon: { fontSize: 36 },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text },
  email: { fontSize: 14, color: Colors.textMuted },
  roleBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginTop: 4,
  },
  roleText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  mpPlaceholder: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  mpIcon: { fontSize: 32 },
  mpTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  mpDesc: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 18 },
  mpBadge: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  mpBadgeText: { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 14, color: Colors.textMuted },
  infoValue: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  logoutBtn: {
    backgroundColor: Colors.dangerMuted,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
