import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';

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
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Navbar */}
        <View style={styles.navbarContainer}>
          <View style={[styles.navbar, isDesktop && styles.maxWidthContainer]}>
            <View style={styles.logoRow}>
              <Text style={styles.navLogoEmoji}>⚽</Text>
              <Text style={styles.navLogoText}>CANCHA LIBRE</Text>
            </View>
            <View style={styles.navButtons}>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.navLoginBtn}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navRegisterBtn}
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.navRegisterBtnText}>Registrarse</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.mainContent, isDesktop && styles.maxWidthContainer]}>
          {/* Hero */}
          <LinearGradient
            colors={[Colors.card, Colors.bg]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.logoRing}>
              <Text style={styles.logoEmoji}>⚽</Text>
            </View>
            <Text style={[Typography.h1, styles.headline]}>
              Encontrá rivales.{'\n'}Jugá más.
            </Text>
            <Text style={[Typography.body, styles.tagline]}>
              La app de fútbol, básquet y pádel amateur para equipos de Buenos Aires.
              Conectá, desafiá y demostrá tu nivel.
            </Text>
            
            <View style={styles.ctaSection}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Empezar gratis</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.canchaLink}
                onPress={() => router.push('/(cancha-onboarding)/register-cancha' as any)}
              >
                <Text style={styles.canchaLinkText}>🏟️  Portal de Canchas →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>equipos inscriptos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1.2k</Text>
              <Text style={styles.statLabel}>partidos jugados</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>30+</Text>
              <Text style={styles.statLabel}>canchas asociadas</Text>
            </View>
          </View>

          {/* Sports */}
          <View style={styles.sportsRow}>
            {['⚽ Fútbol', '🏀 Básquet', '🎾 Pádel'].map(s => (
              <View key={s} style={styles.sportChip}>
                <Text style={styles.sportChipText}>{s}</Text>
              </View>
            ))}
          </View>

          {/* Features */}
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>{f.icon}</Text>
                </View>
                <View style={styles.featureText}>
                  <Text style={[Typography.subtitle, styles.featureTitle]}>{f.title}</Text>
                  <Text style={[Typography.body, styles.featureDesc]}>{f.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 Cancha Libre. Todos los derechos reservados.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 0 },
  maxWidthContainer: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  navbarContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navLogoEmoji: {
    fontSize: 24,
  },
  navLogoText: {
    color: Colors.text,
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 16,
    letterSpacing: 1,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  navLoginBtn: {
    color: Colors.textMuted,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  navRegisterBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  navRegisterBtnText: {
    color: '#000',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 48,
    borderRadius: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 24,
  },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 48 },
  headline: {
    textAlign: 'center',
    fontSize: 42,
    lineHeight: 48,
    marginBottom: 16,
  },
  tagline: {
    textAlign: 'center',
    color: Colors.textMuted,
    maxWidth: 500,
    marginBottom: 32,
    fontSize: 16,
  },
  ctaSection: {
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 320,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    color: '#000',
  },
  canchaLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  canchaLinkText: {
    fontSize: 14,
    color: Colors.textDim,
    fontFamily: 'Inter_600SemiBold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 0,
  },
  statItem: { flex: 1, alignItems: 'center', paddingHorizontal: 10 },
  statNumber: { fontSize: 28, fontFamily: 'Inter_800ExtraBold', color: Colors.primary },
  statLabel: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  sportsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  sportChip: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sportChipText: { color: Colors.textMuted, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 48,
  },
  featureCard: {
    width: '100%',
    flexDirection: 'row',
    gap: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  featureCardDesktop: {
    width: '48%',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.2)',
  },
  featureIconText: { fontSize: 24 },
  featureText: { flex: 1 },
  featureTitle: { color: Colors.text, marginBottom: 6, fontSize: 15 },
  featureDesc: { color: Colors.textDim, fontSize: 14, lineHeight: 20 },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    color: Colors.textDim,
    fontSize: 13,
  },
});
