import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';

type ConvItem = {
  id: string;
  teamName: string;
  teamAvatar: string;
  teamColor: string;
  createdAt: string;
};

export default function CanchaMessagesScreen() {
  const [convs, setConvs] = useState<ConvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: fieldData } = await supabase
      .from('cl_fields')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!fieldData) { setLoading(false); setRefreshing(false); return; }

    const { data } = await supabase
      .from('cl_cancha_conversations')
      .select('id, created_at, team:cl_teams!team_id(name, avatar, color)')
      .eq('field_id', fieldData.id)
      .order('created_at', { ascending: false });

    setConvs((data ?? []).map((row: any) => ({
      id: row.id,
      teamName: row.team?.name ?? 'Equipo',
      teamAvatar: row.team?.avatar ?? '⚽',
      teamColor: row.team?.color ?? Colors.primary,
      createdAt: new Date(row.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
    })));
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  const onRefresh = useCallback(() => { setRefreshing(true); load(); }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consultas recibidas</Text>
        {convs.length > 0 && (
          <Text style={styles.subtitle}>{convs.length} conversación{convs.length > 1 ? 'es' : ''}</Text>
        )}
      </View>

      {convs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Sin consultas aún</Text>
          <Text style={styles.emptyText}>
            Cuando un equipo consulte algo sobre tu cancha, aparecerá acá.
          </Text>
        </View>
      ) : (
        <FlatList
          data={convs}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push(`/cancha-chat/${item.id}` as any)}
            >
              <View style={[styles.avatar, { borderColor: item.teamColor }]}>
                <Text style={styles.avatarText}>{item.teamAvatar}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.teamName}>{item.teamName}</Text>
                <Text style={styles.lastMsg}>Tocá para ver la consulta</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.date}>{item.createdAt}</Text>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  list: { paddingBottom: 24 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: { fontSize: 22 },
  info: { flex: 1 },
  teamName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  lastMsg: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  date: { fontSize: 12, color: Colors.textDim },
  arrow: { fontSize: 20, color: Colors.textDim },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
