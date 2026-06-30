import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function TournamentsComingSoonScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🏆</Text>
        </View>
        <Text style={styles.title}>Ligas y Torneos</Text>
        <Text style={styles.subtitle}>
          Estamos preparando la mejor experiencia competitiva para Cancha Libre. 
          Pronto podrás organizar y participar en torneos oficiales, ver tablas de posiciones, cruces de eliminación y mucho más.
        </Text>
        <Text style={styles.subtext}>
          ¡Seguí sumando puntos con tu equipo en partidos amistosos para clasificar a los primeros torneos!
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  icon: { fontSize: 60 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  subtext: { fontSize: 14, color: Colors.accent, fontWeight: '600', textAlign: 'center', lineHeight: 20, marginBottom: 40 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
