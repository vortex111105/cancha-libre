import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';
import { useMyTeam } from '@/hooks/useMyTeam';
import type { Team, Message } from '@/constants/MockData';

type RawMessage = {
  id: string;
  text: string;
  sender_team_id: string;
  created_at: string;
};

export default function ChatScreen() {
  const { id: otherTeamId } = useLocalSearchParams<{ id: string }>();
  const { teamId: myTeamId } = useMyTeam();

  const [otherTeam, setOtherTeam] = useState<Team | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const init = useCallback(async () => {
    if (!myTeamId || !otherTeamId) return;

    const { data: teamData } = await supabase
      .from('cl_teams')
      .select('*')
      .eq('id', otherTeamId)
      .single();

    if (teamData) setOtherTeam(mapTeam(teamData));

    const smaller = myTeamId < otherTeamId ? myTeamId : otherTeamId;
    const larger  = myTeamId < otherTeamId ? otherTeamId : myTeamId;

    const { data: existing } = await supabase
      .from('cl_conversations')
      .select('id')
      .eq('team1_id', smaller)
      .eq('team2_id', larger)
      .maybeSingle();

    let convId = existing?.id;
    if (!convId) {
      const { data: created } = await supabase
        .from('cl_conversations')
        .insert({ team1_id: smaller, team2_id: larger })
        .select('id')
        .single();
      convId = created?.id;
    }

    if (!convId) { setLoading(false); return; }
    setConversationId(convId);

    const { data: msgs } = await supabase
      .from('cl_messages')
      .select('id, text, sender_team_id, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    setMessages(rawToMessages(msgs ?? [], myTeamId));
    setLoading(false);
  }, [myTeamId, otherTeamId]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cl_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as RawMessage;
          setMessages(prev => [
            ...prev,
            {
              id: raw.id,
              text: raw.text,
              sender: raw.sender_team_id === myTeamId ? 'me' : 'them',
              time: new Date(raw.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, myTeamId]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || !myTeamId) return;
    const text = input.trim();
    setInput('');
    await supabase.from('cl_messages').insert({
      conversation_id: conversationId,
      sender_team_id: myTeamId,
      text,
    });
  };

  if (loading || !otherTeam) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <View style={[styles.avatar, { borderColor: otherTeam.color }]}>
          <Text style={styles.avatarText}>{otherTeam.avatar}</Text>
        </View>
        <View>
          <Text style={styles.teamName}>{otherTeam.name}</Text>
          <Text style={styles.teamSub}>{otherTeam.neighborhood} · {otherTeam.sport}</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Text style={styles.infoBtnText}>ℹ</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Empezá la conversación con {otherTeam.name}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[
              styles.messageWrapper,
              item.sender === 'me' ? styles.messageRight : styles.messageLeft,
            ]}>
              <View style={[
                styles.bubble,
                item.sender === 'me' ? styles.bubbleMe : styles.bubbleThem,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  item.sender === 'me' ? styles.bubbleTextMe : styles.bubbleTextThem,
                ]}>
                  {item.text}
                </Text>
              </View>
              <Text style={[
                styles.msgTime,
                item.sender === 'me' ? styles.msgTimeRight : styles.msgTimeLeft,
              ]}>
                {item.time}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachBtnText}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Escribí un mensaje..."
            placeholderTextColor={Colors.textDim}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Text style={styles.sendBtnText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function rawToMessages(rows: RawMessage[], myTeamId: string): Message[] {
  return rows.map(row => ({
    id: row.id,
    text: row.text,
    sender: row.sender_team_id === myTeamId ? 'me' : 'them',
    time: new Date(row.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
  }));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  flex: { flex: 1 },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: { fontSize: 20 },
  teamName: { fontSize: 16, fontWeight: '700', color: Colors.text },
  teamSub: { fontSize: 12, color: Colors.textMuted },
  infoBtn: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtnText: { fontSize: 18, color: Colors.textMuted },
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80 },
  emptyChatText: { fontSize: 14, color: Colors.textDim, textAlign: 'center' },
  messageList: { paddingHorizontal: 16, paddingVertical: 16, gap: 4, flexGrow: 1 },
  messageWrapper: { marginBottom: 10 },
  messageLeft: { alignItems: 'flex-start' },
  messageRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextMe: { color: '#000', fontWeight: '500' },
  bubbleTextThem: { color: Colors.text },
  msgTime: { fontSize: 10, color: Colors.textDim, marginTop: 3 },
  msgTimeLeft: { marginLeft: 4 },
  msgTimeRight: { marginRight: 4 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  attachBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  attachBtnText: { fontSize: 20 },
  textInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  sendBtnText: { fontSize: 18, color: '#000', fontWeight: '700' },
});
