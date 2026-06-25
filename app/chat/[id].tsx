import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { TEAMS, MESSAGES, Message } from '@/constants/MockData';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = TEAMS.find(t => t.id === id) ?? TEAMS[0];

  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: `m${Date.now()}`,
      text: input.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <View style={[styles.avatar, { borderColor: team.color }]}>
          <Text style={styles.avatarText}>{team.avatar}</Text>
        </View>
        <View>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamSub}>{team.neighborhood} · {team.sport}</Text>
        </View>
        <TouchableOpacity style={styles.infoBtn}>
          <Text style={styles.infoBtnText}>ℹ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.matchBanner}>
        <Text style={styles.matchBannerText}>
          ⚡ Desafío pendiente · Sáb 28 Jun · 18:00
        </Text>
        <TouchableOpacity>
          <Text style={styles.matchBannerAction}>Ver →</Text>
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
          renderItem={({ item, index }) => {
            const prevMsg = messages[index - 1];
            const showTime = !prevMsg || prevMsg.sender !== item.sender;
            return (
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
            );
          }}
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
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.accent + '44',
  },
  matchBannerText: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  matchBannerAction: { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  messageList: { paddingHorizontal: 16, paddingVertical: 16, gap: 4 },
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
