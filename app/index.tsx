import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';

const FEATURES = [
  {
    icon: '🎯',
    title: 'Desafiá equipos de tu nivel',
    desc: 'Encontrá rivales con la misma pasión cerca de tu barrio y agendá partidos fácil.',
  },
  {
    icon: '💬',
    title: 'Chat directo con rivales',
    desc: 'Coordiná horarios y condiciones sin salir de la app. Sin WhatsApp, sin drama.',
  },
  {
    icon: '🏟️',
    title: 'Consultá canchas disponibles',
    desc: 'Averiguá precios y horarios de canchas cerca tuyo y contactalas al instante.',
  },
  {
    icon: '⭐',
    title: 'Ganá reputación',
    desc: 'Calificá y sé calificado después de cada partido. Tu historial habla por vos.',
  },
];

export default function LandingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.logoRing}>
            <Text style={styles.logoEmoji}>⚽</Text>
          </View>
          <Text style={styles.appName}>Cancha Libre</Text>
          <Text style={styles.headline}>
            Encontrá rivales.{'\n'}Jugá más.
          </Text>
          <Text style={styles.tagline}>
            La app de fútbol, básquet y pádel amateur{'\n'}para equipos de Buenos Aires.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>500+</Text>
            <Text style={styles.statLabel}>equipos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1.2k</Text>
            <Text style={styles.statLabel}>partidos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>30+</Text>
            <Text style={styles.statLabel}>canchas</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureIconText}>{f.icon}</Text>
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sports */}
        <View style={styles.sportsRow}>
          {['⚽ Fútbol', '🏀 Básquet', '🎾 Pádel'].map(s => (
            <View key={s} style={styles.sportChip}>
              <Text style={styles.sportChipText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Empezar gratis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Ya tengo cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.canchaLink}
            onPress={() => router.push('/(cancha-onboarding)/register-cancha' as any)}
          >
            <Text style={styles.canchaLinkText}>🏟️  Soy dueño de una cancha →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 48 },

  hero: {
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: { fontSize: 52 },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  headline: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 44,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  features: { paddingHorizontal: 24, gap: 12, marginBottom: 28 },
  featureCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIconText: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 13, color: Colors.textMuted, lineHeight: 19 },

  sportsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 36,
    paddingHorizontal: 24,
  },
  sportChip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sportChipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '500' },

  ctaSection: { paddingHorizontal: 24, gap: 12 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#000' },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  canchaLink: { alignItems: 'center', paddingVertical: 12 },
  canchaLinkText: { fontSize: 13, color: Colors.textMuted, fontWeight: '500' },
});
