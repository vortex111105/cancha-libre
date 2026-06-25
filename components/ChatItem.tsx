import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ChatConversation } from '@/constants/MockData';

interface Props {
  conversation: ChatConversation;
  onPress: () => void;
}

export function ChatItem({ conversation, onPress }: Props) {
  const { team, lastMessage, lastMessageTime, unread } = conversation;
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.avatar, { borderColor: team.color }]}>
        <Text style={styles.avatarText}>{team.avatar}</Text>
        {unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unread}</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.time}>{lastMessageTime}</Text>
        </View>
        <Text style={[styles.message, unread > 0 && styles.unreadMessage]} numberOfLines={1}>
          {lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  avatarText: {
    fontSize: 22,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  unreadText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  time: {
    fontSize: 12,
    color: Colors.textDim,
  },
  message: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  unreadMessage: {
    color: Colors.text,
    fontWeight: '500',
  },
});
