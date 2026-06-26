import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useMyTeam } from '@/hooks/useMyTeam';

export default function EditPlayerScreen() {
  const { userProfile, refetch, loading: profileLoading } = useMyTeam();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🏃');
  const [sportPref, setSportPref] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setAvatar(userProfile.avatar);
      setSportPref(userProfile.sportPreference);
      setPosition(userProfile.position);
      setBio(userProfile.bio);
    }
  }, [userProfile]);

  async function handleSave() {
    if (!userProfile) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('cl_users').update({
        name, avatar, sport_preference: sportPref, position, bio
      }).eq('id', userProfile.id);
      
      if (error) throw error;
      
      await refetch();
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  if (profileLoading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color={Colors.primary} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Mi Perfil de Jugador</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Avatar (Emoji)</Text>
            <TextInput style={styles.input} value={avatar} onChangeText={setAvatar} maxLength={2} />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Lionel Messi" placeholderTextColor={Colors.textDim} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Deporte favorito</Text>
            <TextInput style={styles.input} value={sportPref} onChangeText={setSportPref} placeholder="Ej: Fútbol 5, Pádel..." placeholderTextColor={Colors.textDim} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Posición o Nivel</Text>
            <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholder="Ej: Mediocampista, Categoría 5ta" placeholderTextColor={Colors.textDim} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sobre mí (Bio)</Text>
            <TextInput style={[styles.input, {height: 80}]} multiline value={bio} onChangeText={setBio} placeholder="Contanos de tu estilo de juego..." placeholderTextColor={Colors.textDim} />
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Guardar perfil</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: Colors.textMuted, marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#000' }
});
