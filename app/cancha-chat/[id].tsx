import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useMyTeam } from '@/hooks/useMyTeam';

type RawMsg = {
  id: string;
  text: string;
  sender_type: 'team' | 'cancha';
  sender_id: string;
  created_at: string;
};

type ChatMsg = {
  id: string;
  text: string;
  sender: 'me' | 'them';
  time: string;
};

type ConvInfo = {
  teamName: string;
  teamAvatar: string;
  fieldName: string;
};

export default function CanchaChatScreen() {
  const { id: conversationId } = useLocalSearchParams<{ id: string }>();
  const { teamId: myTeamId } = useMyTeam();

  const [role, setRole] = useState<'player' | 'cancha_owner' | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [convInfo, setConvInfo] = useState<ConvInfo | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  const init = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !conversationId) return;

    const { data: userData } = await supabase
      .from('cl_users')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = userData?.role ?? 'player';
    setRole(userRole);

    const resolvedMyId = userRole === 'cancha_owner' ? user.id : (myTeamId ?? null);
    setMyId(resolvedMyId);

    const { data: conv } = await supabase
      .from('cl_cancha_conversations')
      .select('id, team:cl_teams!team_id(name, avatar), field:cl_fields!field_id(name)')
      .eq('id', conversationId)
      .single();

    if (conv) {
      const team = conv.team as any;
      const field = conv.field as any;
      setConvInfo({
        teamName: team?.name ?? 'Equipo',
        teamAvatar: team?.avatar ?? '⚽',
        fieldName: field?.name ?? 'Cancha',
      });
    }

    const { data: msgs } = await supabase
      .from('cl_cancha_messages')
      .select('id, text, sender_type, sender_id, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(rawToChat(msgs ?? [], resolvedMyId ?? '', userRole));
    setLoading(false);
  }, [conversationId, myTeamId]);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!conversationId || !myId) return;

    const channel = supabase
      .channel(`cancha-chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cl_cancha_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const raw = payload.new as RawMsg;
          const isMe = role === 'cancha_owner'
            ? raw.sender_type === 'cancha' && raw.sender_id === myId
            : raw.sender_type === 'team' && raw.sender_id === myId;

          setMessages(prev => [...prev, {
            id: raw.id,
            text: raw.text,
            sender: isMe ? 'me' : 'them',
            time: new Date(raw.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          }]);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, myId, role]);

  const handleSend = async () => {
    if (!input.trim() || !conversationId || !myId) return;
    const text = input.trim();
    setInput('');
    await supabase.from('cl_cancha_messages').insert({
      conversation_id: conversationId,
      sender_type: role === 'cancha_owner' ? 'cancha' : 'team',
      sender_id: myId,
      text,
    });
  };

  if (loading || !convInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const headerTitle = role === 'cancha_owner'
    ? `${convInfo.teamAvatar} ${convInfo.teamName}`
    : `🏟️ ${convInfo.fieldName}`;

  const headerSub = role === 'cancha_owner'
    ? 'Consulta sobre tu cancha'
    : convInfo.fieldName;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {role === 'cancha_owner' ? convInfo.teamAvatar : '🏟️'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <Text style={styles.headerSub}>{headerSub}</Text>
        </View>
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
                {role === 'cancha_owner'
                  ? `${convInfo.teamName} quiere consultarte algo. Respondé acá.`
                  : `Consultale algo a ${convInfo.fieldName}.`}
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

function rawToChat(rows: RawMsg[], myId: string, role: string): ChatMsg[] {
  return rows.map(row => {
    const isMe = role === 'cancha_owner'
      ? row.sender_type === 'cancha' && row.sender_id === myId
      : row.sender_type === 'team' && row.sender_id === myId;
    return {
      id: row.id,
      text: row.text,
      sender: isMe ? 'me' : 'them',
      time: new Date(row.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  });
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
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  headerAvatarText: { fontSize: 20 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  headerSub: { fontSize: 12, color: Colors.textMuted },
  emptyChat: { flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyChatText: { fontSize: 14, color: Colors.textDim, textAlign: 'center', lineHeight: 20 },
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
  bubbleMe: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
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
