import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { useMyTeam } from '@/hooks/useMyTeam';

export default function PersonalProfileScreen() {
  const { team, loading: teamLoading } = useMyTeam();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUser(session.user);

      const { data: userData } = await supabase
        .from('cl_users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (userData) {
        setProfile(userData);
        setDisplayName(userData.display_name || '');
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    await supabase.from('cl_users').update({ display_name: displayName.trim() }).eq('id', user.id);
    setSaving(false);
    router.back();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/');
  };

  if (loading || teamLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(displayName || 'J')[0].toUpperCase()}</Text>
            </View>
            <Text style={[Typography.h2, styles.name]}>{displayName || 'Jugador'}</Text>
            <Text style={[Typography.body, styles.email]}>{user?.email}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[Typography.subtitle, styles.sectionTitle]}>Editar Nombre</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Ingresá tu nombre"
                placeholderTextColor={Colors.textDim}
              />
            </View>
            <TouchableOpacity 
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar Cambios</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[Typography.subtitle, styles.sectionTitle]}>Estadísticas</Text>
            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Miembro de</Text>
                <Text style={styles.statValue}>{team ? team.name : 'Sin equipo'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Rol</Text>
                <Text style={styles.statValue}>{team ? (profile?.id === team.user_id ? 'Capitán' : 'Jugador') : 'Libre'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.dangerZone}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 24, paddingBottom: 60 },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: 'Inter_800ExtraBold',
    color: Colors.primary,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    color: Colors.textMuted,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  input: {
    padding: 16,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.text,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    color: Colors.textMuted,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  statValue: {
    color: Colors.text,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  statDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  dangerZone: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 24,
  },
  logoutBtn: {
    backgroundColor: Colors.dangerMuted,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutBtnText: {
    color: Colors.danger,
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
});
