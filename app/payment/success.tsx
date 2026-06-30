import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function PaymentSuccessScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>✅</Text>
        </View>
        <Text style={styles.title}>¡Seña Pagada!</Text>
        <Text style={styles.subtitle}>
          Tu pago se procesó con éxito en Mercado Pago.
        </Text>
        <Text style={styles.subtext}>
          El desafío fue aceptado y la cancha ya está avisada. 
          Podés coordinar los últimos detalles en el chat con tu rival.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.dismissAll()}>
          <Text style={styles.primaryBtnText}>Volver a Desafíos</Text>
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
    backgroundColor: 'rgba(0, 158, 227, 0.1)', // Celeste MP
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#009EE3',
  },
  icon: { fontSize: 60 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#009EE3', fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  subtext: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: 40 },
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
