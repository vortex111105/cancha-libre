import { useEffect, useState } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    if (expoPushToken?.data) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          await supabase.from('cl_users').update({ push_token: expoPushToken.data }).eq('id', session.user.id);
        }
      });
    }
  }, [expoPushToken, ready]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)/login');
      }
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/(tabs)/home');
      } else if (event === 'SIGNED_OUT') {
        router.replace('/(auth)/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

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
          name="team/join"
          options={{
            title: 'Unirse a equipo',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="profile/edit-player"
          options={{
            title: 'Editar perfil',
            headerBackTitle: 'Volver',
            presentation: 'modal',
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
        <Stack.Screen
          name="challenge/rate"
          options={{
            title: 'Calificar partido',
            headerBackTitle: 'Volver',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
