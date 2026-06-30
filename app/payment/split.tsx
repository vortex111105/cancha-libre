import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function SplitPaymentScreen() {
  const { challengeId, fieldName, fieldPrice, date } = useLocalSearchParams<{ 
    challengeId: string; 
    fieldName: string; 
    fieldPrice: string; 
    date: string;
  }>();

  const [players, setPlayers] = useState(5);
  const [loading, setLoading] = useState(false);

  const price = parseInt(fieldPrice || '0');
  const deposit = price * 0.3; // 30% seña
  const perPlayer = deposit / players;

  const handlePay = async () => {
    setLoading(true);
    // Simular retraso de API de Mercado Pago
    setTimeout(async () => {
      try {
        await supabase.from('cl_challenges').update({ 
          status: 'accepted',
          payment_status: 'paid'
        }).eq('id', challengeId);
        
        router.replace('/payment/success');
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Asegurar Reserva</Text>
        <Text style={styles.subtitle}>Dividí la seña con tu equipo usando Mercado Pago</Text>

        <View style={styles.receipt}>
          <Text style={styles.receiptTitle}>{fieldName || 'Cancha Seleccionada'}</Text>
          <Text style={styles.receiptDate}>📅 {date || 'Día a confirmar'}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.label}>Costo total de la cancha</Text>
            <Text style={styles.value}>${price.toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.labelHighlight}>Seña requerida (30%)</Text>
            <Text style={styles.valueHighlight}>${deposit.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.splitControl}>
          <Text style={styles.splitLabel}>¿Entre cuántos dividen la seña hoy?</Text>
          <View style={styles.stepper}>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => setPlayers(Math.max(1, players - 1))}
            >
              <Text style={styles.stepBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.playersCount}>{players} jugadores</Text>
            <TouchableOpacity 
              style={styles.stepBtn} 
              onPress={() => setPlayers(Math.min(15, players + 1))}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>A pagar ahora</Text>
          <Text style={styles.totalValue}>${perPlayer.toLocaleString(undefined, {maximumFractionDigits: 0})}</Text>
          <Text style={styles.totalNote}>El resto se le transfiere a la cancha después</Text>
        </View>

        <TouchableOpacity 
          style={[styles.mpBtn, loading && { opacity: 0.7 }]} 
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.mpBtnText}>💳 Pagar con Mercado Pago</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={loading}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },
  receipt: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  receiptTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  receiptDate: { fontSize: 13, color: Colors.textDim },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: Colors.textMuted },
  value: { fontSize: 14, fontWeight: '600', color: Colors.text },
  labelHighlight: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  valueHighlight: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  splitControl: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  splitLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 16 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  stepBtnText: { fontSize: 24, color: Colors.text, lineHeight: 28 },
  playersCount: { fontSize: 16, fontWeight: '700', color: Colors.text, width: 100, textAlign: 'center' },
  totalBox: { alignItems: 'center', marginBottom: 32 },
  totalLabel: { fontSize: 13, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { fontSize: 48, fontWeight: '800', color: Colors.text, marginVertical: 4 },
  totalNote: { fontSize: 12, color: Colors.textDim },
  mpBtn: {
    backgroundColor: '#009EE3', // Color oficial MP
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  mpBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cancelBtn: { paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: Colors.textMuted, fontWeight: '600' },
});
