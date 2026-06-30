import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function RateChallengeScreen() {
  const { challengeId, teamId, isIncoming } = useLocalSearchParams<{ challengeId: string, teamId: string, isIncoming: string }>();
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor, selecciona una calificación.');
      return;
    }

    setLoading(true);
    try {
      // Fetch current team rating info
      const { data: teamData, error: teamError } = await supabase
        .from('cl_teams')
        .select('rating, rating_count')
        .eq('id', teamId)
        .single();
        
      if (teamError) throw teamError;

      const currentRating = teamData.rating || 0;
      const count = teamData.rating_count || 0;
      const newCount = count + 1;
      const newRating = ((currentRating * count) + rating) / newCount;

      // Update team rating
      const { error: updateTeamError } = await supabase
        .from('cl_teams')
        .update({ rating: newRating, rating_count: newCount })
        .eq('id', teamId);

      if (updateTeamError) throw updateTeamError;

      // Update challenge
      const updateData = isIncoming === 'true' 
        ? { is_completed: true, rating_to_team: rating }
        : { is_completed: true, rating_from_team: rating };

      const { error: challengeError } = await supabase
        .from('cl_challenges')
        .update(updateData)
        .eq('id', challengeId);

      if (challengeError) throw challengeError;

      Alert.alert('¡Gracias!', 'Has calificado al equipo rival.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'No se pudo enviar la calificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calificar Rival</Text>
        <Text style={styles.subtitle}>¿Qué te pareció el partido contra este equipo?</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={[styles.star, rating >= star ? styles.starSelected : {}]}>★</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.primaryBtn, (rating === 0 || loading) && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={rating === 0 || loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryBtnText}>Enviar Calificación</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },
  starsContainer: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  star: { fontSize: 48, color: Colors.surface, textShadowColor: Colors.border, textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 1 },
  starSelected: { color: Colors.primary, textShadowColor: Colors.primaryMuted },
  primaryBtn: { backgroundColor: Colors.primary, paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, width: '100%', alignItems: 'center' },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
