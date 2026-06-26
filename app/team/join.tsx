import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useMyTeam } from '@/hooks/useMyTeam';

export default function JoinTeamModal() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { refetch } = useMyTeam();

  async function handleJoin() {
    if (code.length < 6) return Alert.alert('Error', 'El código debe tener al menos 6 caracteres');
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('join_team_by_code', { p_invite_code: code.toUpperCase() });
      if (error) throw error;
      
      // Joined successfully
      Alert.alert('¡Éxito!', 'Te uniste al equipo correctamente.', [
        { text: 'Ir al Home', onPress: () => {
          refetch().then(() => router.replace('/(tabs)/home'));
        }}
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo unir al equipo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <Text style={styles.emoji}>🤝</Text>
        <Text style={styles.title}>Unirse a un equipo</Text>
        <Text style={styles.subtitle}>Pedile el código de invitación al capitán e ingresalo acá abajo.</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            placeholder="EJ: X7B9KP"
            placeholderTextColor={Colors.textDim}
            maxLength={6}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity 
          style={[styles.joinBtn, (loading || code.length < 6) && { opacity: 0.5 }]} 
          onPress={handleJoin}
          disabled={loading || code.length < 6}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.joinBtnText}>Unirme ahora</Text>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
  inputContainer: { width: '100%', marginBottom: 24 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 20,
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 4,
  },
  joinBtn: {
    backgroundColor: Colors.primary,
    width: '100%',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  joinBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
