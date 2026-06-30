import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import type { FieldSlot } from '@/constants/MockData';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 7hs a 22hs

interface Props {
  slots: FieldSlot[];
  onToggle: (dayOfWeek: number, hour: number) => void;
}

function isActive(slots: FieldSlot[], day: number, hour: number): boolean {
  return slots.some(
    s => s.dayOfWeek === day &&
      parseInt(s.startTime.split(':')[0]) === hour
  );
}

export default function AvailabilityGrid({ slots, onToggle }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header de días */}
        <View style={styles.headerRow}>
          <View style={styles.hourLabel} />
          {DAYS.map(d => (
            <View key={d} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Filas por hora */}
        {HOURS.map(hour => (
          <View key={hour} style={styles.row}>
            <View style={styles.hourLabel}>
              <Text style={styles.hourText}>{hour}hs</Text>
            </View>
            {DAYS.map((_, dayIdx) => {
              const active = isActive(slots, dayIdx, hour);
              return (
                <TouchableOpacity
                  key={dayIdx}
                  style={[styles.cell, active && styles.cellActive]}
                  onPress={() => onToggle(dayIdx, hour)}
                  activeOpacity={0.7}
                >
                  {active && <Text style={styles.cellCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Leyenda */}
        <View style={styles.legend}>
          <View style={[styles.legendDot, styles.cellActive]} />
          <Text style={styles.legendText}>Disponible</Text>
          <View style={[styles.legendDot, styles.cell]} />
          <Text style={styles.legendText}>No disponible</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const CELL_SIZE = 40;
const HOUR_WIDTH = 44;

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', marginBottom: 4 },
  dayHeader: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: 6,
  },
  dayHeaderText: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
  row: { flexDirection: 'row', marginBottom: 4 },
  hourLabel: {
    width: HOUR_WIDTH,
    justifyContent: 'center',
  },
  hourText: { fontSize: 11, color: Colors.textDim, fontWeight: '500' },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  cellCheck: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingLeft: HOUR_WIDTH,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  legendText: { fontSize: 12, color: Colors.textMuted, marginRight: 12 },
});
