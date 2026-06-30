import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Typography } from '@/constants/Typography';
import { Challenge } from '@/constants/MockData';

interface Props {
  challenge: Challenge;
  onAccept?: () => void;
  onDecline?: () => void;
  onRate?: () => void;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: Colors.accent, bg: Colors.accentMuted },
  accepted: { label: 'Aceptado', color: Colors.primary, bg: Colors.primaryMuted },
  declined: { label: 'Rechazado', color: Colors.danger, bg: Colors.dangerMuted },
};

export function ChallengeCard({ challenge, onAccept, onDecline, onRate }: Props) {
  const { team, type, status, proposedDate, proposedTime, field, message, createdAt, isCompleted } = challenge;
  const statusStyle = statusLabels[status];
  const isIncoming = type === 'incoming';

  return (
    <LinearGradient
      colors={[Colors.cardAlt, Colors.card]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <View style={styles.teamRow}>
          <View style={[styles.avatar, { borderColor: team.color }]}>
            <Text style={styles.avatarText}>{team.avatar}</Text>
          </View>
          <View style={styles.teamInfo}>
            <Text style={[Typography.subtitle, styles.teamName]}>{team.name}</Text>
            <Text style={[Typography.label, styles.teamSub]}>{team.neighborhood} · {team.sport}</Text>
          </View>
        </View>
        <View style={styles.badges}>
          <View style={[styles.typeBadge, { backgroundColor: isIncoming ? Colors.blueMuted : Colors.primaryMuted }]}>
            <Text style={[styles.typeBadgeText, { color: isIncoming ? Colors.blue : Colors.primary }]}>
              {isIncoming ? '📥 Recibido' : '📤 Enviado'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow icon="📅" label={`${proposedDate} · ${proposedTime}`} />
        {field && <DetailRow icon="📍" label={field} />}
      </View>

      <View style={styles.messageBox}>
        <Text style={[Typography.body, styles.messageText]}>"{message}"</Text>
      </View>

      <Text style={[Typography.label, styles.createdAt]}>{createdAt}</Text>

      {isIncoming && status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.declineBtn} onPress={onDecline}>
            <Text style={styles.declineBtnText}>✕ Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Text style={styles.acceptBtnText}>✓ Aceptar</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'accepted' && !isCompleted && (
        <View style={{gap: 8}}>
          <View style={styles.acceptedBanner}>
            <Text style={styles.acceptedText}>✅ ¡Partido confirmado! Coordiná por el chat.</Text>
          </View>
          <TouchableOpacity style={styles.rateBtn} onPress={onRate}>
            <Text style={styles.rateBtnText}>⭐ Calificar Rival</Text>
          </TouchableOpacity>
        </View>
      )}
      {status === 'accepted' && isCompleted && (
        <View style={styles.acceptedBanner}>
          <Text style={styles.acceptedText}>⭐ Partido calificado</Text>
        </View>
      )}
    </LinearGradient>
  );
}

function DetailRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={[Typography.body, styles.detailLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    marginBottom: 16,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 24,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: Colors.text,
    fontSize: 17,
  },
  teamSub: {
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailIcon: {
    fontSize: 15,
  },
  detailLabel: {
    color: Colors.textMuted,
  },
  messageBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  messageText: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  createdAt: {
    fontSize: 11,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: Colors.dangerMuted,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  declineBtnText: {
    color: Colors.danger,
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  acceptBtnText: {
    color: '#000',
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 15,
  },
  acceptedBanner: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.3)',
  },
  acceptedText: {
    color: Colors.primary,
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  rateBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  rateBtnText: {
    color: '#000',
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 14,
  },
});
