import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="team/[id]"
          options={{
            title: 'Perfil del equipo',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            title: 'Chat',
            headerBackTitle: 'Volver',
          }}
        />
        <Stack.Screen
          name="challenge/new"
          options={{
            title: 'Nuevo desafío',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
