import { Tabs } from 'expo-router';
import { Colors } from '@/constants/Colors';

export default function CanchaPortalLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textDim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Mi Cancha', tabBarLabel: 'Inicio', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="availability"
        options={{ title: 'Horarios', tabBarLabel: 'Horarios', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="edit-field"
        options={{ title: 'Editar Cancha', tabBarLabel: 'Editar', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="messages"
        options={{ title: 'Mensajes', tabBarLabel: 'Mensajes', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Mi Perfil', tabBarLabel: 'Perfil', tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
