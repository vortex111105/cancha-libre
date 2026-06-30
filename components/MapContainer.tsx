import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Colors } from '@/constants/Colors';
import { Team } from '@/constants/MockData';

interface MapContainerProps {
  teams: Team[];
  onTeamPress: (team: Team) => void;
}

export function MapContainer({ teams, onTeamPress }: MapContainerProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado.');
        return;
      }
      try {
        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
      } catch (err) {
        setErrorMsg('No se pudo obtener la ubicación.');
      }
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.center}>
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : <ActivityIndicator color={Colors.primary} size="large" />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        {teams.map(team => {
          if (!team.lat || !team.lng) return null;
          return (
            <Marker
              key={team.id}
              coordinate={{ latitude: team.lat, longitude: team.lng }}
              title={team.name}
              description={team.sport}
              onCalloutPress={() => onTeamPress(team)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    borderRadius: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: Colors.border, 
    marginTop: 12,
    marginHorizontal: 20,
    marginBottom: 20
  },
  map: { width: '100%', height: '100%' },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: 300, 
    backgroundColor: Colors.surface, 
    borderRadius: 16, 
    marginTop: 12, 
    marginHorizontal: 20,
    borderWidth: 1, 
    borderColor: Colors.border 
  },
  error: { color: Colors.danger, fontWeight: '600' }
});
