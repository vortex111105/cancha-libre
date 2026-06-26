import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Level, Sport, Team } from '@/constants/MockData';
import { TeamCard } from '@/components/TeamCard';
import { supabase } from '@/lib/supabase';
import { mapTeam } from '@/lib/mappers';

const SPORTS: (Sport | 'Todos')[] = ['Todos', 'Fútbol 5vs5', 'Fútbol 7vs7', 'Fútbol 8vs8', 'Fútbol 11vs11', 'Básquet 3x3', 'Básquet 5x5', 'Pádel Single (1vs1)', 'Pádel Parejas'];
const LEVELS: (Level | 'Todos')[] = ['Todos', 'Principiante', 'Intermedio', 'Avanzado'];
const DISTANCES = ['Todos', '< 2km', '< 5km', '< 10km'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<Sport | 'Todos'>('Todos');
  const [level, setLevel] = useState<Level | 'Todos'>('Todos');
  const [distance, setDistance] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      const { data } = await supabase.from('cl_teams').select('*');
      setTeams((data ?? []).map(mapTeam));
      setLoading(false);
    }
    fetchTeams();
  }, []);

  const filtered = teams.filter(t => {
    const matchName = t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.neighborhood.toLowerCase().includes(query.toLowerCase());
    const matchSport = sport === 'Todos' || t.sport === sport;
    const matchLevel = level === 'Todos' || t.level === level;
    const matchDist =
      distance === 'Todos' ? true :
      distance === '< 2km' ? t.distance < 2 :
      distance === '< 5km' ? t.distance < 5 :
      t.distance < 10;
    return matchName && matchSport && matchLevel && matchDist;
  });

  const activeFilters = [sport, level, distance].filter(f => f !== 'Todos').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buscar equipos</Text>
        <Text style={styles.subtitle}>{filtered.length} equipos disponibles</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Nombre o barrio..."
            placeholderTextColor={Colors.textDim}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilters > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterBtnText}>⚙ {activeFilters > 0 ? activeFilters : ''}</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <FilterSection
            label="Modalidad"
            options={SPORTS}
            selected={sport}
            onSelect={(v) => setSport(v as Sport | 'Todos')}
            activeColor={Colors.primary}
          />
          <FilterSection
            label="Nivel"
            options={LEVELS}
            selected={level}
            onSelect={(v) => setLevel(v as Level | 'Todos')}
            activeColor={Colors.accent}
          />
          <FilterSection
            label="Distancia"
            options={DISTANCES}
            selected={distance}
            onSelect={setDistance}
            activeColor={Colors.blue}
          />
          {activeFilters > 0 && (
            <TouchableOpacity
              style={styles.clearFilters}
              onPress={() => { setSport('Todos'); setLevel('Todos'); setDistance('Todos'); }}
            >
              <Text style={styles.clearFiltersText}>✕ Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🤷‍♂️</Text>
            <Text style={styles.emptyTitle}>No hay resultados</Text>
            <Text style={styles.emptyText}>Probá cambiando los filtros o buscando otro nombre</Text>
          </View>
        ) : (
          filtered.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onPress={() => router.push(`/team/${team.id}` as any)}
              onChallenge={() => router.push(`/challenge/new?teamId=${team.id}` as any)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterSection({
  label, options, selected, onSelect, activeColor,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  activeColor: string;
}) {
  return (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterChips}>
          {options.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                selected === opt && { backgroundColor: activeColor + '22', borderColor: activeColor },
              ]}
              onPress={() => onSelect(opt)}
            >
              <Text style={[styles.chipText, selected === opt && { color: activeColor }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text },
  clearIcon: { fontSize: 14, color: Colors.textDim },
  filterBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  filterBtnText: { fontSize: 15, color: Colors.text, fontWeight: '600' },
  filtersPanel: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  filterSection: { gap: 8 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChips: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },
  clearFilters: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.dangerMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  clearFiltersText: { color: Colors.danger, fontSize: 12, fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 24 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});
