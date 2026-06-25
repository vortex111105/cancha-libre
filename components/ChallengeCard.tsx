import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Challenge } from '@/constants/MockData';

interface Props {
  challenge: Challenge;
  onAccept?: () => void;
  onDecline?: () => void;
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: Colors.accent, bg: Colors.accentMuted },
  accepted: { label: 'Aceptado', color: Colors.primary, bg: Colors.primaryMuted },
  declined: { label: 'Rechazado', color: Colors.danger, bg: Colors.dangerMuted },
};

export function ChallengeCard({ challenge, onAccept, onDecline }: Props) {
  const { team, type, status, proposedDate, proposedTime, field, message, createdAt } = challenge;
  const statusStyle = statusLabels[status];
  const isIncoming = type === 'incoming';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.teamRow}>
          <View style={[styles.avatar, { borderColor: team.color }]}>
            <Text style={styles.avatarText}>{team.avatar}</Text>
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{team.name}</Text>
            <Text style={styles.teamSub}>{team.neighborhood} · {team.sport}</Text>
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
        <Text style={styles.messageText}>"{message}"</Text>
      </View>

      <Text style={styles.createdAt}>{createdAt}</Text>

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

      {status === 'accepted' && (
        <View style={styles.acceptedBanner}>
          <Text style={styles.acceptedText}>✅ ¡Partido confirmado! Coordiná por el chat.</Text>
        </View>
      )}
    </View>
  );
}

function DetailRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    marginBottom: 12,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 22,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  teamSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    fontSize: 14,
  },
  detailLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  messageBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  messageText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  createdAt: {
    fontSize: 11,
    color: Colors.textDim,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    backgroundColor: Colors.dangerMuted,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  declineBtnText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  acceptBtn: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  acceptedBanner: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  acceptedText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
