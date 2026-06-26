import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';
import { useMyTeam } from '@/hooks/useMyTeam';
import type { ChatConversation } from '@/constants/MockData';
import { ChatItem } from '@/components/ChatItem';

export default function ChatListScreen() {
  const { teamId } = useMyTeam();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!teamId) return;
    setLoading(true);
    const { data } = await supabase
      .from('cl_conversations')
      .select('id, team1_id, team2_id, created_at, team1:cl_teams!team1_id(*), team2:cl_teams!team2_id(*)')
      .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
      .order('created_at', { ascending: false });

    const mapped: ChatConversation[] = (data ?? []).map((row: any) => {
      const otherTeamRaw = row.team1_id === teamId ? row.team2 : row.team1;
      return {
        id: row.id,
        team: mapTeam(otherTeamRaw),
        lastMessage: 'Tocá para ver la conversación',
        lastMessageTime: new Date(row.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        unread: 0,
      };
    });
    setConversations(mapped);
    setLoading(false);
  }, [teamId]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mensajes</Text>
          {conversations.length > 0 && (
            <Text style={styles.subtitle}>{conversations.length} conversación{conversations.length > 1 ? 'es' : ''}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.composeBtn}>
          <Text style={styles.composeBtnText}>✏</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Sin conversaciones</Text>
          <Text style={styles.emptyText}>
            Cuando aceptes o te respondan un desafío, el chat se abrirá automáticamente
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
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
