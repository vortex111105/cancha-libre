import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { CONVERSATIONS } from '@/constants/MockData';
import { ChatItem } from '@/components/ChatItem';

export default function ChatListScreen() {
  const totalUnread = CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mensajes</Text>
          {totalUnread > 0 && (
            <Text style={styles.subtitle}>{totalUnread} mensaje{totalUnread > 1 ? 's' : ''} sin leer</Text>
          )}
        </View>
        <TouchableOpacity style={styles.composeBtn}>
          <Text style={styles.composeBtnText}>✏</Text>
        </TouchableOpacity>
      </View>

      {CONVERSATIONS.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Sin conversaciones</Text>
          <Text style={styles.emptyText}>
            Cuando aceptes o te respondan un desafío, el chat se abrirá automáticamente
          </Text>
        </View>
      ) : (
        <FlatList
          data={CONVERSATIONS}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ChatItem
              conversation={item}
              onPress={() => router.push(`/chat/${item.team.id}` as any)}
            />
          )}
          ItemSeparatorComponent={() => null}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  composeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  composeBtnText: { fontSize: 18 },
  list: { paddingBottom: 24 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
